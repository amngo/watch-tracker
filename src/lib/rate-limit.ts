// Simple rate limiting implementation
// In production, you'd want to use Redis with proper distributed rate limiting

import type { TRPCContext, TRPCMiddlewareOpts } from '@/types'

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private windowMs: number
  private maxRequests: number

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  check(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.store.get(key)

    // No previous entry or window has expired
    if (!entry || now > entry.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.windowMs,
      }
      this.store.set(key, newEntry)
      
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: newEntry.resetTime,
      }
    }

    // Window hasn't expired, check if under limit
    if (entry.count < this.maxRequests) {
      entry.count++
      return {
        allowed: true,
        remaining: this.maxRequests - entry.count,
        resetTime: entry.resetTime,
      }
    }

    // Over the limit
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  reset(key: string): void {
    this.store.delete(key)
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }

  getStats() {
    return {
      activeKeys: this.store.size,
      windowMs: this.windowMs,
      maxRequests: this.maxRequests,
    }
  }
}

// Rate limiter instances for different endpoints
export const rateLimiters = {
  // General API rate limiting
  general: new RateLimiter(15 * 60 * 1000, 1000), // 1000 requests per 15 minutes
  
  // Search endpoints (more restrictive)
  search: new RateLimiter(60 * 1000, 30), // 30 searches per minute
  
  // TMDB API calls (very restrictive to respect their limits)
  tmdb: new RateLimiter(60 * 1000, 40), // 40 requests per minute (TMDB allows 40/10s)
  
  // User creation/modification
  userModification: new RateLimiter(60 * 1000, 10), // 10 modifications per minute
  
  // Public profile access
  publicProfile: new RateLimiter(60 * 1000, 60), // 60 profile views per minute
}

// Rate limit key generators
export const rateLimitKeys = {
  // By IP address
  byIP: (ip: string, endpoint: string) => `ip:${ip}:${endpoint}`,
  
  // By user ID
  byUser: (userId: string, endpoint: string) => `user:${userId}:${endpoint}`,
  
  // By session (for anonymous users)
  bySession: (sessionId: string, endpoint: string) => `session:${sessionId}:${endpoint}`,
  
  // Global endpoint limits
  global: (endpoint: string) => `global:${endpoint}`,
}

// Middleware function for tRPC
export function createRateLimitMiddleware(
  limiter: RateLimiter,
  keyGenerator: (ctx: TRPCContext) => string,
  errorMessage = 'Rate limit exceeded'
) {
  return async function rateLimitMiddleware(opts: TRPCMiddlewareOpts) {
    const key = keyGenerator(opts.ctx)
    const result = limiter.check(key)
    
    if (!result.allowed) {
      const resetTimeSeconds = Math.ceil((result.resetTime - Date.now()) / 1000)
      throw new Error(`${errorMessage}. Try again in ${resetTimeSeconds} seconds.`)
    }
    
    // Add rate limit info to context for response headers
    opts.ctx.rateLimit = {
      remaining: result.remaining,
      resetTime: result.resetTime,
    }
    
    return opts.next()
  }
}

// Helper function to get client IP
export function getClientIP(req: any): string {
  // Check various headers for the real IP
  const forwarded = req.headers['x-forwarded-for']
  const realIP = req.headers['x-real-ip']
  const clientIP = req.connection?.remoteAddress || 
                   req.socket?.remoteAddress || 
                   req.ip

  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim()
  }
  
  if (typeof realIP === 'string') {
    return realIP
  }
  
  return clientIP || 'unknown'
}

// Specific middleware creators
export const createSearchRateLimit = (ctx: any) => {
  const ip = getClientIP(ctx.req)
  return ctx.session?.userId 
    ? rateLimitKeys.byUser(ctx.session.userId, 'search')
    : rateLimitKeys.byIP(ip, 'search')
}

export const createTMDBRateLimit = (ctx: any) => {
  // TMDB rate limiting is global since it affects external API
  return rateLimitKeys.global('tmdb')
}

export const createUserModificationRateLimit = (ctx: any) => {
  if (!ctx.session?.userId) {
    throw new Error('Authentication required')
  }
  return rateLimitKeys.byUser(ctx.session.userId, 'user-modification')
}

export const createPublicProfileRateLimit = (ctx: any) => {
  const ip = getClientIP(ctx.req)
  return rateLimitKeys.byIP(ip, 'public-profile')
}

// Auto-cleanup job for rate limiters
let rateLimitCleanupInterval: NodeJS.Timeout | null = null

export const startRateLimitCleanup = (intervalMs = 5 * 60 * 1000) => {
  if (rateLimitCleanupInterval) {
    clearInterval(rateLimitCleanupInterval)
  }
  
  rateLimitCleanupInterval = setInterval(() => {
    Object.values(rateLimiters).forEach(limiter => {
      limiter.cleanup()
    })
  }, intervalMs)
}

export const stopRateLimitCleanup = () => {
  if (rateLimitCleanupInterval) {
    clearInterval(rateLimitCleanupInterval)
    rateLimitCleanupInterval = null
  }
}

// Start cleanup automatically on server
if (typeof window === 'undefined') {
  startRateLimitCleanup()
}

// Express-style rate limit headers helper
export function setRateLimitHeaders(res: any, rateLimit: { remaining: number; resetTime: number }) {
  if (res && res.setHeader) {
    res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString())
    res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimit.resetTime / 1000).toString())
    res.setHeader('X-RateLimit-Reset-MS', rateLimit.resetTime.toString())
  }
}