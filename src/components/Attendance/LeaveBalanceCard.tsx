/**
 * LeaveBalanceCard - Remaining days and pending requests
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palmtree, ClipboardList, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaveBalance {
    type: string;
    remaining: number;
    total: number;
    color: string;
}

interface LeaveBalanceCardProps {
    balances: LeaveBalance[];
    pendingRequests?: number;
}

export function LeaveBalanceCard({ balances, pendingRequests = 0 }: LeaveBalanceCardProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                        <Palmtree className="h-4 w-4" />
                        Leave Balance
                    </span>
                    {pendingRequests > 0 && (
                        <span className="flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                            <ClipboardList className="h-3 w-3" />
                            {pendingRequests} pending
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {balances.length === 0 ? (
                    <div className="flex flex-col items-center py-4 text-muted-foreground">
                        <CalendarDays className="h-6 w-6 mb-2 opacity-50" />
                        <p className="text-sm">No leave balance data</p>
                    </div>
                ) : (
                    balances.map((balance, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: balance.color }}
                                />
                                <span className="text-sm">{balance.type}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="font-bold">{balance.remaining}</span>
                                <span className="text-xs text-muted-foreground">/ {balance.total} days</span>
                            </div>
                        </div>
                    ))
                )}

                {balances.length > 0 && (
                    <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Total Available</span>
                            <span className="font-bold text-emerald-600">
                                {balances.reduce((sum, b) => sum + b.remaining, 0)} days
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
