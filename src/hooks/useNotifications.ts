import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if browser supports notifications
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    // Show toast notification (always works)
    toast.success(title, {
      description: options?.body,
      duration: 5000,
    });

    // Show browser notification if permitted
    if ('Notification' in window && permission === 'granted') {
      new Notification(title, {
        icon: '/Epsilologo.svg',
        badge: '/Epsilologo.svg',
        ...options,
      });
    }
  };

  return {
    permission,
    requestPermission,
    showNotification,
    isSupported: 'Notification' in window,
  };
}
