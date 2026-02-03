import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { reportService } from '@/services/fir/reportService';
import { Report } from '@/services/fir/types';
import { AnalyticsView } from '@/components/FIR/AnalyticsView';
import { Loader2 } from 'lucide-react';

const HistoryPage: React.FC = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    const loadReports = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await reportService.getReports();
            setReports(data); // Analytics usually shows global stats or filtered. For now global.
        } catch (error) {
            console.error("Failed to load reports for history/analytics", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-muted/30">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return <AnalyticsView reports={reports} />;
};

export default HistoryPage;
