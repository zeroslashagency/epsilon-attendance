import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { AttendanceStatus } from "@/types/attendance";

interface DayData {
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  totalHours?: string;
  confidence?: 'high' | 'medium' | 'low';
  hasAmbiguousPunches?: boolean;
}

interface AttendanceCalendarProps {
  year: number;
  data: Record<string, DayData>;
  onDayClick: (date: string, dayData?: DayData) => void;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const statusColors = {
  present: 'bg-status-present',
  late: 'bg-status-late',
  absent: 'bg-status-absent',
  sick: 'bg-status-sick',
  vacation: 'bg-status-vacation',
  break: 'bg-status-break',
  ambiguous: 'bg-yellow-500'
};

const statusLabels = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  sick: 'Sick Leave',
  vacation: 'Vacation',
  break: 'Break',
  ambiguous: 'Needs Review'
};

export function AttendanceCalendar({ year, data, onDayClick }: AttendanceCalendarProps) {
  const [selectedYear, setSelectedYear] = useState(year);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDateKey = (year: number, month: number, day: number) => {
    const monthStr = (month + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Calendar className="h-5 w-5" />
          Attendance Portfolio
        </CardTitle>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedYear(selectedYear - 1)}
            className="p-1 hover:bg-accent rounded"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-semibold min-w-[4rem] text-center">{selectedYear}</span>
          <button
            onClick={() => setSelectedYear(selectedYear + 1)}
            className="p-1 hover:bg-accent rounded"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Legend */}
        <div className="flex flex-wrap gap-2 text-xs">
          {Object.entries(statusLabels).map(([status, label]) => (
            <div key={status} className="flex items-center gap-1">
              <div className={cn("h-3 w-3 rounded", statusColors[status as AttendanceStatus])} />
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Compact Year Calendar */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header row with weekdays */}
            <div className="grid grid-cols-[120px_repeat(7,minmax(0,1fr))] gap-px bg-border/30 border border-border/30">
              <div className="bg-muted/50 text-muted-foreground font-medium text-xs p-2 flex items-center">
                Month
              </div>
              {weekdays.map((day, i) => (
                <div key={i} className="bg-muted/50 text-center text-[10px] p-2 flex items-center justify-center">
                  <div className="text-muted-foreground font-semibold">{day.toUpperCase()}</div>
                </div>
              ))}
            </div>

            {/* Month rows */}
            {months.map((month, monthIndex) => {
              const daysInMonth = getDaysInMonth(monthIndex, selectedYear);
              const firstDayOfWeek = getFirstDayOfMonth(monthIndex, selectedYear);
              const weeks = [];
              let currentWeek = [];

              // Add empty cells for days before the first day
              for (let i = 0; i < firstDayOfWeek; i++) {
                currentWeek.push(null);
              }

              // Add all days of the month
              for (let day = 1; day <= daysInMonth; day++) {
                currentWeek.push(day);

                // If week is complete or it's the last day of month, push the week
                if (currentWeek.length === 7 || day === daysInMonth) {
                  // Fill remaining cells if needed
                  while (currentWeek.length < 7) {
                    currentWeek.push(null);
                  }
                  weeks.push([...currentWeek]);
                  currentWeek = [];
                }
              }

              return (
                <div key={month} className="border-b border-border/30">
                  {weeks.map((week, weekIndex) => (
                    <div key={`${month}-week-${weekIndex}`} className="grid grid-cols-[120px_repeat(7,minmax(0,1fr))] gap-px bg-border/30 border-x border-border/30">
                      {/* Month name only on first week, empty space otherwise */}
                      {weekIndex === 0 ? (
                        <div className="bg-muted/30 text-sm font-medium text-muted-foreground p-2 flex items-center">
                          {month}
                        </div>
                      ) : (
                        <div className="bg-muted/30" />
                      )}

                      {/* Day cells for this week */}
                      {week.map((dayNumber, dayIndex) => {
                        if (dayNumber === null) {
                          return <div key={`empty-${dayIndex}`} className="bg-muted/10 h-12" />;
                        }

                        const actualDate = new Date(selectedYear, monthIndex, dayNumber);
                        const actualDayOfWeek = actualDate.getDay();
                        const dateKey = formatDateKey(selectedYear, monthIndex, dayNumber);
                        const dayData = data[dateKey];
                        const isToday = new Date().toDateString() === actualDate.toDateString();
                        const isWeekend = actualDayOfWeek === 0 || actualDayOfWeek === 6;

                        return (
                          <div
                            key={dayNumber}
                            onClick={() => onDayClick(dateKey, dayData)}
                            className={cn(
                              "bg-card h-12 flex items-center justify-center text-sm cursor-pointer transition-all hover:scale-105",
                              "hover:bg-accent text-foreground",
                              isToday && "ring-2 ring-primary ring-inset",
                              dayData?.hasAmbiguousPunches && "ring-2 ring-yellow-500 ring-inset",
                              dayData && statusColors[dayData.status],
                              isWeekend && !dayData && "bg-muted/20"
                            )}
                            title={`${weekdays[actualDayOfWeek]} ${month} ${dayNumber}, ${selectedYear}${dayData ? ` - ${dayData.status}` : ''}`}
                          >
                            <span className="font-medium">{dayNumber}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}