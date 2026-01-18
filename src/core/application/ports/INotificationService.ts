/**
 * Notification Service Port Interface
 * Application port for user notifications
 */
export interface INotificationService {
    success(message: string): void;
    error(message: string): void;
    info(message: string): void;
    warning(message: string): void;
    loading(message: string): string;
    dismiss(id: string): void;
}
