/**
 * View Model Hook: useAttendanceViewModel
 * Connects UI to GetAttendanceData use case
 * Enhanced with real-time updates and background refresh
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { container, initializeContainer } from '@/di/container';
import { TYPES } from '@/di/types';
import type { GetAttendanceData } from '@/core/application/use-cases/attendance/GetAttendanceData';
import type { RefreshAttendance } from '@/core/application/use-cases/attendance/RefreshAttendance';
import type { AttendanceDTO, AttendanceSummaryDTO } from '@/core/application/dtos/AttendanceDTO';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface UseAttendanceViewModelProps {
  employeeCode: string;
  startDate: string;
  endDate: string;
  enableRealTime?: boolean;
  refreshInterval?: number;
}

interface UseAttendanceViewModelResult {
  attendances: AttendanceDTO[];
  summary: AttendanceSummaryDTO | null;
  isLoading: boolean;
  isBackgroundRefreshing: boolean;
  error: Error | null;
  lastUpdate: Date;
  refresh: () => Promise<void>;
}

export function useAttendanceViewModel({
  employeeCode,
  startDate,
  endDate,
  enableRealTime = true,
  refreshInterval = 30000
}: UseAttendanceViewModelProps): UseAttendanceViewModelResult {
  const [attendances, setAttendances] = useState<AttendanceDTO[]>([]);
  const [summary, setSummary] = useState<AttendanceSummaryDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const previousDataCount = useRef<number>(0);
  const [isContainerReady, setIsContainerReady] = useState(false);

  // Initialize container and get use cases
  const getAttendanceData = useRef<GetAttendanceData | null>(null);
  const refreshAttendance = useRef<RefreshAttendance | null>(null);

  useEffect(() => {
    initializeContainer().then(() => {
      getAttendanceData.current = container.get<GetAttendanceData>(TYPES.GetAttendanceData);
      refreshAttendance.current = container.get<RefreshAttendance>(TYPES.RefreshAttendance);
      setIsContainerReady(true);
    });
  }, []);

  const fetchData = useCallback(async (isBackgroundUpdate = false) => {
    if (!employeeCode || !isContainerReady || !getAttendanceData.current) return;

    try {
      // Only show main loading on initial load
      if (!isBackgroundUpdate) {
        setIsLoading(true);
      } else {
        setIsBackgroundRefreshing(true);
      }
      setError(null);

      const result = await getAttendanceData.current.execute({
        employeeCode,
        startDate,
        endDate
      });

      // Check for new data and show notification
      const newDataCount = result.attendances.length;
      if (!isLoading && previousDataCount.current > 0 && newDataCount > previousDataCount.current) {
        const newRecordsCount = newDataCount - previousDataCount.current;
        toast.success('🔔 New Attendance Data!', {
          description: `${newRecordsCount} new attendance record${newRecordsCount > 1 ? 's' : ''} added`,
          duration: 5000,
        });
        
        // Browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Attendance Data', {
            body: `${newRecordsCount} new attendance record${newRecordsCount > 1 ? 's' : ''} added`,
            icon: '/favicon.ico',
          });
        }
      }
      
      previousDataCount.current = newDataCount;
      setAttendances(result.attendances);
      setSummary(result.summary);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err as Error);
      logger.error('Failed to fetch attendance data', { error: err }, 'ATTENDANCE');
    } finally {
      setIsLoading(false);
      setIsBackgroundRefreshing(false);
    }
  }, [employeeCode, startDate, endDate, isContainerReady, isLoading]);

  const refresh = useCallback(async () => {
    if (!employeeCode || !isContainerReady || !refreshAttendance.current) return;

    try {
      setIsBackgroundRefreshing(true);
      const result = await refreshAttendance.current.execute({
        employeeCode,
        startDate,
        endDate
      });

      setAttendances(result.attendances);
      setSummary(result.summary);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err as Error);
      logger.error('Failed to refresh attendance data', { error: err }, 'ATTENDANCE');
    } finally {
      setIsBackgroundRefreshing(false);
    }
  }, [employeeCode, startDate, endDate, isContainerReady]);

  useEffect(() => {
    // Initial data fetch
    fetchData(false);

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
              logger.realTimeUpdate('Employee attendance data changed', { employeeCode, payload });
              await fetchData(true); // Background update
            }
          )
          .subscribe();
        
        cleanupRealTime = () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
        logger.warn('Real-time setup failed, using polling fallback', { error: err }, 'ATTENDANCE');
        fallbackInterval = setInterval(() => {
          fetchData(true);
        }, refreshInterval);
      }
    } else {
      // Real-time disabled, use polling
      fallbackInterval = setInterval(() => {
        fetchData(true);
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
  }, [fetchData, refreshInterval, enableRealTime, employeeCode]);

  return {
    attendances,
    summary,
    isLoading,
    isBackgroundRefreshing,
    error,
    lastUpdate,
    refresh
  };
}
