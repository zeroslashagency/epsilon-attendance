import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  TrendingUp, 
  Clock
} from "lucide-react";
import { Employee, AttendanceStats, ProcessedDayData } from "@/types/attendance";
import { useMemo } from "react";

interface OverviewHeaderProps {
  employee: Employee;
  stats: AttendanceStats;
  onExport?: () => void; // Optional, not used
  attendanceData?: Record<string, ProcessedDayData>;
}

export function OverviewHeader({ employee, stats, attendanceData = {} }: OverviewHeaderProps) {
  const attendanceRate = stats.workingDays > 0 ? Math.round((stats.totalAttendance / stats.workingDays) * 100) : 0;
  
  // Get start and end dates for activity chart
  const activityDateRange = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 29);
    
    return {
      start: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  }, []);
  
  // Calculate real activity data for the last 30 days
  const activityData = useMemo(() => {
    const today = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });
    
    return last30Days.map(date => {
      const dayData = attendanceData[date];
      if (!dayData) {
        return 0;
      }
      
      // Calculate activity percentage based on status (case-insensitive)
      const status = dayData.status.toLowerCase();
      
      if (status === 'present') return 100;
      if (status === 'late') return 80;
      if (status === 'absent') return 0;
      return 50;
    });
  }, [attendanceData]);
  
  // Calculate "This Month" stats from real data
  const thisMonthStats = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    let presentDays = 0;
    let lateDays = 0;
    let leaveDays = 0;
    
    Object.entries(attendanceData).forEach(([dateStr, dayData]) => {
      // Parse date properly - handle both YYYY-MM-DD and other formats
      const date = new Date(dateStr + 'T00:00:00');
      const dataMonth = date.getMonth();
      const dataYear = date.getFullYear();
      
      if (dataMonth === currentMonth && dataYear === currentYear) {
        const status = dayData.status.toLowerCase();
        if (status === 'present') presentDays++;
        else if (status === 'late') lateDays++;
        else if (status === 'vacation' || status === 'sick') leaveDays++;
      }
    });
    return { presentDays, lateDays, leaveDays };
  }, [attendanceData]);
  
  // Calculate on-time percentage
  const onTimePercentage = stats.totalAttendance > 0 
    ? Math.round(((stats.totalAttendance - stats.lateDays) / stats.totalAttendance) * 100) 
    : 0;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center text-white text-xl font-bold">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
              <p className="text-gray-600">{employee.role} • {employee.employeeCode}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {/* Achievements */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.workingDays}</div>
                <div className="text-xs text-gray-600">Total Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{attendanceRate}%</div>
                <div className="text-xs text-gray-600">Attendance Rate</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">On Time</span>
                <span className="text-sm font-medium text-gray-900">{stats.totalAttendance - stats.lateDays}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${onTimePercentage}%` }}></div>
              </div>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Activity
            </h2>
            <div className="flex items-end gap-1 h-24 bg-gray-50 rounded-lg p-2">
              {activityData.map((height, i) => {
                const day = i + 1;
                // Make bars more visible - scale up the height
                const displayHeight = height > 0 ? Math.max(height, 20) : 8;
                return (
                  <div key={i} className="flex-1 flex items-end" style={{ height: '100%' }}>
                    <div 
                      className={`w-full rounded-t transition-all duration-300 hover:opacity-80 ${
                        height === 100 ? 'bg-green-600' : 
                        height === 80 ? 'bg-yellow-500' : 
                        height === 0 ? 'bg-gray-300' : 
                        'bg-green-500'
                      }`}
                      style={{ 
                        height: `${displayHeight}%`,
                        minHeight: '8px'
                      }}
                      title={`Day ${day}: ${height === 100 ? 'Present' : height === 80 ? 'Late' : height === 0 ? 'Absent' : 'Partial'}`}
                    ></div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{activityDateRange.start}</span>
              <span>{activityDateRange.end}</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              This Month
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Present</span>
                <Badge variant="secondary" className="bg-green-50 text-green-700 border border-green-200">{thisMonthStats.presentDays} days</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Late</span>
                <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border border-yellow-200">{thisMonthStats.lateDays} days</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Leave</span>
                <Badge variant="secondary" className="bg-orange-50 text-orange-700 border border-orange-200">{thisMonthStats.leaveDays} days</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


