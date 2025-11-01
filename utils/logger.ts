/**
 * Centralized logging utility
 * Provides consistent logging across the application
 * In production, logs can be integrated with error tracking services like Bugsnag
 */

type LogLevel = 'log' | 'warn' | 'error' | 'debug'

interface LogContext {
  component?: string
  function?: string
  [key: string]: unknown
}

class Logger {
  private isDev = import.meta.dev
  private isServer = import.meta.server

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` [${JSON.stringify(context)}]` : ''
    return `[${timestamp}] [${level.toUpperCase()}]${contextStr} ${message}`
  }

  log(message: string, ...args: unknown[]): void {
    if (this.isDev) {
      console.log(this.formatMessage('log', message), ...args)
    }
  }

  warn(message: string, context?: LogContext, ...args: unknown[]): void {
    const formatted = this.formatMessage('warn', message, context)
    console.warn(formatted, ...args)
    
    // In production, could send to error tracking service
    // if (!this.isDev) {
    //   // Send to Bugsnag or similar
    // }
  }

  error(error: Error | unknown, context?: LogContext, ...args: unknown[]): void {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const formatted = this.formatMessage('error', errorMessage, context)
    
    console.error(formatted, error, ...args)
    
    // In production, send to error tracking service
    if (!this.isDev && typeof window !== 'undefined') {
      // Could integrate with Bugsnag here
      // Bugsnag.notify(error, { context, ...args })
    }
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.isDev) {
      console.debug(this.formatMessage('debug', message), ...args)
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export type for use in other files
export type { LogContext }

