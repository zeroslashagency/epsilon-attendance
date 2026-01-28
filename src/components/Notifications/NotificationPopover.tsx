import {
    Popover,
    PopoverDialog,
    PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

export function NotificationPopover() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [open, setOpen] = useState(false);

    // Show only recent 5 in popover
    const recentNotifications = notifications.slice(0, 5);

    return (
        <PopoverTrigger isOpen={open} onOpenChange={setOpen}>
            <Button variant="outline" size="icon" className="relative h-9 w-9">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                    <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                )}
            </Button>
            <Popover placement="bottom end" className="w-80 p-0">
                <PopoverDialog className="p-0">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h4 className="font-semibold leading-none">Notifications</h4>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto px-2 text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => markAllAsRead()}
                            >
                                <CheckCheck className="h-3 w-3 mr-1" />
                                Mark all read
                            </Button>
                        )}
                    </div>
                    <ScrollArea className="h-[300px]">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
                                <Bell className="h-8 w-8 mb-2 opacity-20" />
                                <p className="text-sm">No notifications</p>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {recentNotifications.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        onRead={markAsRead}
                                        compact={true}
                                    />
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                    <div className="p-2 border-t bg-muted/20">
                        <Link
                            to="/notifications"
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-center w-full py-2 text-sm font-medium text-primary hover:underline"
                        >
                            View all notifications
                        </Link>
                    </div>
                </PopoverDialog>
            </Popover>
        </PopoverTrigger>
    );
}
