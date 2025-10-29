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

  if (isLoading) {
    return (
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
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
    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <CardTitle className="flex items-center gap-3 text-base font-semibold text-gray-900">
          <div className="p-2 bg-green-50 rounded-lg border border-green-100">
            <Clock className="h-4 w-4 text-green-600" />
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
                <div className="grid grid-cols-4 gap-4 px-4 py-2.5 bg-gray-50 rounded-lg text-xs font-semibold text-gray-600 border border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    Date
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    Time
                  </div>
                  <div>Status</div>
                  <div>Elapsed</div>
                </div>

                {/* Punch Logs */}
                {todayData.punchLogs && todayData.punchLogs.length > 0 ? (
                  <div className="space-y-2">
                    {todayData.punchLogs.map((log, index) => (
                      <div 
                        key={index}
                        className="grid grid-cols-4 gap-4 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-sm transition-all duration-150"
                      >
                        <div className="text-sm font-medium text-gray-700">
                          {new Date(today).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full flex-shrink-0",
                            log.direction === 'in' ? 'bg-green-500' : 'bg-red-500'
                          )} />
                          <span className="text-sm font-semibold font-mono text-gray-900">{log.time}</span>
                        </div>
                        <div className="flex items-center">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "font-medium text-xs px-2.5 py-0.5",
                              log.direction === 'in' 
                                ? 'bg-green-50 border-green-600 text-green-700' 
                                : 'bg-red-50 border-red-600 text-red-700'
                            )}
                          >
                            {log.direction === 'in' ? '✓ Check In' : '✗ Check Out'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
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
              <div className="grid grid-cols-4 gap-4 px-4 py-2.5 bg-gray-50 rounded-lg text-xs font-semibold text-gray-600 border border-gray-100">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  Date
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  Time
                </div>
                <div>Status</div>
                <div>Elapsed</div>
              </div>

              {/* Yesterday's Punch Logs */}
              {yesterdayData.punchLogs && yesterdayData.punchLogs.length > 0 ? (
                <div className="space-y-2">
                  {yesterdayData.punchLogs.map((log, index) => (
                    <div 
                      key={index}
                      className="grid grid-cols-4 gap-4 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-sm transition-all duration-150"
                    >
                      <div className="text-sm font-medium text-gray-700">
                        {new Date(yesterdayStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full flex-shrink-0",
                          log.direction === 'in' ? 'bg-green-500' : 'bg-red-500'
                        )} />
                        <span className="text-sm font-semibold font-mono text-gray-900">{log.time}</span>
                      </div>
                      <div className="flex items-center">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "font-medium text-xs px-2.5 py-0.5",
                            log.direction === 'in' 
                              ? 'bg-green-50 border-green-600 text-green-700' 
                              : 'bg-red-50 border-red-600 text-red-700'
                          )}
                        >
                          {log.direction === 'in' ? '✓ Check In' : '✗ Check Out'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
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


