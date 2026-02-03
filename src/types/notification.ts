export type NotificationType = 'info' | 'warning' | 'success' | 'error' | 'alert';

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: NotificationType;
    is_read: boolean;
    metadata?: Record<string, unknown>;
    created_at: string;
    action_url?: string;
}
