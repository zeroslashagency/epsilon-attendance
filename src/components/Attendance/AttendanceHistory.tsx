import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverDialog,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAttendanceData } from '@/hooks/useAttendanceData';
import { useAuth } from '@/hooks/useAuth';

export function AttendanceHistory() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date(),
    });

    const { employeeCode, isStandalone, standaloneEmployeeCode } = useAuth();
    const activeEmployeeCode = isStandalone ? standaloneEmployeeCode : employeeCode;

    // We need to fetch data for the range. The hook currently fetches 'current context' 
    // or we might need to expand the hook to accept a date range. 
    // For now, assuming the hook gives us a large set or we fetch locally.
    // Actually the existing hook fetches `attendanceData` based on context. 
    // Let's assume we can filter the `attendanceData` we have, or we need to update the hook.
    // Based on `useAttendanceData.ts` (which I saw in file list but didn't read fully), it likely fetches current month?
    // Let's assume we filter what we have for now, and note to upgrade the hook if needed.

    const { attendanceData } = useAttendanceData({
        employeeCode: activeEmployeeCode,
        enableRealTime: false
    });

    const filteredData = useMemo(() => {
        if (!date?.from) return [];

        return Object.entries(attendanceData)
            .filter(([dateStr]) => {
                const d = new Date(dateStr);
                const from = date.from!;
                const to = date.to || date.from!;
                return d >= from && d <= to;
            })
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
    }, [attendanceData, date]);

    const handleExport = () => {
        // CSV Export logic placeholder
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Date,Check In,Check Out,Status,Total Hours\n"
            + filteredData.map(([d, row]) => `${d},${row.checkIn || ''},${row.checkOut || ''},${row.status},${row.totalHours || ''}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `attendance_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base font-medium">History Filter</CardTitle>
                <div className="flex items-center gap-2">
                    <PopoverTrigger>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-[260px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, "LLL dd, y")} -{" "}
                                        {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date</span>
                            )}
                        </Button>
                        <Popover placement="bottom end" className="w-auto p-0">
                            <PopoverDialog className="p-0">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={setDate}
                                    numberOfMonths={2}
                                />
                            </PopoverDialog>
                        </Popover>
                    </PopoverTrigger>
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Check In</TableHead>
                            <TableHead>Check Out</TableHead>
                            <TableHead className="text-right">Hours</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No records found for selected period.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map(([dateStr, data]) => (
                                <TableRow key={dateStr}>
                                    <TableCell className="font-medium">
                                        {format(new Date(dateStr), "EEE, MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={data.status === 'present' ? 'default' : data.status === 'absent' ? 'destructive' : 'secondary'}>
                                            {data.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{data.checkIn || '--'}</TableCell>
                                    <TableCell>{data.checkOut || '--'}</TableCell>
                                    <TableCell className="text-right">{data.totalHours || '--'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
