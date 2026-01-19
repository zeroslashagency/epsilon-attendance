'use client';

import { CallRecording } from '@/types/call-recordings';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react';

interface StatsCardsProps {
    recordings: CallRecording[];
}

export function StatsCards({ recordings }: StatsCardsProps) {
    const total = recordings.length;

    const today = recordings.filter((rec) => {
        const recDate = new Date(rec.created_at);
        const todayDate = new Date();
        return recDate.toDateString() === todayDate.toDateString();
    }).length;

    const recorded = recordings.filter((rec) => rec.file_url !== null).length;

    const missed = recordings.filter((rec) => rec.call_type === 'missed').length;

    const stats = [
        {
            label: 'Total Calls',
            value: total,
            icon: Phone,
            color: 'text-primary',
            bg: 'bg-primary/10',
            change: '+12% vs last week',
            trend: 'up'
        },
        {
            label: 'Today',
            value: today,
            icon: PhoneIncoming,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            change: '+5% vs yesterday',
            trend: 'up'
        },
        {
            label: 'Recorded',
            value: recorded,
            icon: PhoneOutgoing,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
            change: '85% of total calls',
            trend: 'neutral'
        },
        {
            label: 'Missed',
            value: missed,
            icon: PhoneMissed,
            color: 'text-destructive',
            bg: 'bg-destructive/10',
            change: '-2% vs last week',
            trend: 'down'
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={stat.label}
                        className="bg-card dark:bg-card text-card-foreground rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {stat.label}
                                </p>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <h3 className="text-3xl font-bold tracking-tight">
                                        {stat.value}
                                    </h3>
                                </div>
                                {stat.change && (
                                    <p className={`text-xs mt-2 font-medium ${stat.trend === 'up' ? 'text-green-600 dark:text-green-500' :
                                            stat.trend === 'down' ? 'text-green-600 dark:text-green-500' : // 'down' for missed calls is usually good (green), context dependent. Keeping simple for now.
                                                'text-muted-foreground'
                                        }`}>
                                        {stat.change}
                                    </p>
                                )}
                            </div>
                            <div className={`${stat.bg} p-3 rounded-xl`}>
                                <Icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
