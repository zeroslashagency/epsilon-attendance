import React from 'react';
import { Wifi, Signal, Network, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignalIndicatorProps {
  type: 'wifi' | 'cellular' | 'ethernet' | 'none';
  strength: number; // 0-100
  className?: string;
}

export const SignalIndicator: React.FC<SignalIndicatorProps> = ({
  type,
  strength,
  className,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'wifi': return Wifi;
      case 'cellular': return Signal;
      case 'ethernet': return Network;
      default: return WifiOff;
    }
  };

  const Icon = getIcon();
  
  if (type === 'none') {
    return <Icon className={cn("h-4 w-4 text-muted-foreground", className)} />;
  }

  if (type === 'ethernet') {
     return <Icon className={cn("h-4 w-4 text-primary", className)} />;
  }

  // 4 bars for wireless
  const bars = [1, 2, 3, 4];
  const activeBars = Math.ceil((strength / 100) * 4);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="flex items-end gap-0.5 h-3" title={`${strength}%`}>
        {bars.map((bar) => (
          <div
            key={bar}
            className={cn(
              "w-1 rounded-sm bg-muted",
              bar <= activeBars && "bg-primary",
              bar === 1 && "h-1.5",
              bar === 2 && "h-2",
              bar === 3 && "h-2.5",
              bar === 4 && "h-3"
            )}
          />
        ))}
      </div>
    </div>
  );
};
