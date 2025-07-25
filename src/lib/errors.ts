import { TRPCError } from '@trpc/server'
import { ZodError } from 'zod'

// Standardized API error format as per PRD
export interface StandardAPIError {
  code: string
  message: string
  status: number
  details?: any
}

// Error codes following HTTP status patterns
export const ERROR_CODES = {
  // 400 level errors
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  
  // 500 level errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  
  // Domain-specific errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  WATCHED_ITEM_NOT_FOUND: 'WATCHED_ITEM_NOT_FOUND',
  NOTE_NOT_FOUND: 'NOTE_NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  TMDB_ERROR: 'TMDB_ERROR',
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

// Custom error class that follows PRD error format
export class WatchTrackerError extends Error {
  public readonly code: ErrorCode
  public readonly status: number
  public readonly details?: unknown

  constructor(
    code: ErrorCode,
    message: string,
    status: number = 500,
    details?: any
  ) {
    super(message)
    this.name = 'WatchTrackerError'
    this.code = code
    this.status = status
    this.details = details
  }

  toJSON(): StandardAPIError {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
      details: this.details,
    }
  }
}

// Helper functions to create specific errors
export const createError = {
  badRequest: (message: string, details?: any) =>
    new WatchTrackerError(ERROR_CODES.BAD_REQUEST, message, 400, details),
    
  unauthorized: (message = 'Unauthorized access') =>
    new WatchTrackerError(ERROR_CODES.UNAUTHORIZED, message, 401),
    
  forbidden: (message = 'Access forbidden') =>
    new WatchTrackerError(ERROR_CODES.FORBIDDEN, message, 403),
    
  notFound: (resource: string, id?: string) =>
    new WatchTrackerError(
      ERROR_CODES.NOT_FOUND,
      `${resource}${id ? ` with id "${id}"` : ''} not found`,
      404
    ),
    
  validation: (message: string, details?: any) =>
    new WatchTrackerError(ERROR_CODES.VALIDATION_ERROR, message, 400, details),
    
  rateLimited: (message = 'Rate limit exceeded') =>
    new WatchTrackerError(ERROR_CODES.RATE_LIMITED, message, 429),
    
  internal: (message = 'Internal server error', details?: any) =>
    new WatchTrackerError(ERROR_CODES.INTERNAL_ERROR, message, 500, details),
    
  database: (message = 'Database operation failed', details?: any) =>
    new WatchTrackerError(ERROR_CODES.DATABASE_ERROR, message, 500, details),
    
  externalAPI: (service: string, message?: string) =>
    new WatchTrackerError(
      ERROR_CODES.EXTERNAL_API_ERROR,
      message || `External API error: ${service}`,
      502
    ),
    
  userNotFound: (userId?: string) =>
    new WatchTrackerError(
      ERROR_CODES.USER_NOT_FOUND,
      `User${userId ? ` "${userId}"` : ''} not found`,
      404
    ),
    
  watchedItemNotFound: (id?: string) =>
    new WatchTrackerError(
      ERROR_CODES.WATCHED_ITEM_NOT_FOUND,
      `Watched item${id ? ` "${id}"` : ''} not found`,
      404
    ),
    
  noteNotFound: (id?: string) =>
    new WatchTrackerError(
      ERROR_CODES.NOTE_NOT_FOUND,
      `Note${id ? ` "${id}"` : ''} not found`,
      404
    ),
    
  duplicate: (resource: string, field?: string) =>
    new WatchTrackerError(
      ERROR_CODES.DUPLICATE_ENTRY,
      `${resource} already exists${field ? ` with this ${field}` : ''}`,
      409
    ),
}

// Convert Zod validation errors to user-friendly messages
export function formatZodError(error: ZodError): WatchTrackerError {
  const details = error.issues.map((err: any) => ({
    path: err.path.join('.'),
    message: err.message,
    code: err.code,
  }))

  const firstError = error.issues[0]
  const field = firstError?.path.join('.') || 'field'
  const message = `Validation error in ${field}: ${firstError?.message || 'Invalid value'}`

  return createError.validation(message, details)
}

// Convert various error types to tRPC errors
export function toTRPCError(error: unknown): TRPCError {
  // Already a WatchTrackerError
  if (error instanceof WatchTrackerError) {
    return new TRPCError({
      code: mapStatusToTRPCCode(error.status),
      message: error.message,
      cause: error,
    })
  }

  // Zod validation error
  if (error instanceof ZodError) {
    const formattedError = formatZodError(error)
    return new TRPCError({
      code: 'BAD_REQUEST',
      message: formattedError.message,
      cause: formattedError,
    })
  }

  // Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; message: string }
    
    switch (prismaError.code) {
      case 'P2002':
        return new TRPCError({
          code: 'CONFLICT',
          message: 'A record with this information already exists',
          cause: error,
        })
      case 'P2025':
        return new TRPCError({
          code: 'NOT_FOUND',
          message: 'Record not found',
          cause: error,
        })
      default:
        return new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database operation failed',
          cause: error,
        })
    }
  }

  // Generic error
  if (error instanceof Error) {
    return new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message,
      cause: error,
    })
  }

  // Unknown error
  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    cause: error,
  })
}

// Map HTTP status codes to tRPC error codes
function mapStatusToTRPCCode(status: number): TRPCError['code'] {
  switch (status) {
    case 400:
      return 'BAD_REQUEST'
    case 401:
      return 'UNAUTHORIZED'
    case 403:
      return 'FORBIDDEN'
    case 404:
      return 'NOT_FOUND'
    case 409:
      return 'CONFLICT'
    case 429:
      return 'TOO_MANY_REQUESTS'
    case 500:
    default:
      return 'INTERNAL_SERVER_ERROR'
  }
}

// Error logging utility
export function logError(error: unknown, context?: string) {
  const timestamp = new Date().toISOString()
  const contextStr = context ? `[${context}] ` : ''
  
  if (error instanceof WatchTrackerError) {
    console.error(`${timestamp} ${contextStr}WatchTrackerError:`, {
      code: error.code,
      message: error.message,
      status: error.status,
      details: error.details,
    })
  } else if (error instanceof Error) {
    console.error(`${timestamp} ${contextStr}Error:`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    })
  } else {
    console.error(`${timestamp} ${contextStr}Unknown error:`, error)
  }
}