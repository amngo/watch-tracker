/**
 * Structured logging utility for the application
 * Replaces console.* statements with structured, environment-aware logging
 */

export interface LogContext {
  userId?: string
  component?: string
  action?: string
  metadata?: Record<string, any>
}

export interface LogEntry {
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  context?: LogContext
  error?: Error | any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatEntry(entry: LogEntry): string {
    const contextStr = entry.context 
      ? `[${[
          entry.context.component,
          entry.context.action,
          entry.context.userId
        ].filter(Boolean).join(':')}] `
      : ''
    
    return `${entry.timestamp} ${contextStr}${entry.message}`
  }

  private logToConsole(entry: LogEntry) {
    const formatted = this.formatEntry(entry)
    
    switch (entry.level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formatted, entry.context, entry.error)
        }
        break
      case 'info':
        console.info(formatted, entry.context)
        break
      case 'warn':
        console.warn(formatted, entry.context, entry.error)
        break
      case 'error':
        console.error(formatted, entry.context, entry.error)
        break
    }
  }

  debug(message: string, context?: LogContext) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'debug',
      message,
      context
    }
    this.logToConsole(entry)
  }

  info(message: string, context?: LogContext) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context
    }
    this.logToConsole(entry)
  }

  warn(message: string, context?: LogContext, error?: Error | any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context,
      error
    }
    this.logToConsole(entry)
  }

  error(message: string, context?: LogContext, error?: Error | any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context,
      error
    }
    this.logToConsole(entry)
  }
}

// Export singleton instance
export const logger = new Logger()

// Convenience functions for common use cases
export const logError = (
  message: string, 
  error: Error | any, 
  context?: Omit<LogContext, 'action'>
) => {
  logger.error(message, { ...context, action: 'error' }, error)
}

export const logApiCall = (
  endpoint: string,
  method: string,
  context?: LogContext
) => {
  logger.info(`API ${method} ${endpoint}`, {
    ...context,
    action: 'api_call',
    metadata: { endpoint, method }
  })
}

export const logUserAction = (
  action: string,
  userId: string,
  context?: Omit<LogContext, 'userId' | 'action'>
) => {
  logger.info(`User action: ${action}`, {
    ...context,
    userId,
    action
  })
}