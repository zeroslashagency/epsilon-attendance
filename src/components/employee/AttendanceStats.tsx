import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Target,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  icon: React.ReactNode;
  onClick?: () => void;
  status?: 'good' | 'warning' | 'error';
}

function StatCard({ title, value, subtitle, trend, icon, onClick, status }: StatCardProps) {
  const statusColors = {
    good: 'border-status-present/20 bg-status-present/5',
    warning: 'border-status-late/20 bg-status-late/5', 
    error: 'border-status-absent/20 bg-status-absent/5'
  };

  const statusIcons = {
    good: <CheckCircle className="h-4 w-4 text-status-present" />,
    warning: <AlertCircle className="h-4 w-4 text-status-late" />,
    error: <XCircle className="h-4 w-4 text-status-absent" />
  };

  return (
    <Card 
      className={cn(
        "bg-card border-border transition-all hover:scale-[1.02] cursor-pointer h-full flex flex-col",
        status && statusColors[status]
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {status && statusIcons[status]}
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pb-4 flex-1">
        <div className="text-2xl font-bold mb-1 text-foreground">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mb-2 leading-tight">
            {subtitle}
          </p>
        )}
        {trend && (
          <div className="flex items-center gap-1 flex-wrap">
            <div className="flex items-center">
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3 text-status-present mr-1 flex-shrink-0" />
              ) : (
                <TrendingDown className="h-3 w-3 text-status-absent mr-1 flex-shrink-0" />
              )}
              <span className={cn(
                "text-xs font-medium whitespace-nowrap",
                trend.isPositive ? "text-status-present" : "text-status-absent"
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AttendanceStatsProps {
  stats: {
    totalAttendance: number;
    workingDays: number;
    avgCheckIn: string;
    avgCheckOut: string;
    sickDays: number;
    vacationDays: number;
    lateDays: number;
    ambiguousEntries: number;
  };
  onStatClick: (statType: string) => void;
}

export function AttendanceStats({ stats, onStatClick }: AttendanceStatsProps) {
  const attendanceRate = Math.round((stats.totalAttendance / stats.workingDays) * 100);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
      <StatCard
        title="Total Attendance"
        value={stats.totalAttendance}
        subtitle={`${attendanceRate}% attendance rate`}
        icon={<Target className="h-4 w-4" />}
        onClick={() => onStatClick('attendance')}
        status={attendanceRate >= 95 ? 'good' : attendanceRate >= 85 ? 'warning' : 'error'}
        trend={{
          value: 2.5,
          isPositive: true,
          label: 'vs last month'
        }}
      />
      
      <StatCard
        title="Working Days"
        value={stats.workingDays}
        subtitle="Total working days"
        icon={<Calendar className="h-4 w-4" />}
        onClick={() => onStatClick('working-days')}
      />
      
      <StatCard
        title="Avg Check In"
        value={stats.avgCheckIn}
        subtitle="Average arrival time"
        icon={<Clock className="h-4 w-4" />}
        onClick={() => onStatClick('check-in')}
        status="good"
      />
      
      <StatCard
        title="Avg Check Out"
        value={stats.avgCheckOut}
        subtitle="Average departure time"
        icon={<Clock className="h-4 w-4" />}
        onClick={() => onStatClick('check-out')}
        status="good"
      />
      
      <StatCard
        title="Sick Days"
        value={stats.sickDays}
        subtitle="Days taken as sick leave"
        icon={<AlertCircle className="h-4 w-4" />}
        onClick={() => onStatClick('sick')}
        status={stats.sickDays <= 5 ? 'good' : stats.sickDays <= 10 ? 'warning' : 'error'}
      />
      
      <StatCard
        title="Vacation Days"
        value={stats.vacationDays}
        subtitle="Days taken as vacation"
        icon={<Calendar className="h-4 w-4" />}
        onClick={() => onStatClick('vacation')}
        status="good"
      />
      
      <StatCard
        title="Late Arrivals"
        value={stats.lateDays}
        subtitle="Days arrived late"
        icon={<Clock className="h-4 w-4" />}
        onClick={() => onStatClick('late')}
        status={stats.lateDays <= 2 ? 'good' : stats.lateDays <= 5 ? 'warning' : 'error'}
      />
      
      <StatCard
        title="Needs Review"
        value={stats.ambiguousEntries}
        subtitle="Ambiguous entries"
        icon={<AlertCircle className="h-4 w-4" />}
        onClick={() => onStatClick('ambiguous')}
        status={stats.ambiguousEntries === 0 ? 'good' : stats.ambiguousEntries <= 3 ? 'warning' : 'error'}
      />
    </div>
  );
}