/**
 * FIRPointsGauge - Circular progress ring with score
 */
import { cn } from '@/lib/utils';
import { Shield } from 'lucide-react';

interface FIRPointsGaugeProps {
    points: number;
    maxPoints?: number;
    size?: 'sm' | 'md' | 'lg';
}

export function FIRPointsGauge({ points, maxPoints = 1000, size = 'md' }: FIRPointsGaugeProps) {
    const percentage = Math.min((points / maxPoints) * 100, 100);
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getLevel = () => {
        if (points >= 800) return { label: 'Excellent', color: 'text-emerald-500' };
        if (points >= 600) return { label: 'Great', color: 'text-blue-500' };
        if (points >= 400) return { label: 'Good', color: 'text-amber-500' };
        return { label: 'Building', color: 'text-gray-500' };
    };

    const level = getLevel();

    const sizes = {
        sm: { container: 'w-24 h-24', text: 'text-xl', label: 'text-[10px]' },
        md: { container: 'w-32 h-32', text: 'text-3xl', label: 'text-xs' },
        lg: { container: 'w-40 h-40', text: 'text-4xl', label: 'text-sm' },
    };

    return (
        <div className={cn("relative flex items-center justify-center", sizes[size].container)}>
            <svg className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-muted/20"
                />
                {/* Progress circle */}
                <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                </defs>
            </svg>

            <div className="absolute flex flex-col items-center">
                <Shield className="h-4 w-4 text-cyan-500 mb-1" />
                <span className={cn("font-bold", sizes[size].text)}>{points}</span>
                <span className={cn("font-medium", level.color, sizes[size].label)}>
                    {level.label}
                </span>
            </div>
        </div>
    );
}
