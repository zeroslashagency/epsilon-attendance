import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react";
import { ProcessedDayData } from "@/types/attendance";
import { cn } from "@/lib/utils";

interface AttendanceSummaryProps {
  attendanceData: Record<string, ProcessedDayData>;
  isLoading: boolean;
}

export function AttendanceSummary({ attendanceData, isLoading }: AttendanceSummaryProps) {
  if (isLoading) {
    return (
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle>This Week Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate weekly statistics
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
  
  const weekData = Object.entries(attendanceData).filter(([date]) => {
    const recordDate = new Date(date);
    return recordDate >= weekStart && recordDate <= today;
  });

  const presentDays = weekData.filter(([, data]) => data.status.toLowerCase() === 'present').length;
  const lateDays = weekData.filter(([, data]) => data.status.toLowerCase() === 'late').length;
  const absentDays = weekData.filter(([, data]) => data.status.toLowerCase() === 'absent').length;
  const totalWorkingDays = weekData.length;
  
  const attendanceRate = totalWorkingDays > 0 ? Math.round(((presentDays + lateDays) / totalWorkingDays) * 100) : 0;
  
  // Calculate total hours this week
  const totalHours = weekData.reduce((total, [, data]) => {
    if (data.totalHours) {
      const [hours, minutes] = data.totalHours.split(':').map(Number);
      return total + hours + (minutes / 60);
    }
    return total;
  }, 0);

  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
  };

  // Calculate average daily hours
  const avgDailyHours = totalWorkingDays > 0 ? totalHours / totalWorkingDays : 0;

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-status-present" />;
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-status-absent" />;
    }
    return null;
  };

  return (
    <Card className="bg-background border-border">
      <CardHeader>
        <CardTitle>This Week Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Attendance Rate */}
          <div className="p-4 bg-gradient-primary/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Attendance Rate</span>
              </div>
              {getTrendIcon(attendanceRate, 85)}
            </div>
            <div className="text-2xl font-bold text-primary">{attendanceRate}%</div>
            <div className="text-xs text-muted-foreground">
              {presentDays + lateDays} of {totalWorkingDays} days
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-status-present"></div>
                <span className="text-sm">Present</span>
              </div>
              <Badge variant="secondary" className="bg-status-present/20 text-status-present">
                {presentDays} days
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-status-late"></div>
                <span className="text-sm">Late</span>
              </div>
              <Badge variant="secondary" className="bg-status-late/20 text-status-late">
                {lateDays} days
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-status-absent"></div>
                <span className="text-sm">Absent</span>
              </div>
              <Badge variant="secondary" className="bg-status-absent/20 text-status-absent">
                {absentDays} days
              </Badge>
            </div>
          </div>

          {/* Hours Summary */}
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Hours</span>
              <span className="font-mono font-semibold">{formatHours(totalHours)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Daily Average</span>
              <span className="font-mono font-semibold">{formatHours(avgDailyHours)}</span>
            </div>
          </div>

          {/* Alerts */}
          {lateDays > 2 && (
            <div className="flex items-center gap-2 p-3 bg-status-late/10 border border-status-late/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-status-late" />
              <span className="text-sm text-status-late">
                High number of late arrivals this week
              </span>
            </div>
          )}

          {attendanceRate < 90 && (
            <div className="flex items-center gap-2 p-3 bg-status-absent/10 border border-status-absent/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-status-absent" />
              <span className="text-sm text-status-absent">
                Attendance rate below 90%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


