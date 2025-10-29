import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ReportsTableProps {
  filters: {
    dateRange: {
      start: Date;
      end: Date;
    };
    reportType: 'daily' | 'monthly' | 'yearly';
    includeWeekends: boolean;
  };
}

// Mock data for table
const attendanceData = [
  { date: '2024-01-15', checkIn: '08:30', checkOut: '17:00', status: 'present', totalHours: '8:30' },
  { date: '2024-01-16', checkIn: '08:45', checkOut: '17:15', status: 'present', totalHours: '8:30' },
  { date: '2024-01-17', checkIn: '09:15', checkOut: '17:00', status: 'late', totalHours: '7:45' },
  { date: '2024-01-18', checkIn: '08:30', checkOut: '17:30', status: 'present', totalHours: '9:00' },
  { date: '2024-01-19', checkIn: '08:30', checkOut: '16:30', status: 'present', totalHours: '8:00' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'present':
      return <Badge className="bg-status-present text-white">Present</Badge>;
    case 'late':
      return <Badge className="bg-status-late text-white">Late</Badge>;
    case 'absent':
      return <Badge className="bg-status-absent text-white">Absent</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export function ReportsTable({ filters }: ReportsTableProps) {
  return (
    <Card className="bg-background border-border">
      <CardHeader>
        <CardTitle>Detailed Attendance Records</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Hours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceData.map((record, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {new Date(record.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{record.checkIn}</TableCell>
                <TableCell>{record.checkOut}</TableCell>
                <TableCell>{getStatusBadge(record.status)}</TableCell>
                <TableCell>{record.totalHours}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


