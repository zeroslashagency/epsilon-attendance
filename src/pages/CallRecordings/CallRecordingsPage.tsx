import { useCallRecordings } from '@/hooks/useCallRecordings';
import { StatsCards } from '@/components/CallRecordings/StatsCards';
import { CallLogsTable } from '@/components/CallRecordings/CallLogsTable';
import { LocationMap } from '@/components/CallRecordings/LocationMap';
import { Loader2 } from 'lucide-react';

export default function CallRecordingsPage() {
    const { recordings, loading, error, realtimeStatus } = useCallRecordings();

    const isConnected = realtimeStatus === 'SUBSCRIBED';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading call recordings...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 dark:text-red-400">Error: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                📞 Call Recordings
                            </h1>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Monitor and manage all call recordings in real-time
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isConnected
                                ? 'bg-status-present/10 border-status-present/20 text-status-present'
                                : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600'
                                } translate-y-0 transition-all`}>
                                <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${isConnected ? 'bg-status-present' : 'bg-yellow-500'
                                    }`}></div>
                                <span className="text-sm font-semibold tracking-wide">
                                    {isConnected ? 'LIVE' : realtimeStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <StatsCards recordings={recordings} />

                    {/* Location Map */}
                    <LocationMap recordings={recordings} />

                    {/* Call Logs Table */}
                    <CallLogsTable recordings={recordings} />
                </div>
            </div>
        </div>
    );
}
