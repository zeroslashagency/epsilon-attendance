/**
 * TodaysLogsTable - Table showing today's punch logs
 */
import { Clock } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface PunchLog {
    time: string;
    direction: 'IN' | 'OUT';
    status: 'ON TIME' | 'LATE' | 'BREAK' | 'BACK FROM BREAK' | 'LATE CHECKOUT';
}

interface TodaysLogsTableProps {
    logs: PunchLog[];
}

export function TodaysLogsTable({ logs }: TodaysLogsTableProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ON TIME': return 'text-emerald-500';
            case 'LATE':
            case 'LATE CHECKOUT': return 'text-red-500';
            case 'BREAK':
            case 'BACK FROM BREAK': return 'text-yellow-500';
            default: return 'text-muted-foreground';
        }
    };

    const getDirectionColor = (direction: string) => {
        return direction === 'IN' ? 'text-emerald-500' : 'text-red-500';
    };

    return (
        <div className="rounded-lg border-2 border-yellow-500/50 bg-card overflow-hidden">
            <div className="p-4 border-b border-yellow-500/30">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    TODAY'S LOGS
                </h3>
            </div>

            {logs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No logs for today</p>
                    <p className="text-sm">Logs will appear once you punch in</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow className="border-yellow-500/30">
                            <TableHead className="text-yellow-500/80">TIME</TableHead>
                            <TableHead className="text-yellow-500/80">DIRECTION</TableHead>
                            <TableHead className="text-yellow-500/80">STATUS</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log, index) => (
                            <TableRow key={index} className="border-yellow-500/20">
                                <TableCell className="font-mono">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        {log.time}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={cn("font-medium flex items-center gap-1", getDirectionColor(log.direction))}>
                                        {log.direction === 'IN' ? '↑' : '↓'} {log.direction}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className={cn("font-medium", getStatusColor(log.status))}>
                                        {log.status}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
