import { Notification } from '@/types/notification';
import { cn } from '@/lib/utils';
import {
    Info,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Bell
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns'; // checks for date-fns later, if not native fallback

type NotificationItemProps = {
    notification: Notification;
    onRead: (id: string) => void;
    compact?: boolean; // For popover
};

export function NotificationItem({ notification, onRead, compact }: NotificationItemProps) {
    const Icon = () => {
        switch (notification.type) {
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const handleClick = () => {
        if (!notification.is_read) {
            onRead(notification.id);
        }
        if (notification.action_url) {
            window.location.href = notification.action_url; // or use router
        }
    };

    const timeAgo = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

            let interval = seconds / 31536000;
            if (interval > 1) return Math.floor(interval) + " years ago";

            interval = seconds / 2592000;
            if (interval > 1) return Math.floor(interval) + " months ago";

            interval = seconds / 86400;
            if (interval > 1) return Math.floor(interval) + " days ago";

            interval = seconds / 3600;
            if (interval > 1) return Math.floor(interval) + " hours ago";

            interval = seconds / 60;
            if (interval > 1) return Math.floor(interval) + " minutes ago";

            return Math.floor(seconds) + " seconds ago";
        } catch (e) {
            return '';
        }
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                "flex gap-3 p-3 rounded-lg transition-colors cursor-pointer border-b last:border-0",
                notification.is_read ? "bg-background hover:bg-muted/50" : "bg-muted/30 hover:bg-muted",
                compact ? "py-3 px-4" : "p-4 border shadow-sm"
            )}
        >
            <div className="mt-1">
                <Icon />
            </div>
            <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                    <p className={cn("text-sm font-medium leading-none", !notification.is_read && "text-foreground font-semibold")}>
                        {notification.title}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {timeAgo(notification.created_at)}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {notification.message}
                </p>
            </div>
            {!notification.is_read && (
                <div className="mt-2">
                    <span className="block w-2 h-2 bg-blue-500 rounded-full" />
                </div>
            )}
        </div>
    );
}
