/**
 * ShiftCard - Current shift display with times
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Sun, Moon, Sunset } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShiftCardProps {
    shiftName: string;
    startTime: string;
    endTime: string;
    color?: string;
    isActive?: boolean;
}

export function ShiftCard({
    shiftName,
    startTime,
    endTime,
    color = '#06b6d4',
    isActive = true
}: ShiftCardProps) {
    const getShiftIcon = () => {
        const hour = parseInt(startTime.split(':')[0]);
        if (hour >= 6 && hour < 12) return Sun;
        if (hour >= 12 && hour < 18) return Sunset;
        return Moon;
    };

    const ShiftIcon = getShiftIcon();

    return (
        <Card className={cn(
            "overflow-hidden transition-all",
            isActive && "ring-2 ring-primary/50"
        )}>
            <div
                className="h-1"
                style={{ backgroundColor: color }}
            />
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <ShiftIcon className="h-4 w-4" style={{ color }} />
                    Today's Shift
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xl font-bold">{shiftName}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{startTime} - {endTime}</span>
                        </div>
                    </div>
                    {isActive && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-full">
                            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Active
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
