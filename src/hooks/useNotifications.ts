import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Notification, NotificationType } from '@/types/notification';
import { toast } from 'sonner';
import { createEventDeduper } from '@/utils/realtime';

type DeviceNotificationRow = {
  id: number;
  employee_code: string;
  title: string;
  body: string;
  notification_type: string;
  priority: string;
  sent_at: string | null;
  created_at?: string | null;
  read_at?: string | null;
  status?: string | null;
};

type NotificationSource = 'notifications' | 'device_notifications';

const REFRESH_DEBOUNCE_MS = 500;
const TOAST_BATCH_WINDOW_MS = 800;

export function useNotifications() {
  const { user, employeeCode } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const incomingDeduperRef = useRef(createEventDeduper());
  const toastQueueRef = useRef<{ count: number; timer: ReturnType<typeof setTimeout> | null; lastTitle: string; lastMessage: string }>({
    count: 0,
    timer: null,
    lastTitle: '',
    lastMessage: '',
  });
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sources, setSources] = useState<{ notifications: boolean; deviceNotifications: boolean }>({
    notifications: false,
    deviceNotifications: false,
  });

  // Browser permission state
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      audioRef.current = new Audio('/notification-sound.mp3'); // Ensure this exists or fallback silently
    }
  }, []);

  useEffect(() => {
    return () => {
      if (toastQueueRef.current.timer) {
        clearTimeout(toastQueueRef.current.timer);
        toastQueueRef.current.timer = null;
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, []);

  function mapDeviceNotificationType(type: string, priority: string): NotificationType {
    if (priority === 'urgent') return 'error';
    if (priority === 'high') return 'warning';
    if (type === 'alert' || type === 'policy') return 'warning';
    if (type === 'broadcast') return 'info';
    return 'info';
  }

  function mapDeviceNotification(row: DeviceNotificationRow): Notification {
    return {
      id: `device:${row.id}`,
      user_id: row.employee_code,
      title: row.title,
      message: row.body,
      type: mapDeviceNotificationType(row.notification_type, row.priority),
      is_read: Boolean(row.read_at) || row.status === 'read',
      metadata: { source: 'device_notifications', rawId: row.id },
      created_at: row.sent_at || row.created_at || new Date().toISOString(),
    };
  }

  function mapAppNotification(row: Notification): Notification {
    return {
      ...row,
      metadata: { ...(row.metadata || {}), source: 'notifications', rawId: row.id },
    };
  }

  function isMissingTableError(error: any): boolean {
    const message = (error?.message || '').toLowerCase();
    return error?.code === '42P01' || message.includes('does not exist') || message.includes('undefined table');
  }

  function sortByNewest(items: Notification[]): Notification[] {
    return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  const fetchNotifications = useCallback(async () => {
    if (!user && !employeeCode) return;

    try {
      setLoading(true);
      const merged: Notification[] = [];
      let notificationsAvailable = false;
      let deviceNotificationsAvailable = false;

      if (user) {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          if (!isMissingTableError(error)) {
            console.error('Error fetching notifications:', error);
          }
        } else {
          notificationsAvailable = true;
          merged.push(...(data || []).map(mapAppNotification));
        }
      }

      if (employeeCode) {
        const { data, error } = await supabase
          .from('device_notifications')
          .select('*')
          .eq('employee_code', employeeCode)
          .order('sent_at', { ascending: false })
          .limit(50);

        if (error) {
          if (!isMissingTableError(error)) {
            console.error('Error fetching device notifications:', error);
          }
        } else {
          deviceNotificationsAvailable = true;
          merged.push(...(data || []).map(mapDeviceNotification));
        }
      }

      const ordered = sortByNewest(merged).slice(0, 50);
      setSources({ notifications: notificationsAvailable, deviceNotifications: deviceNotificationsAvailable });
      setNotifications(ordered);
      setUnreadCount(ordered.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user, employeeCode]);

  // Subscribe to real-time changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleIncoming = useCallback((incoming: Notification) => {
    const shouldProcess = incomingDeduperRef.current;
    if (!shouldProcess(`notification:${incoming.id}`)) {
      return;
    }

    let didInsert = false;
    setNotifications(prev => {
      if (prev.some(notification => notification.id === incoming.id)) {
        return prev;
      }
      didInsert = true;
      return [incoming, ...prev];
    });
    if (!didInsert) {
      return;
    }
    setUnreadCount(prev => prev + 1);

    if (audioRef.current) {
      audioRef.current.play().catch(() => { });
    }

    if (document.hidden && permission === 'granted') {
      new window.Notification(incoming.title, {
        body: incoming.message,
        icon: '/Epsilologo.svg'
      });
      return;
    }

    const queue = toastQueueRef.current;
    queue.count += 1;
    queue.lastTitle = incoming.title;
    queue.lastMessage = incoming.message;

    if (!queue.timer) {
      queue.timer = setTimeout(() => {
        if (queue.count === 1) {
          toast.info(queue.lastTitle, { description: queue.lastMessage });
        } else {
          toast.info(`You have ${queue.count} new notifications`, {
            description: 'Open Notifications to review.',
          });
        }
        queue.count = 0;
        queue.lastTitle = '';
        queue.lastMessage = '';
        queue.timer = null;
      }, TOAST_BATCH_WINDOW_MS);
    }
  }, [permission]);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(() => {
      fetchNotifications();
    }, REFRESH_DEBOUNCE_MS);
  }, [fetchNotifications]);

  // Subscribe to real-time changes
  useEffect(() => {
    if (!user && !employeeCode) return;
    if (!sources.notifications && !sources.deviceNotifications) return;

    const channels: ReturnType<typeof supabase.channel>[] = [];

    if (sources.notifications && user) {
      const notificationsChannel = supabase
        .channel('public:notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const incoming = mapAppNotification(payload.new as Notification);
            handleIncoming(incoming);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            scheduleRefresh();
          }
        )
        .subscribe();

      channels.push(notificationsChannel);
    }

    if (sources.deviceNotifications && employeeCode) {
      const deviceChannel = supabase
        .channel('public:device_notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'device_notifications',
            filter: `employee_code=eq.${employeeCode}`,
          },
          (payload) => {
            const incoming = mapDeviceNotification(payload.new as DeviceNotificationRow);
            handleIncoming(incoming);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'device_notifications',
            filter: `employee_code=eq.${employeeCode}`,
          },
          () => {
            scheduleRefresh();
          }
        )
        .subscribe();

      channels.push(deviceChannel);
    }

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel));
    };
  }, [user, employeeCode, sources, scheduleRefresh, handleIncoming]);

  const markAsRead = async (id: string) => {
    try {
      const target = notifications.find(n => n.id === id);
      const source = (target?.metadata as any)?.source as NotificationSource | undefined;
      const rawId = (target?.metadata as any)?.rawId ?? id;

      if (source === 'device_notifications') {
        const { error } = await supabase
          .from('device_notifications')
          .update({ read_at: new Date().toISOString(), status: 'read' })
          .eq('id', rawId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', rawId);

        if (error) throw error;
      }

      // Optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      if (user) {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
        if (error) throw error;
      }
      if (employeeCode) {
        const { error } = await supabase
          .from('device_notifications')
          .update({ read_at: new Date().toISOString(), status: 'read' })
          .eq('employee_code', employeeCode)
          .is('read_at', null);
        if (error) throw error;
      }

      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) return 'denied';
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    permission,
    requestPermission,
    fetchNotifications
  };
}
