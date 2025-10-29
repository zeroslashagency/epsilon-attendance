/**
 * Service Implementation: ToastNotificationService
 * Implements INotificationService using Sonner toast
 */
import { injectable } from 'inversify';
import { INotificationService } from '@/core/application/ports/INotificationService';
import { toast } from 'sonner';

@injectable()
export class ToastNotificationService implements INotificationService {
  success(message: string): void {
    toast.success(message);
  }

  error(message: string): void {
    toast.error(message);
  }

  info(message: string): void {
    toast.info(message);
  }

  warning(message: string): void {
    toast.warning(message);
  }

  loading(message: string): string {
    const id = toast.loading(message);
    return id.toString();
  }

  dismiss(id: string): void {
    toast.dismiss(id);
  }
}
