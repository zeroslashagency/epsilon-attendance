import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DeviceEvent } from '@/types/device';
import { Badge } from '@/components/ui/badge';

interface HistoryTableProps {
  events: DeviceEvent[];
  className?: string;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  events,
  className,
}) => {
  const getSeverityVariant = (severity: DeviceEvent['severity']): "default" | "destructive" | "secondary" | "outline" => {
    switch (severity) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Time</TableHead>
            <TableHead className="w-[100px]">Type</TableHead>
            <TableHead>Message</TableHead>
            <TableHead className="text-right w-[100px]">Severity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                No events recorded
              </TableCell>
            </TableRow>
          ) : (
            events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-mono text-xs">
                  {new Date(event.timestamp).toLocaleString()}
                </TableCell>
                <TableCell className="capitalize">{event.type}</TableCell>
                <TableCell>{event.message}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={getSeverityVariant(event.severity)}>
                    {event.severity}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
