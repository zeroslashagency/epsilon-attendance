import { useState, useEffect } from 'react';
import { DeviceEvent } from '@/types/device';

export const useDeviceEvents = () => {
  const [events, setEvents] = useState<DeviceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Mock data fetching
    const timer = setTimeout(() => {
      try {
        setEvents([
          {
            id: '1',
            timestamp: new Date().toISOString(),
            type: 'network',
            message: 'Connected to WiFi network "Office_WiFi_5G"',
            severity: 'info',
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            type: 'system',
            message: 'High CPU usage detected (92%)',
            severity: 'warning',
          },
          {
            id: '3',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            type: 'bluetooth',
            message: 'Bluetooth device "MX Master 3" connected',
            severity: 'info',
          },
          {
            id: '4',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            type: 'security',
            message: 'Failed login attempt from 192.168.1.200',
            severity: 'error',
          },
        ]);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return { events, loading, error };
};
