/**
 * MonthlyCalendar - Color-coded attendance calendar grid
 */
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'weekend' | 'holiday' | 'future';

interface DayData {
    date: number;
    status: AttendanceStatus;
}

interface MonthlyCalendarProps {
    attendanceData: Record<string, AttendanceStatus>;
    year?: number;
    month?: number;
}

export function MonthlyCalendar({ attendanceData, year: propYear, month: propMonth }: MonthlyCalendarProps) {
    const today = new Date();
    const [year, setYear] = useState(propYear || today.getFullYear());
    const [month, setMonth] = useState(propMonth || today.getMonth());

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Mon = 0

    const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
        'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

    const getStatusColor = (status: AttendanceStatus) => {
        switch (status) {
            case 'present': return 'bg-emerald-500 text-white';
            case 'absent': return 'bg-red-500 text-white';
            case 'late': return 'bg-yellow-500 text-black';
            case 'weekend': return 'bg-muted text-muted-foreground';
            case 'holiday': return 'bg-blue-500 text-white';
            case 'future': return 'bg-transparent border border-muted-foreground/30 text-muted-foreground';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const getDayStatus = (day: number): AttendanceStatus => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();

        // Future dates
        if (date > today) return 'future';

        // Weekends
        if (dayOfWeek === 0 || dayOfWeek === 6) return 'weekend';

        // Check attendance data
        if (attendanceData[dateStr]) return attendanceData[dateStr];

        // Default to absent for past dates
        if (date < today) return 'absent';

        return 'future';
    };

    const goToPrevMonth = () => {
        if (month === 0) {
            setMonth(11);
            setYear(year - 1);
        } else {
            setMonth(month - 1);
        }
    };

    const goToNextMonth = () => {
        if (month === 11) {
            setMonth(0);
            setYear(year + 1);
        } else {
            setMonth(month + 1);
        }
    };

    // Generate calendar grid
    const days: (DayData | null)[] = [];
    for (let i = 0; i < adjustedFirstDay; i++) {
        days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        days.push({ date: day, status: getDayStatus(day) });
    }

    // Count stats
    const stats = {
        present: Object.values(attendanceData).filter(s => s === 'present').length,
        absent: Object.values(attendanceData).filter(s => s === 'absent').length,
        late: Object.values(attendanceData).filter(s => s === 'late').length,
    };

    return (
        <div className="rounded-lg border-2 border-yellow-500/50 bg-card overflow-hidden">
            <div className="p-4 border-b border-yellow-500/30">
                <h3 className="font-bold text-lg text-yellow-500">THIS MONTH ATTENDANCE SUMMARY</h3>
            </div>

            <div className="p-4">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-bold text-lg">{monthNames[month]} {year}</span>
                    <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                        <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, index) => (
                        <div
                            key={index}
                            className={cn(
                                "aspect-square flex flex-col items-center justify-center rounded text-sm font-medium",
                                day ? getStatusColor(day.status) : 'bg-transparent'
                            )}
                        >
                            {day && (
                                <>
                                    <span className="text-xs">{day.date}</span>
                                    {day.status !== 'future' && day.status !== 'weekend' && (
                                        <span className="text-[10px] uppercase">{day.status}</span>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-yellow-500/20">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-emerald-500" />
                        <span className="text-xs">Present</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-red-500" />
                        <span className="text-xs">Absent</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-yellow-500" />
                        <span className="text-xs">Late</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
