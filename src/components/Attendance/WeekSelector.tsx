/**
 * WeekSelector - Sticky horizontal week navigation
 */
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WeekSelectorProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

export function WeekSelector({ selectedDate, onDateChange }: WeekSelectorProps) {
    const [weekStart, setWeekStart] = useState(() => {
        const start = new Date(selectedDate);
        start.setDate(start.getDate() - start.getDay() + 1); // Monday
        return start;
    });

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const getWeekDates = () => {
        return days.map((_, i) => {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            return date;
        });
    };

    const weekDates = getWeekDates();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const goToPrevWeek = () => {
        const newStart = new Date(weekStart);
        newStart.setDate(newStart.getDate() - 7);
        setWeekStart(newStart);
    };

    const goToNextWeek = () => {
        const newStart = new Date(weekStart);
        newStart.setDate(newStart.getDate() + 7);
        setWeekStart(newStart);
    };

    const isSelected = (date: Date) => {
        return date.toDateString() === selectedDate.toDateString();
    };

    const isToday = (date: Date) => {
        return date.toDateString() === today.toDateString();
    };

    return (
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b pb-3">
            <div className="flex items-center justify-between gap-2">
                <Button variant="ghost" size="icon" onClick={goToPrevWeek}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex gap-1 flex-1 justify-center">
                    {weekDates.map((date, i) => (
                        <button
                            key={i}
                            onClick={() => onDateChange(date)}
                            className={cn(
                                "flex flex-col items-center px-3 py-2 rounded-xl transition-all min-w-[52px]",
                                isSelected(date)
                                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                                    : "hover:bg-muted",
                                isToday(date) && !isSelected(date) && "ring-2 ring-primary/50"
                            )}
                        >
                            <span className="text-xs font-medium opacity-70">{days[i]}</span>
                            <span className="text-lg font-bold">{date.getDate()}</span>
                            {isToday(date) && (
                                <span className="text-[10px] font-medium text-emerald-500">(Today)</span>
                            )}
                        </button>
                    ))}
                </div>

                <Button variant="ghost" size="icon" onClick={goToNextWeek}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
