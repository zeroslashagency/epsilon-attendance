/**
 * AttendancePage - Final Design with Overview & Calendar integrated
 */
import { useState, useEffect, useMemo } from "react";
import {
  Clock,
  Calendar as CalendarIcon,
  TrendingUp,
  Timer,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Palmtree,
  Send,
  FileText,
  Users
} from 'lucide-react';
import { AttendanceHistory } from '@/components/Attendance/AttendanceHistory';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useAttendanceData } from "@/hooks/useAttendanceData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const AttendancePage = () => {
  const [firPoints, setFirPoints] = useState(0);
  const [shiftData, setShiftData] = useState<{ name?: string | null; start_time?: string | null; end_time?: string | null } | null>(null);
  const [leaveBalance, setLeaveBalance] = useState<Array<{ type: string; remaining: number }>>([]);

  const {
    user,
    employeeCode,
    employeeName,
    role,
    isStandalone,
    standaloneEmployeeCode,
    standaloneEmployeeName
  } = useAuth();

  const activeEmployeeCode = isStandalone ? standaloneEmployeeCode : employeeCode;
  const activeName = isStandalone ? standaloneEmployeeName : employeeName;
  const email = user?.email || 'user@example.com';

  const { attendanceData, silentRefresh } = useAttendanceData({
    employeeCode: activeEmployeeCode,
    enableRealTime: true,
    refreshInterval: 30000
  });

  // Fetch FIR points
  useEffect(() => {
    const fetchFIRPoints = async () => {
      if (!activeEmployeeCode) return;

      // First get the employee_master.id for this employee_code
      const { data: empData } = await supabase
        .from('employee_master')
        .select('id')
        .eq('employee_code', activeEmployeeCode)
        .maybeSingle();

      if (!empData?.id) return;

      // Now query fir_activity with the integer employee_id
      const { data } = await supabase
        .from('fir_activity')
        .select('id, status')
        .eq('employee_id', empData.id);
      if (data) {
        setFirPoints(data.filter(f => f.status === 'resolved').length * 100);
      }
    };
    fetchFIRPoints();
  }, [activeEmployeeCode]);

  // Fetch shift
  useEffect(() => {
    const fetchShift = async () => {
      if (!activeEmployeeCode) return;
      const { data } = await supabase
        .from('employee_shift_assignments')
        .select('*, shift_templates(*)')
        .eq('employee_code', activeEmployeeCode)
        .maybeSingle();
      if (data?.shift_templates) {
        setShiftData(data.shift_templates);
      }
    };
    fetchShift();
  }, [activeEmployeeCode]);

  // Fetch leave balance
  useEffect(() => {
    const fetchLeave = async () => {
      if (!activeEmployeeCode) return;
      const { data } = await supabase
        .from('employee_leave_balances')
        .select('*, leave_types(*)')
        .eq('employee_code', activeEmployeeCode);
      if (data) {
        setLeaveBalance(data.map(d => ({
          type: d.leave_types?.name || 'Leave',
          remaining: d.remaining_days || 0,
        })));
      }
    };
    fetchLeave();
  }, [activeEmployeeCode]);

  // Stats
  const stats = useMemo(() => {
    const days = Object.values(attendanceData);
    return {
      present: days.filter(d => d.status === 'present').length,
      late: days.filter(d => d.status === 'late').length,
      absent: days.filter(d => d.status === 'absent').length,
      totalHours: days.reduce((sum, d) => {
        const hrs = parseFloat(d.totalHours?.replace(':', '.') || '0');
        return sum + hrs;
      }, 0)
    };
  }, [attendanceData]);

  // Activity logs
  const activityLogs = useMemo(() => {
    return Object.entries(attendanceData)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .slice(0, 10)
      .map(([date, data]) => ({
        date,
        formattedDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        title: data.status === 'present'
          ? 'Punch In'
          : data.status === 'late' ? 'Late Arrival' : 'Absent',
        description: data.status !== 'absent'
          ? `Worked ${data.totalHours || '0:00'} hours`
          : 'No attendance recorded',
        status: data.status === 'late' ? 'Late' : data.status === 'present' ? 'Present' : 'Absent',
        statusColor: data.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
          data.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
      }));
  }, [attendanceData]);

  const initials = (activeName || email.split('@')[0])
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const today = new Date().getDate();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex gap-6 p-6">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20 ring-4 ring-lime-400/30">
              <AvatarImage src="" alt={activeName || ''} />
              <AvatarFallback className="bg-gradient-to-br from-lime-400 to-yellow-400 text-2xl font-bold text-lime-900">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{activeName || email.split('@')[0]}</h1>
              <p className="text-muted-foreground">
                {role} • Epsilon Corp • {shiftData?.name || 'General'} Shift ({shiftData?.start_time || '09:00'} - {shiftData?.end_time || '18:00'})
              </p>
              <div className="flex gap-2 mt-2">
                <Badge className="bg-orange-400 text-orange-900 hover:bg-orange-400">High</Badge>
                <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400">Warm</Badge>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="card-shadow">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.present}</p>
                  <p className="text-xs text-muted-foreground">Present</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-shadow">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-full bg-yellow-100">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.late}</p>
                  <p className="text-xs text-muted-foreground">Late</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-shadow">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-100">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.absent}</p>
                  <p className="text-xs text-muted-foreground">Absent</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-shadow">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <Timer className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalHours.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Hours</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs with Overview & Calendar */}
          <Card className="card-shadow">
            <Tabs defaultValue="overview" className="w-full">
              <CardHeader className="pb-0">
                <TabsList className="w-auto">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="pt-4">
                {/* Overview Tab */}
                <TabsContent value="overview" className="m-0 space-y-4">
                  {activityLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No attendance data yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activityLogs.map((log, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-muted/30 border hover:border-lime-400/50 transition-colors">
                          <div className="text-center min-w-[60px]">
                            <p className="text-xs text-muted-foreground">{log.formattedDate.split(' ')[0]}</p>
                            <p className="text-2xl font-bold">{log.formattedDate.split(' ')[1]}</p>
                          </div>
                          <div className={cn(
                            "w-3 h-3 rounded-full mt-2 ring-4 ring-background",
                            log.status === 'Present' ? "bg-emerald-500" :
                              log.status === 'Late' ? "bg-yellow-500" : "bg-red-500"
                          )} />
                          <div className="flex-1">
                            <p className="font-medium">{log.title}</p>
                            <p className="text-sm text-muted-foreground">{log.description}</p>
                          </div>
                          <Badge className={log.statusColor}>{log.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Calendar Tab */}
                <TabsContent value="calendar" className="m-0">
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                      const dateStr = `2026-01-${String(day).padStart(2, '0')}`;
                      const data = attendanceData[dateStr];

                      return (
                        <div
                          key={day}
                          className={cn(
                            "aspect-square flex flex-col items-center justify-center rounded-lg text-sm",
                            day === today && "ring-2 ring-lime-400",
                            data?.status === 'present' && "bg-emerald-100 text-emerald-700",
                            data?.status === 'late' && "bg-yellow-100 text-yellow-700",
                            data?.status === 'absent' && "bg-red-100 text-red-700",
                            !data && day < today && "bg-muted/50 text-muted-foreground",
                            day > today && "text-muted-foreground/50"
                          )}
                        >
                          <span className="font-medium">{day}</span>
                          {data?.status === 'present' && (
                            <span className="text-[10px]">P</span>
                          )}
                          {data?.status === 'late' && (
                            <span className="text-[10px]">Late</span>
                          )}
                          {data?.status === 'absent' && <span className="text-[10px]">A</span>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-emerald-500" />
                      <span className="text-xs">Present</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-yellow-500" />
                      <span className="text-xs">Late</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-red-500" />
                      <span className="text-xs">Absent</span>
                    </div>
                  </div>
                </TabsContent>

                {/* Timeline Tab */}
                <TabsContent value="timeline" className="m-0">
                  <div className="space-y-4">
                    {activityLogs.slice(0, 5).map((log, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            log.status === 'Present' ? "bg-emerald-500" :
                              log.status === 'Late' ? "bg-yellow-500" : "bg-red-500"
                          )} />
                          {i < 4 && <div className="w-0.5 h-12 bg-muted" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">{log.title}</p>
                          <p className="text-sm text-muted-foreground">{log.formattedDate}</p>
                          <p className="text-sm text-muted-foreground">{log.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="m-0">
                  <AttendanceHistory />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="w-72 space-y-4">
          <Card className="card-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Current Shift
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="font-bold">{shiftData?.name || 'General'}</span>
                <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {shiftData?.start_time || '09:00'} - {shiftData?.end_time || '18:00'}
              </p>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Present</span>
                <span className="font-bold text-emerald-600">{stats.present}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Late</span>
                <span className="font-bold text-yellow-600">{stats.late}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Absent</span>
                <span className="font-bold text-red-600">{stats.absent}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Hours</span>
                  <span className="font-bold">{stats.totalHours.toFixed(0)}h</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palmtree className="h-4 w-4" />
                Leave Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {leaveBalance.length === 0 ? (
                <p className="text-sm text-muted-foreground">No leave data</p>
              ) : (
                leaveBalance.map((leave, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-sm">{leave.type}</span>
                    <span className="font-bold">{leave.remaining}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2 bg-lime-50 border-lime-200 text-lime-700 hover:bg-lime-100">
                <Send className="h-4 w-4" />
                Request Leave
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileText className="h-4 w-4" />
                Apply WFH
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Team Status
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
