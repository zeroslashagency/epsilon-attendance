import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from '@/components/Notifications/NotificationItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCheck, Trash2, Bell, Filter } from 'lucide-react';

export default function NotificationsPage() {
    const { notifications, markAsRead, markAllAsRead, loading } = useNotifications();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                    <p className="text-muted-foreground">
                        Manage your alerts and system messages.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => markAllAsRead()}>
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Mark all as read
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">Unread</TabsTrigger>
                    <TabsTrigger value="archived" disabled>Archived</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Inbox
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="p-8 text-center text-muted-foreground">Loading...</div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <Bell className="h-12 w-12 mb-4 opacity-20" />
                                    <p className="text-lg font-medium">No notifications</p>
                                    <p className="text-sm">You're all caught up!</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {notifications.map(notification => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onRead={markAsRead}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="unread" className="mt-6">
                    <Card>
                        <CardContent className="p-0">
                            {/* Filter logic normally handled in hook or here */}
                            {notifications.filter(n => !n.is_read).length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <CheckCheck className="h-12 w-12 mb-4 opacity-20" />
                                    <p>No unread messages</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {notifications.filter(n => !n.is_read).map(notification => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onRead={markAsRead}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
