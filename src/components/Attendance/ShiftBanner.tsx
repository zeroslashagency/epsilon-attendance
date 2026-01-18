/**
 * ShiftBanner - Today's shift with active status
 */
import { Clock, CheckCircle } from 'lucide-react';

interface ShiftBannerProps {
    shiftName: string;
    startTime: string;
    endTime: string;
    isActive?: boolean;
}

export function ShiftBanner({ shiftName, startTime, endTime, isActive = true }: ShiftBannerProps) {
    return (
        <div className="p-6 rounded-lg border-2 border-yellow-500/50 bg-card">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">{shiftName.toUpperCase()} SHIFT</h2>
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{startTime} - {endTime}</span>
                    </div>
                </div>

                {isActive && (
                    <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-full border border-emerald-500/30">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-semibold">ACTIVE</span>
                    </div>
                )}
            </div>
        </div>
    );
}
