/**
 * Example Component: AttendanceCard
 * Demonstrates how to use the new Clean Architecture view model hooks
 * 
 * This is an EXAMPLE showing the migration pattern.
 * Actual components will be updated in the next step.
 */
import { useAttendanceViewModel } from '../hooks/useAttendanceViewModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface AttendanceCardProps {
  employeeCode: string;
  startDate: string;
  endDate: string;
}

export function AttendanceCard({ employeeCode, startDate, endDate }: AttendanceCardProps) {
  // ✅ NEW: Use view model hook instead of direct Supabase
  const { attendances, summary, isLoading, error, refresh } = useAttendanceViewModel({
    employeeCode,
    startDate,
    endDate
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!summary) {
    return <div>No data available</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Attendance Summary</span>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Days:</span>
            <span className="font-semibold">{summary.totalDays}</span>
          </div>
          <div className="flex justify-between">
            <span>Present:</span>
            <span className="font-semibold text-green-600">{summary.presentDays}</span>
          </div>
          <div className="flex justify-between">
            <span>Absent:</span>
            <span className="font-semibold text-red-600">{summary.absentDays}</span>
          </div>
          <div className="flex justify-between">
            <span>Late:</span>
            <span className="font-semibold text-yellow-600">{summary.lateDays}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Hours:</span>
            <span className="font-semibold">{summary.totalHours}</span>
          </div>
          <div className="flex justify-between">
            <span>Attendance Rate:</span>
            <span className="font-semibold">{summary.attendanceRate}%</span>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold mb-2">Recent Attendance</h4>
          <div className="space-y-1">
            {attendances.slice(0, 5).map((attendance) => (
              <div key={attendance.date} className="flex justify-between text-sm">
                <span>{attendance.date}</span>
                <span className={
                  attendance.status === 'present' ? 'text-green-600' :
                  attendance.status === 'late' ? 'text-yellow-600' :
                  'text-red-600'
                }>
                  {attendance.status} - {attendance.totalHours}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/*
 * MIGRATION PATTERN:
 * 
 * BEFORE (Old way with direct Supabase):
 * ----------------------------------------
 * import { supabase } from '@/lib/supabase';
 * 
 * function MyComponent() {
 *   const [data, setData] = useState([]);
 *   
 *   useEffect(() => {
 *     supabase.from('employee_raw_logs').select('*').then(...)
 *   }, []);
 * }
 * 
 * AFTER (New way with view model):
 * ----------------------------------------
 * import { useAttendanceViewModel } from '@/presentation/hooks';
 * 
 * function MyComponent() {
 *   const { attendances, summary, isLoading, error, refresh } = 
 *     useAttendanceViewModel({ employeeCode, startDate, endDate });
 * }
 * 
 * BENEFITS:
 * - ✅ No direct database access in UI
 * - ✅ Business logic in domain layer
 * - ✅ Easy to test
 * - ✅ Easy to mock
 * - ✅ Type-safe DTOs
 * - ✅ Centralized error handling
 */
