import { memo, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, TrendingUp } from "lucide-react";
import { ProcessedDayData } from "@/types/attendance";
import { cn } from "@/lib/utils";

interface RecentAttendanceTableProps {
  attendanceData: Record<string, ProcessedDayData>;
  isLoading: boolean;
  onDayClick: (date: string, dayData?: ProcessedDayData) => void;
}

/**
 * RecentAttendanceTable Component
 * 
 * Displays the last 15 days of attendance records in a responsive table format.
 * Memoized to prevent unnecessary re-renders when parent components update.
 * 
 * @param attendanceData - Record of date strings to processed attendance data
 * @param isLoading - Whether data is currently loading
 * @param onDayClick - Callback when a day row is clicked
 * 
 * @example
 * ```tsx
 * <RecentAttendanceTable
 *   attendanceData={data}
 *   isLoading={false}
 *   onDayClick={(date, dayData) => handleDayClick(date, dayData)}
 * />
 * ```
 */
function RecentAttendanceTableComponent({ attendanceData, isLoading, onDayClick }: RecentAttendanceTableProps) {
  // Memoize sorted data to avoid recalculating on every render
  const recentData = useMemo(() =>
    Object.entries(attendanceData)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .slice(0, 15),
    [attendanceData]
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-status-present text-white">Present</Badge>;
      case 'late':
        return <Badge className="bg-status-late text-white">Late</Badge>;
      case 'absent':
        return <Badge className="bg-status-absent text-white">Absent</Badge>;
      case 'sick':
        return <Badge className="bg-status-sick text-white">Sick</Badge>;
      case 'vacation':
        return <Badge className="bg-status-vacation text-white">Vacation</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Attendance Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Attendance Records
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentData.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] sm:w-auto">Date</TableHead>
                <TableHead className="hidden sm:table-cell">Check In</TableHead>
                <TableHead className="hidden md:table-cell">Check Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center w-[60px]">✓</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentData.map(([date, dayData]) => (
                <TableRow
                  key={date}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onDayClick(date, dayData)}
                >
                  <TableCell className="font-medium">
                    <div className="min-w-[80px]">
                      <div className="font-semibold text-sm sm:text-base">{formatDate(date)}</div>
                      <div className="text-xs text-muted-foreground hidden sm:block">
                        {new Date(date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {dayData.checkIn ? (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-status-present" />
                        <span className="font-mono text-sm">{dayData.checkIn}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {dayData.checkOut ? (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-status-present" />
                        <span className="font-mono text-sm">{dayData.checkOut}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(dayData.status)}
                      {/* Show check-in time on mobile */}
                      <div className="sm:hidden text-xs text-muted-foreground">
                        {dayData.checkIn || '--'}
                      </div>
                      {dayData.hasAmbiguousPunches && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-xs">
                          Needs Review
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {dayData.confidence === 'high' ? (
                      <span className="text-2xl" title="High confidence">👍</span>
                    ) : dayData.confidence === 'medium' ? (
                      <span className="text-2xl" title="Medium confidence">⚠️</span>
                    ) : (
                      <span className="text-2xl" title="Low confidence">❓</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No attendance records found</p>
            <p className="text-sm text-muted-foreground">Attendance data will appear here as it's recorded</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Memoize to prevent unnecessary re-renders when parent updates
export const RecentAttendanceTable = memo(RecentAttendanceTableComponent);
