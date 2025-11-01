import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Calendar, CheckCircle, AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import { ProcessedDayData } from "@/types/attendance";
import { cn } from "@/lib/utils";

interface CurrentAttendanceCardProps {
  attendanceData: Record<string, ProcessedDayData>;
  isLoading: boolean;
}

export function CurrentAttendanceCard({ attendanceData, isLoading }: CurrentAttendanceCardProps) {
  // Get today's data
  const today = new Date().toISOString().split('T')[0];
  const todayData = attendanceData[today];

  // Get yesterday's data for comparison
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const yesterdayData = attendanceData[yesterdayStr];

  // Only show loading skeleton on initial load (when there's no data yet)
  const showSkeleton = isLoading && !todayData && !yesterdayData;

  // Calculate time ago from punch time
  const getTimeAgo = (punchTime: string, punchDate: string) => {
    const now = new Date();
    const punch = new Date(`${punchDate} ${punchTime}`);
    const diffMs = now.getTime() - punch.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (showSkeleton) {
    return (
      <Card className="bg-card border-border transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Clock className="h-5 w-5" />
            Today's Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 transition-all duration-300">
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-status-present" />;
      case 'late':
        return <AlertTriangle className="h-5 w-5 text-status-late" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-status-absent" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-status-present';
      case 'late':
        return 'bg-status-late';
      case 'absent':
        return 'bg-status-absent';
      default:
        return 'bg-muted';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'late':
        return 'Late Arrival';
      case 'absent':
        return 'Absent';
      default:
        return 'No Data';
    }
  };

  return (
    <Card className="border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-3 text-base font-semibold text-foreground">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          Today's Attendance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {todayData ? (
            <>
              {/* Today's Punch Logs - Table Style */}
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Today's Attendance
                  </h3>
                  <Badge className={cn("text-white font-medium", getStatusColor(todayData.status))}>
                    {getStatusText(todayData.status)}
                  </Badge>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-4 gap-4 px-4 py-2.5 bg-muted/50 rounded-lg text-xs font-semibold text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Date
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Time
                  </div>
                  <div>Status</div>
                  <div>Ago</div>
                </div>

                {/* Punch Logs */}
                {todayData.punchLogs && todayData.punchLogs.length > 0 ? (
                  <div className="space-y-2">
                    {[...todayData.punchLogs].reverse().map((log, index) => (
                      <div 
                        key={index}
                        className="grid grid-cols-4 gap-4 px-4 py-3 bg-card border border-border rounded-lg hover:bg-muted/30 transition-colors duration-150"
                      >
                        <div className="text-sm font-medium text-foreground">
                          {new Date(today).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full flex-shrink-0",
                            log.direction === 'in' ? 'bg-green-500' : 'bg-red-500'
                          )} />
                          <span className="text-sm font-semibold font-mono text-foreground">{log.time}</span>
                        </div>
                        <div className="flex items-center">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "font-medium text-xs",
                              log.direction === 'in' 
                                ? 'bg-green-50 border-green-600 text-green-700 dark:bg-green-950 dark:border-green-700 dark:text-green-400' 
                                : 'bg-red-50 border-red-600 text-red-700 dark:bg-red-950 dark:border-red-700 dark:text-red-400'
                            )}
                          >
                            {log.direction === 'in' ? '✓ Check In' : '✗ Check Out'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <ArrowRight className="h-3 w-3" />
                          {getTimeAgo(log.time, today)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No punch logs for today
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No attendance data for today</p>
              <p className="text-sm text-muted-foreground">Data will appear here once you check in/out</p>
            </div>
          )}

          {/* Yesterday's Data */}
          {yesterdayData && (
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Yesterday's Attendance
                </h3>
                <Badge className={cn("text-white font-medium", getStatusColor(yesterdayData.status))}>
                  {getStatusText(yesterdayData.status)}
                </Badge>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-4 gap-4 px-4 py-2.5 bg-muted/50 rounded-lg text-xs font-semibold text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Date
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Time
                </div>
                <div>Status</div>
                <div>Ago</div>
              </div>

              {/* Yesterday's Punch Logs */}
              {yesterdayData.punchLogs && yesterdayData.punchLogs.length > 0 ? (
                <div className="space-y-2">
                  {[...yesterdayData.punchLogs].reverse().map((log, index) => (
                    <div 
                      key={index}
                      className="grid grid-cols-4 gap-4 px-4 py-3 bg-card border border-border rounded-lg hover:bg-muted/30 transition-colors duration-150"
                    >
                      <div className="text-sm font-medium text-foreground">
                        {new Date(yesterdayStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full flex-shrink-0",
                          log.direction === 'in' ? 'bg-green-500' : 'bg-red-500'
                        )} />
                        <span className="text-sm font-semibold font-mono text-foreground">{log.time}</span>
                      </div>
                      <div className="flex items-center">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "font-medium text-xs",
                            log.direction === 'in' 
                              ? 'bg-green-50 border-green-600 text-green-700 dark:bg-green-950 dark:border-green-700 dark:text-green-400' 
                              : 'bg-red-50 border-red-600 text-red-700 dark:bg-red-950 dark:border-red-700 dark:text-red-400'
                          )}
                        >
                          {log.direction === 'in' ? '✓ Check In' : '✗ Check Out'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <ArrowRight className="h-3 w-3" />
                        {getTimeAgo(log.time, yesterdayStr)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No punch logs for yesterday
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


