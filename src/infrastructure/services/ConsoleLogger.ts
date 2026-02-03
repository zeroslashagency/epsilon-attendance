/**
 * Service Implementation: ConsoleLogger
 * Implements ILogger using console
 */
import { ILogger } from '@/core/application/ports/ILogger';

export class ConsoleLogger implements ILogger {
  private formatMessage(level: string, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level}] ${message}${contextStr}`;
  }

  info(message: string, context?: Record<string, unknown>): void {
    console.log(this.formatMessage('INFO', message, context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(this.formatMessage('WARN', message, context));
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const errorContext = error ? { ...context, error: error.message, stack: error.stack } : context;
    console.error(this.formatMessage('ERROR', message, errorContext));
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (import.meta.env.DEV) {
      console.debug(this.formatMessage('DEBUG', message, context));
    }
  }
}
