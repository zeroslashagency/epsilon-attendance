/**
 * Application Port: INotificationService
 * Interface for notification service
 */
export interface INotificationService {
  success(message: string): void;
  error(message: string): void;
  info(message: string): void;
  warning(message: string): void;
  loading(message: string): string; // Returns ID for updating
  dismiss(id: string): void;
}
