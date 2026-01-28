import { useState, useEffect } from 'react';
import { NetworkStatus } from '@/types/device';

export const useNetworkStats = () => {
  const [stats, setStats] = useState<NetworkStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Mock data fetching
    const timer = setTimeout(() => {
      try {
        setStats({
          isConnected: true,
          type: 'wifi',
          signalStrength: 85,
          ssid: 'Office_WiFi_5G',
          ipAddress: '192.168.1.105',
          dataUsage: {
            sent: 1024 * 1024 * 150, // 150 MB
            received: 1024 * 1024 * 450, // 450 MB
          },
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
