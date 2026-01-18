/**
 * AttendanceTimeline - Vertical timeline with punch events
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, LogIn, LogOut, Coffee, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineEvent {
    time: string;
    type: 'check-in' | 'check-out' | 'break-start' | 'break-end';
    label?: string;
}

interface AttendanceTimelineProps {
    events: TimelineEvent[];
    currentWorkingHours?: string;
}

export function AttendanceTimeline({ events, currentWorkingHours }: AttendanceTimelineProps) {
    const getEventIcon = (type: TimelineEvent['type']) => {
        switch (type) {
            case 'check-in': return LogIn;
            case 'check-out': return LogOut;
            case 'break-start':
            case 'break-end': return Coffee;
            default: return Clock;
        }
    };

    const getEventColor = (type: TimelineEvent['type']) => {
        switch (type) {
            case 'check-in': return 'bg-emerald-500';
            case 'check-out': return 'bg-red-500';
            case 'break-start':
            case 'break-end': return 'bg-amber-500';
            default: return 'bg-gray-500';
        }
    };

    const getEventLabel = (type: TimelineEvent['type'], label?: string) => {
        if (label) return label;
        switch (type) {
            case 'check-in': return 'Check-in';
            case 'check-out': return 'Check-out';
            case 'break-start': return 'Break Start';
            case 'break-end': return 'Break End';
            default: return 'Event';
        }
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Attendance Timeline
                    </span>
                    {currentWorkingHours && (
                        <span className="flex items-center gap-1 text-sm font-normal text-muted-foreground">
                            <Timer className="h-3.5 w-3.5" />
                            {currentWorkingHours}
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {events.length === 0 ? (
                    <div className="flex flex-col items-center py-6 text-muted-foreground">
                        <Clock className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">No attendance data for today</p>
                        <p className="text-xs">Data will appear once you check in</p>
                    </div>
                ) : (
                    <div className="relative pl-6 space-y-4">
                        {/* Timeline line */}
                        <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-muted" />

                        {events.map((event, index) => {
                            const Icon = getEventIcon(event.type);
                            return (
                                <div key={index} className="relative flex items-start gap-3">
                                    {/* Timeline dot */}
                                    <div className={cn(
                                        "absolute -left-4 w-4 h-4 rounded-full flex items-center justify-center",
                                        getEventColor(event.type)
                                    )}>
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    </div>

                                    <div className="flex-1 flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium text-sm">
                                                {getEventLabel(event.type, event.label)}
                                            </span>
                                        </div>
                                        <span className="text-sm text-muted-foreground font-mono">
                                            {event.time}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
