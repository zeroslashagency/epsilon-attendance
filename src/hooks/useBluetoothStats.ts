import { useState, useEffect } from 'react';
import { BluetoothStatus } from '@/types/device';

export const useBluetoothStats = () => {
  const [stats, setStats] = useState<BluetoothStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Mock data fetching
    const timer = setTimeout(() => {
      try {
        setStats({
          isEnabled: true,
          connectedDevices: [
            {
              id: '1',
              name: 'Wireless Headset',
              type: 'audio',
              batteryLevel: 82,
            },
            {
              id: '2',
              name: 'MX Master 3',
              type: 'input',
              batteryLevel: 45,
            },
          ],
        });
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return { stats, loading, error };
};
