export interface ILogger {
  error(error: Error, context?: any): void;
  warn(message: string, context?: any): void;
  info(message: string, context?: any): void;
}