/**
 * WeeklySummaryChart - Bar chart of work hours
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DayData {
    day: string;
    hours: number;
    target?: number;
}

interface WeeklySummaryChartProps {
    data: DayData[];
    targetHours?: number;
}

export function WeeklySummaryChart({ data, targetHours = 8 }: WeeklySummaryChartProps) {
    const maxHours = Math.max(...data.map(d => d.hours), targetHours);
    const totalHours = data.reduce((sum, d) => sum + d.hours, 0);
    const avgHours = data.length > 0 ? totalHours / data.filter(d => d.hours > 0).length : 0;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Weekly Summary
                    </span>
                    <span className="text-sm font-normal text-muted-foreground">
                        Avg: {avgHours.toFixed(1)}h
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between gap-1 h-24">
                    {data.map((day, index) => {
                        const height = (day.hours / maxHours) * 100;
                        const isToday = index === new Date().getDay() - 1;
                        const metTarget = day.hours >= targetHours;

                        return (
                            <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-xs text-muted-foreground">{day.hours.toFixed(1)}h</span>
                                <div className="w-full bg-muted rounded-t-sm relative" style={{ height: '100%' }}>
                                    <div
                                        className={cn(
                                            "absolute bottom-0 w-full rounded-t-sm transition-all duration-500",
                                            metTarget
                                                ? "bg-gradient-to-t from-emerald-500 to-emerald-400"
                                                : "bg-gradient-to-t from-cyan-500 to-cyan-400",
                                            isToday && "ring-2 ring-primary"
                                        )}
                                        style={{ height: `${height}%` }}
                                    />
                                    {/* Target line */}
                                    <div
                                        className="absolute w-full border-t-2 border-dashed border-amber-400/50"
                                        style={{ bottom: `${(targetHours / maxHours) * 100}%` }}
                                    />
                                </div>
                                <span className={cn(
                                    "text-xs font-medium",
                                    isToday ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {day.day}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t text-sm">
                    <span className="text-muted-foreground">Total this week</span>
                    <span className="font-bold">{totalHours.toFixed(1)} hours</span>
                </div>
            </CardContent>
        </Card>
    );
}
