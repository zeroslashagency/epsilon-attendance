import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface DataUsageBarProps {
  sent: number; // bytes
  received: number; // bytes
  limit?: number; // bytes, optional for percentage calculation
  className?: string;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const DataUsageBar: React.FC<DataUsageBarProps> = ({
  sent,
  received,
  limit,
  className,
}) => {
  const total = sent + received;
  const percentage = limit ? Math.min((total / limit) * 100, 100) : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span>Data Usage</span>
        <span className="text-muted-foreground">
          {formatBytes(total)} {limit ? `/ ${formatBytes(limit)}` : ''}
        </span>
      </div>
      {limit && <Progress value={percentage} className="h-2" />}
      {!limit && <div className="h-2 bg-secondary rounded-full w-full" />}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Sent: {formatBytes(sent)}</span>
        <span>Received: {formatBytes(received)}</span>
      </div>
    </div>
  );
};
