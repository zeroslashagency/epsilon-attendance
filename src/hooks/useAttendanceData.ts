/**
 * useAttendanceData Hook
 * 
 * TEMPORARY: Using legacy version until Clean Architecture DI issues are resolved
 * Clean Architecture version: useAttendanceData.cleanarch.ts (not working in dev mode)
 * Legacy working version: Restored from useAttendanceData.legacy.ts
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { ProcessedDayData } from '@/types/attendance';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { validateInput, processAttendanceLogsSchema, validateEmployeeCode } from '@/utils/validation';
import { toast } from 'sonner';

interface UseAttendanceDataProps {
  employeeCode: string;
  enableRealTime?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseAttendanceDataReturn {
  attendanceData: Record<string, ProcessedDayData>;
  isLoading: boolean;
  isBackgroundRefreshing: boolean;
  error: string | null;
  lastUpdate: Date;
  refresh: () => Promise<void>;
}

export function useAttendanceData({
  employeeCode,
  enableRealTime = true,
  refreshInterval = 30000 // 30 seconds
}: UseAttendanceDataProps): UseAttendanceDataReturn {
  const [attendanceData, setAttendanceData] = useState<Record<string, ProcessedDayData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const previousDataCount = useRef<number>(0);

  // Fallback function for direct Supabase queries
  const fetchAttendanceDataFallback = useCallback(async () => {
    if (!employeeCode) {
      console.error('❌ No employee code provided');
      setError('No employee code provided');
      setAttendanceData({});
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      console.log('🔍 Fetching attendance data for employee:', employeeCode);
      
      // Fetch real attendance data from Supabase using the correct table
      const { data: punchLogs, error } = await supabase
        .from('employee_raw_logs')
        .select('*')
        .eq('employee_code', employeeCode)
        .order('log_date', { ascending: false })
        .limit(1000); // Get last 1000 records

      console.log('📊 Query result:', { 
        employeeCode, 
        recordsFound: punchLogs?.length || 0, 
        error: error?.message,
        firstRecord: punchLogs?.[0]
      });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      if (!punchLogs || punchLogs.length === 0) {
        console.warn('⚠️ No attendance data found for employee:', employeeCode);
        setAttendanceData({});
        setError(`No attendance data found for employee: ${employeeCode}`);
      } else {
        console.log('✅ Processing', punchLogs.length, 'punch logs');
        // Process real punch logs
        const processedData = processRealPunchLogs(punchLogs, employeeCode);
        console.log('📅 Processed data:', Object.keys(processedData).length, 'days');
        setAttendanceData(processedData);
        setError(null);
      }
      
      setLastUpdate(new Date());
    } catch (err) {
      console.error('❌ Failed to load attendance data:', err);
      setError(`Failed to load attendance data for employee: ${employeeCode}`);
      setAttendanceData({});
    }
  }, [employeeCode]);

  // Main data fetching function with RPC
  const fetchAttendanceData = useCallback(async (isBackgroundUpdate = false) => {
    console.log('🚀 fetchAttendanceData called with employeeCode:', employeeCode);
    
    // Validate employee code
    const employeeValidation = validateEmployeeCode(employeeCode);
    console.log('✔️ Employee code validation:', employeeValidation);
    
    if (!employeeValidation.isValid) {
      console.error('❌ Validation failed:', employeeValidation.error);
      setError(employeeValidation.error || 'Invalid employee code');
      setAttendanceData({});
      setIsLoading(false);
      return;
    }

    try {
      // Only show main loading on initial load, not background updates
      if (!isBackgroundUpdate) {
        setIsLoading(true);
      } else {
        setIsBackgroundRefreshing(true);
      }
      setError(null);

      const today = new Date();
      const endDate = today.toISOString().split('T')[0];
      // Fetch 3 months of data (90 days)
      const startDate = new Date(today.setDate(today.getDate() - 90)).toISOString().split('T')[0];

      // Validate RPC parameters
      const rpcParams = {
        p_employee_code: employeeCode,
        p_start_date: startDate,
        p_end_date: endDate,
      };

      const validation = validateInput(processAttendanceLogsSchema, rpcParams);
      if (!validation.isValid) {
        throw new Error(`Invalid parameters: ${validation.error}`);
      }

      console.log('📞 Calling RPC with params:', validation.data);
      
      // Try the new RPC function first
      const { data, error } = await supabase.rpc('process_attendance_logs', validation.data!);

      console.log('📥 RPC response:', { data, error, errorCode: error?.code });

      if (error && error.code === '42883') {
        // RPC function doesn't exist, fall back to original logic
        console.warn('⚠️ RPC function not found, using fallback logic');
        logger.warn('RPC function not found, using fallback logic', { employeeCode }, 'ATTENDANCE');
        await fetchAttendanceDataFallback();
        return;
      }

      if (error) {
        console.error('❌ RPC error, falling back:', error);
        throw error;
      }

      const newData = data || {};
      const newDataCount = Object.keys(newData).length;
      
      // Check if new data arrived (not on initial load)
      if (!isLoading && previousDataCount.current > 0 && newDataCount > previousDataCount.current) {
        const newRecordsCount = newDataCount - previousDataCount.current;
        toast.success('🔔 New Attendance Data!', {
          description: `${newRecordsCount} new attendance record${newRecordsCount > 1 ? 's' : ''} added`,
          duration: 5000,
        });
        
        // Show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Attendance Data', {
            body: `${newRecordsCount} new attendance record${newRecordsCount > 1 ? 's' : ''} added`,
            icon: '/Epsilologo.svg',
            badge: '/Epsilologo.svg',
          });
        }
      }
      
      previousDataCount.current = newDataCount;
      setAttendanceData(newData);
      setLastUpdate(new Date());

    } catch (err) {
      // Fall back to original logic
      await fetchAttendanceDataFallback();
    } finally {
      setIsLoading(false);
      setIsBackgroundRefreshing(false);
    }
    // Note: isLoading is intentionally not in deps - it's state modified by this function
    // Adding it would cause infinite re-renders. This is a safe React pattern.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeCode, fetchAttendanceDataFallback]);

  const refresh = useCallback(async () => {
    await fetchAttendanceData(true); // Background refresh
  }, [fetchAttendanceData]);

  useEffect(() => {
    // Initial data fetch (only show loading on first load)
    fetchAttendanceData(false);

    // Set up real-time updates if enabled
    let cleanupRealTime: (() => void) | undefined;
    let fallbackInterval: NodeJS.Timeout | undefined;
    
    if (enableRealTime) {
      try {
        // Set up Supabase real-time subscription
        const channel = supabase
          .channel('employee_raw_logs_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'employee_raw_logs',
              filter: `employee_code=eq.${employeeCode}`
            },
            async (payload) => {
              // Refresh data when changes occur (background update)
              logger.realTimeUpdate('Employee attendance data changed', { employeeCode, payload });
              await fetchAttendanceData(true);
            }
          )
          .subscribe();
        
        cleanupRealTime = () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
        // Real-time updates not available - fall back to polling
        logger.warn('Real-time setup failed, using polling fallback', { error: err }, 'ATTENDANCE');
        fallbackInterval = setInterval(() => {
          fetchAttendanceData(true);
        }, refreshInterval);
      }
    } else {
      // Real-time disabled, use polling
      fallbackInterval = setInterval(() => {
        fetchAttendanceData(true);
      }, refreshInterval);
    }

    // Cleanup function
    return () => {
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
      if (cleanupRealTime) {
        cleanupRealTime();
      }
    };
  }, [fetchAttendanceData, refreshInterval, enableRealTime, employeeCode]);

  return {
    attendanceData,
    isLoading,
    isBackgroundRefreshing,
    error,
    lastUpdate,
    refresh
  };
}

// Process real punch logs from Supabase
interface RawPunchLog {
  id: number;
  employee_code: string;
  log_date: string;
  punch_direction: 'in' | 'out';
  sync_time: string;
}

function processRealPunchLogs(punchLogs: RawPunchLog[], employeeCode: string): Record<string, ProcessedDayData> {
  const data: Record<string, ProcessedDayData> = {};
  
  // Group punch logs by date
  const logsByDate: Record<string, Array<{
    time: string;
    direction: 'in' | 'out' | 'break';
    deviceId: string;
    confidence: 'high' | 'medium' | 'low';
    inferred: boolean;
  }>> = {};
  
  punchLogs.forEach(log => {
    const date = new Date(log.log_date).toISOString().split('T')[0];
    if (!logsByDate[date]) {
      logsByDate[date] = [];
    }
    logsByDate[date].push({
      time: new Date(log.log_date).toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      direction: log.punch_direction as 'in' | 'out' | 'break',
      deviceId: 'device-1', // No serial_number in table
      confidence: 'high' as 'high' | 'medium' | 'low',
      inferred: false
    });
  });
  
  // Process each date
  Object.entries(logsByDate).forEach(([date, logs]) => {
    // Sort logs by time
    logs.sort((a, b) => a.time.localeCompare(b.time));
    
    // Find check-in and check-out
    const inLogs = logs.filter(log => log.direction === 'in');
    const outLogs = logs.filter(log => log.direction === 'out');
    
    const checkIn = inLogs.length > 0 ? inLogs[0].time : undefined;
    const checkOut = outLogs.length > 0 ? outLogs[outLogs.length - 1].time : undefined;
    
    // Calculate status
    let status: 'present' | 'late' | 'absent' = 'present';
    if (!checkIn) {
      status = 'absent';
    } else if (checkIn > '09:00') {
      status = 'late';
    }
    
    // Calculate total hours
    let totalHours = '0:00';
    if (checkIn && checkOut) {
      const inTime = new Date(`2000-01-01 ${checkIn}`);
      const outTime = new Date(`2000-01-01 ${checkOut}`);
      const diffMs = outTime.getTime() - inTime.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      totalHours = `${diffHours}:${diffMinutes.toString().padStart(2, '0')}`;
    }
    
    // Create intervals
    const intervals = [];
    if (checkIn && checkOut) {
      intervals.push({
        checkIn,
        checkOut,
        duration: totalHours,
        type: 'work' as const
      });
    }
    
    data[date] = {
      date,
      status,
      checkIn,
      checkOut,
      totalHours,
      confidence: 'high',
      hasAmbiguousPunches: false,
      intervals,
      punchLogs: logs
    };
  });
  
  return data;
}

