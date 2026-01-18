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
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
            label: 'Today',
            value: today,
            icon: PhoneIncoming,
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-900/20',
        },
        {
            label: 'Recorded',
            value: recorded,
            icon: PhoneOutgoing,
            color: 'text-orange-600 dark:text-orange-400',
            bg: 'bg-orange-50 dark:bg-orange-900/20',
        },
        {
            label: 'Missed',
            value: missed,
            icon: PhoneMissed,
            color: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-50 dark:bg-red-900/20',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={stat.label}
                        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    {stat.label}
                                </p>
                                <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`${stat.bg} p-3 rounded-lg`}>
                                <Icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
