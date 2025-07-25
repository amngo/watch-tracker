// Simple in-memory cache implementation
// In production, you'd want to use Redis or similar

interface CacheEntry<T> {
  data: T
  expires: number
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttl = this.defaultTTL): void {
    const expires = Date.now() + ttl
    this.cache.set(key, { data, expires })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return false
    }

    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key)
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

// Cache instances with different TTLs
export const tmdbCache = new InMemoryCache() // For TMDB API responses
export const userCache = new InMemoryCache() // For user profile data
export const statsCache = new InMemoryCache() // For user statistics

// Cache key generators
export const cacheKeys = {
  tmdb: {
    search: (query: string, type: string, page: number) => 
      `tmdb:search:${type}:${encodeURIComponent(query)}:${page}`,
    details: (id: number, type: string) => 
      `tmdb:details:${type}:${id}`,
    trending: (mediaType: string, timeWindow: string) =>
      `tmdb:trending:${mediaType}:${timeWindow}`,
  },
  user: {
    profile: (username: string) => 
      `user:profile:${username}`,
    stats: (userId: string, timeRange: string) => 
      `user:stats:${userId}:${timeRange}`,
    watchlist: (username: string, status?: string, mediaType?: string, page = 1) =>
      `user:watchlist:${username}:${status || 'all'}:${mediaType || 'all'}:${page}`,
  },
  stats: {
    overview: (userId: string, timeRange: string) =>
      `stats:overview:${userId}:${timeRange}`,
    activity: (userId: string, timeRange: string, groupBy: string) =>
      `stats:activity:${userId}:${timeRange}:${groupBy}`,
    achievements: (userId: string) =>
      `stats:achievements:${userId}`,
  },
}

// Cache TTL configurations (in milliseconds)
export const cacheTTL = {
  tmdb: {
    search: 15 * 60 * 1000, // 15 minutes - search results change infrequently
    details: 60 * 60 * 1000, // 1 hour - movie/TV details rarely change
    trending: 30 * 60 * 1000, // 30 minutes - trending updates regularly
  },
  user: {
    profile: 5 * 60 * 1000, // 5 minutes - profile data changes occasionally
    stats: 10 * 60 * 1000, // 10 minutes - stats change when user adds items
    watchlist: 5 * 60 * 1000, // 5 minutes - watchlist changes frequently
  },
  stats: {
    overview: 15 * 60 * 1000, // 15 minutes - overview stats change slowly
    activity: 30 * 60 * 1000, // 30 minutes - activity data is historical
    achievements: 60 * 60 * 1000, // 1 hour - achievements unlock infrequently
  },
}

// Cache utility functions
export const withCache = {
  // Cache TMDB search results
  tmdbSearch: async <T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = cacheTTL.tmdb.search
  ): Promise<T> => {
    const cached = tmdbCache.get<T>(key)
    if (cached) {
      return cached
    }

    const data = await fetcher()
    tmdbCache.set(key, data, ttl)
    return data
  },

  // Cache user profile data
  userProfile: async <T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = cacheTTL.user.profile
  ): Promise<T> => {
    const cached = userCache.get<T>(key)
    if (cached) {
      return cached
    }

    const data = await fetcher()
    userCache.set(key, data, ttl)
    return data
  },

  // Cache user statistics
  userStats: async <T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = cacheTTL.stats.overview
  ): Promise<T> => {
    const cached = statsCache.get<T>(key)
    if (cached) {
      return cached
    }

    const data = await fetcher()
    statsCache.set(key, data, ttl)
    return data
  },
}

// Cache invalidation utilities
export const invalidateCache = {
  // Invalidate user-related caches when user data changes
  user: (userId: string, username?: string) => {
    // Clear user profile cache
    if (username) {
      userCache.delete(cacheKeys.user.profile(username))
    }
    
    // Clear user stats cache for all time ranges
    const timeRanges = ['week', 'month', 'quarter', 'year', 'all']
    timeRanges.forEach(range => {
      userCache.delete(cacheKeys.user.stats(userId, range))
      statsCache.delete(cacheKeys.stats.overview(userId, range))
      statsCache.delete(cacheKeys.stats.activity(userId, range, 'day'))
      statsCache.delete(cacheKeys.stats.activity(userId, range, 'week'))
      statsCache.delete(cacheKeys.stats.activity(userId, range, 'month'))
    })
    
    // Clear achievements cache
    statsCache.delete(cacheKeys.stats.achievements(userId))
  },

  // Invalidate watchlist cache when watched items change
  watchlist: (username: string) => {
    // Clear all variations of watchlist cache for this user
    const statuses = ['COMPLETED', 'WATCHING', 'PLANNED', 'PAUSED', 'DROPPED']
    const mediaTypes = ['MOVIE', 'TV']
    
    // Clear general watchlist cache
    for (let page = 1; page <= 10; page++) {
      userCache.delete(cacheKeys.user.watchlist(username, undefined, undefined, page))
    }
    
    // Clear filtered caches
    statuses.forEach(status => {
      mediaTypes.forEach(mediaType => {
        for (let page = 1; page <= 5; page++) {
          userCache.delete(cacheKeys.user.watchlist(username, status, mediaType, page))
          userCache.delete(cacheKeys.user.watchlist(username, status, undefined, page))
          userCache.delete(cacheKeys.user.watchlist(username, undefined, mediaType, page))
        }
      })
    })
  },

  // Clear all caches (for development/debugging)
  all: () => {
    tmdbCache.clear()
    userCache.clear()
    statsCache.clear()
  },
}

// Auto-cleanup job to remove expired entries
let cleanupInterval: NodeJS.Timeout | null = null

export const startCacheCleanup = (intervalMs = 5 * 60 * 1000) => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
  }
  
  cleanupInterval = setInterval(() => {
    tmdbCache.cleanup()
    userCache.cleanup()
    statsCache.cleanup()
  }, intervalMs)
}

export const stopCacheCleanup = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
    cleanupInterval = null
  }
}

// Start cleanup job automatically
if (typeof window === 'undefined') {
  // Only run on server side
  startCacheCleanup()
}