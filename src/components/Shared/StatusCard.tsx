import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatusCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  status?: 'success' | 'warning' | 'error' | 'default';
  description?: string;
  className?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  icon: Icon,
  status = 'default',
  description,
  className,
}) => {
  const statusColor = {
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
    default: 'text-muted-foreground',
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", statusColor[status])} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};
