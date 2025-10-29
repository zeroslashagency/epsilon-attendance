// Professional logging service for production applications
// Replaces console.log with environment-aware logging

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
  context?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logLevel: LogLevel = this.isDevelopment ? 'debug' : 'error';

  private formatMessage(level: LogLevel, message: string, data?: unknown, context?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      context
    };
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    return levels[level] >= levels[this.logLevel];
  }

  private output(entry: LogEntry) {
    if (!this.shouldLog(entry.level)) return;

    // In development, use console for immediate feedback
    if (this.isDevelopment) {
      const style = this.getConsoleStyle(entry.level);
      const prefix = `[${entry.timestamp}] ${entry.level.toUpperCase()}`;
      const contextStr = entry.context ? ` [${entry.context}]` : '';
      
      if (entry.data) {
        console.log(`%c${prefix}${contextStr}: ${entry.message}`, style, entry.data);
      } else {
        console.log(`%c${prefix}${contextStr}: ${entry.message}`, style);
      }
    } else {
      // In production, you could send to external logging service
      // For now, only log errors to console in production
      if (entry.level === 'error') {
        console.error(`${entry.timestamp} [ERROR]: ${entry.message}`, entry.data);
      }
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      debug: 'color: #888; font-size: 11px;',
      info: 'color: #2196F3; font-weight: bold;',
      warn: 'color: #FF9800; font-weight: bold;',
      error: 'color: #F44336; font-weight: bold; background: #ffebee; padding: 2px 4px;'
    };
    return styles[level];
  }

  debug(message: string, data?: unknown, context?: string) {
    const entry = this.formatMessage('debug', message, data, context);
    this.output(entry);
  }

  info(message: string, data?: unknown, context?: string) {
    const entry = this.formatMessage('info', message, data, context);
    this.output(entry);
  }

  warn(message: string, data?: unknown, context?: string) {
    const entry = this.formatMessage('warn', message, data, context);
    this.output(entry);
  }

  error(message: string, data?: unknown, context?: string) {
    const entry = this.formatMessage('error', message, data, context);
    this.output(entry);
  }

  // Convenience methods for common use cases
  apiCall(method: string, endpoint: string, data?: unknown) {
    this.debug(`API ${method} ${endpoint}`, data, 'API');
  }

  apiSuccess(method: string, endpoint: string, data?: unknown) {
    this.info(`API ${method} ${endpoint} - Success`, data, 'API');
  }

  apiError(method: string, endpoint: string, error: unknown) {
    this.error(`API ${method} ${endpoint} - Error`, error, 'API');
  }

  dataFetch(source: string, result: unknown) {
    this.debug(`Data fetched from ${source}`, result, 'DATA');
  }

  realTimeUpdate(event: string, data?: unknown) {
    this.info(`Real-time update: ${event}`, data, 'REALTIME');
  }

  userAction(action: string, data?: unknown) {
    this.info(`User action: ${action}`, data, 'USER');
  }

  performance(operation: string, duration: number) {
    this.debug(`Performance: ${operation} took ${duration}ms`, undefined, 'PERF');
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for external use
export type { LogLevel, LogEntry };
