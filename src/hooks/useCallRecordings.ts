'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { CallRecording } from '@/types/call-recordings';
import { buildRealtimeEventKey, createEventDeduper } from '@/utils/realtime';

interface CallRecordingStats {
    total: number;
    today: number;
    recorded: number;
    missed: number;
    timezone: string;
    updatedAt: string;
}

export function useCallRecordings() {
    const [recordings, setRecordings] = useState<CallRecording[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [realtimeStatus, setRealtimeStatus] = useState<string>('CONNECTING');
    const [stats, setStats] = useState<CallRecordingStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState<string | null>(null);
    const statsRefreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchRecordings = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('call_recordings')
                .select('*')
                .order('start_time', { ascending: false, nullsFirst: false })
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            setRecordings(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch recordings');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            setStatsLoading(true);
            setStatsError(null);
            const timeZone =
                Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
            const now = new Date();
            const startOfDay = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                0,
                0,
                0,
                0
            );
            const endOfDay = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + 1,
                0,
                0,
                0,
                0
            );
            const startIso = startOfDay.toISOString();
            const endIso = endOfDay.toISOString();

            const [totalRes, recordedRes, missedRes, todayRes] =
                await Promise.all([
                    supabase
                        .from('call_recordings')
                        .select('id', { count: 'exact', head: true }),
                    supabase
                        .from('call_recordings')
                        .select('id', { count: 'exact', head: true })
                        .not('file_url', 'is', null),
                    supabase
                        .from('call_recordings')
                        .select('id', { count: 'exact', head: true })
                        .eq('call_type', 'missed'),
                    supabase
                        .from('call_recordings')
                        .select('id', { count: 'exact', head: true })
                        .gte('start_time', startIso)
                        .lt('start_time', endIso),
                ]);

            const firstError =
                totalRes.error ||
                recordedRes.error ||
                missedRes.error ||
                todayRes.error;
            if (firstError) throw firstError;

            setStats({
                total: totalRes.count ?? 0,
                recorded: recordedRes.count ?? 0,
                missed: missedRes.count ?? 0,
                today: todayRes.count ?? 0,
                timezone: timeZone,
                updatedAt: new Date().toISOString(),
            });
        } catch (err) {
            setStatsError(
                err instanceof Error ? err.message : 'Failed to fetch stats'
            );
        } finally {
            setStatsLoading(false);
        }
    }, []);

    const scheduleStatsRefresh = useCallback(() => {
        if (statsRefreshTimer.current) {
            clearTimeout(statsRefreshTimer.current);
        }
        statsRefreshTimer.current = setTimeout(() => {
            fetchStats();
        }, 1200);
    }, [fetchStats]);

    useEffect(() => {
        // Initial fetch
        fetchRecordings();
        fetchStats();

        const shouldProcess = createEventDeduper();
        type RealtimePayload = Parameters<typeof buildRealtimeEventKey>[0];
        function shouldProcessPayload(payload: unknown): boolean {
            const key = buildRealtimeEventKey(payload as RealtimePayload, false);
            return shouldProcess(key);
        }

        // Setup realtime subscription - simple approach without filter
        const channel = supabase
            .channel('call_recordings_live')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'call_recordings',
                },
                (payload) => {
                    if (!shouldProcessPayload(payload)) return;
                    const newRecord = payload.new as CallRecording;
                    setRecordings((prev) => {
                        // Strict deduplication: Check if ID already exists
                        if (prev.some(rec => rec.id === newRecord.id)) {
                            return prev;
                        }
                        return [newRecord, ...prev];
                    });
                    scheduleStatsRefresh();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'call_recordings',
                },
                (payload) => {
                    if (!shouldProcessPayload(payload)) return;
                    setRecordings((prev) =>
                        prev.map((rec) =>
                            rec.id === (payload.new as CallRecording).id
                                ? (payload.new as CallRecording)
                                : rec
                        )
                    );
                    scheduleStatsRefresh();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'call_recordings',
                },
                (payload) => {
                    if (!shouldProcessPayload(payload)) return;
                    setRecordings((prev) =>
                        prev.filter((rec) => rec.id !== (payload.old as CallRecording).id)
                    );
                    scheduleStatsRefresh();
                }
            )
            .subscribe((status, err) => {
                setRealtimeStatus(status);
            });

        return () => {
            supabase.removeChannel(channel);
            if (statsRefreshTimer.current) {
                clearTimeout(statsRefreshTimer.current);
                statsRefreshTimer.current = null;
            }
        };
    }, [fetchRecordings, fetchStats, scheduleStatsRefresh]);

    return {
        recordings,
        loading,
        error,
        realtimeStatus,
        stats,
        statsLoading,
        statsError,
        refetch: fetchRecordings,
        refetchStats: fetchStats,
    };
}
