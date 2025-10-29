import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export const OnlineStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
      isOnline 
        ? 'bg-green-100 text-green-700 border border-green-200' 
        : 'bg-red-100 text-red-700 border border-red-200'
    }`}>
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>Online</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Offline</span>
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        </>
      )}
    </div>
  );
};
