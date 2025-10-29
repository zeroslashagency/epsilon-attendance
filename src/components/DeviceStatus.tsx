import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DeviceStatusData {
  device_id: string;
  device_name: string;
  status: string;
  last_sync: string;
  last_log_received: string | null;
  total_logs_today: number;
  error_message: string | null;
  calculated_status: 'online' | 'warning' | 'offline';
}

export const DeviceStatus: React.FC = () => {
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDeviceStatus = async () => {
    try {
      // Query employee_raw_logs with available timestamp fields
      const { data: logs, error: logsError } = await supabase
        .from('employee_raw_logs')
        .select('log_date, sync_time, created_at')
        .order('created_at', { ascending: false })
        .limit(1);

      if (logsError) {
        console.error('❌ Error fetching device logs:', logsError);
        setLoading(false);
        return;
      }

      console.log('📊 Raw Supabase Data:', logs);

      if (logs && logs.length > 0) {
        const lastLog = logs[0];
        
        // Try all possible timestamp fields to get the MOST RECENT one
        const timestamps = [
          lastLog.created_at,
          lastLog.sync_time,
          lastLog.log_date
        ].filter(Boolean);
        
        console.log('🕐 All timestamps found:', timestamps);
        
        // Use created_at as it's when the record was inserted into Supabase
        const mostRecentTime = lastLog.created_at || lastLog.sync_time || lastLog.log_date;
        const lastSync = new Date(mostRecentTime);
        const now = new Date();
        const diffMs = now.getTime() - lastSync.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffSecs = Math.floor(diffMs / 1000);
        
        console.log('📡 Device Status Check:', {
          mostRecentTime,
          lastSync: lastSync.toISOString(),
          now: now.toISOString(),
          diffSecs: diffSecs + ' seconds',
          diffMins: diffMins + ' minutes',
          allFields: lastLog
        });
        
        // Real-time thresholds based on 5-second sync
        let calculatedStatus: 'online' | 'warning' | 'offline' = 'online';
        if (diffMins > 5) calculatedStatus = 'offline';  // 5 minutes
        else if (diffMins > 1) calculatedStatus = 'warning';  // 1 minute

        setDeviceStatus({
          device_id: 'device-1',
          device_name: 'Attendance Device',
          status: 'active',
          last_sync: lastSync.toISOString(),
          last_log_received: lastLog.log_date,
          total_logs_today: 0,
          error_message: null,
          calculated_status: calculatedStatus
        });
      } else {
        // No logs found - device is offline
        setDeviceStatus({
          device_id: 'device-1',
          device_name: 'Attendance Device',
          status: 'unknown',
          last_sync: new Date().toISOString(),
          last_log_received: null,
          total_logs_today: 0,
          error_message: 'No logs found',
          calculated_status: 'offline'
        });
      }
    } catch (err) {
      console.error('Device status fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceStatus();
    
    // Refresh device status every 30 seconds
    const interval = setInterval(fetchDeviceStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
        <Clock className="h-4 w-4 animate-spin" />
        <span>Checking...</span>
      </div>
    );
  }

  if (!deviceStatus) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 border border-red-200">
        <WifiOff className="h-4 w-4" />
        <span>No Device</span>
      </div>
    );
  }

  const getStatusDisplay = () => {
    const lastSync = new Date(deviceStatus.last_sync);
    const timeAgo = getTimeAgo(lastSync);

    switch (deviceStatus.calculated_status) {
      case 'online':
        return {
          className: 'bg-green-100 text-green-700 border border-green-200',
          icon: <Wifi className="h-4 w-4" />,
          text: 'Device Online',
          dot: <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>,
          subtitle: `Synced ${timeAgo}`
        };
      case 'warning':
        return {
          className: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
          icon: <AlertTriangle className="h-4 w-4" />,
          text: 'Device Warning',
          dot: <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>,
          subtitle: `Last sync ${timeAgo}`
        };
      case 'offline':
        return {
          className: 'bg-red-100 text-red-700 border border-red-200',
          icon: <WifiOff className="h-4 w-4" />,
          text: 'Device Offline',
          dot: <div className="w-2 h-2 bg-red-500 rounded-full"></div>,
          subtitle: `Last sync ${timeAgo}`
        };
      default:
        return {
          className: 'bg-gray-100 text-gray-700 border border-gray-200',
          icon: <AlertTriangle className="h-4 w-4" />,
          text: 'Device Unknown',
          dot: <div className="w-2 h-2 bg-gray-500 rounded-full"></div>,
          subtitle: `Last sync ${timeAgo}`
        };
    }
  };

  const getTimeAgo = (date: Date): string => {
    // Check if date is valid
    if (!date || isNaN(date.getTime())) {
      return 'unknown';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${statusDisplay.className}`}>
      {statusDisplay.icon}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span>{statusDisplay.text}</span>
          {statusDisplay.dot}
        </div>
        <span className="text-xs opacity-75">{statusDisplay.subtitle}</span>
      </div>
    </div>
  );
};

const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};
