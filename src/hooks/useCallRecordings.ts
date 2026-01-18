'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { CallRecording } from '@/types/call-recordings';

export function useCallRecordings() {
    const [recordings, setRecordings] = useState<CallRecording[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [realtimeStatus, setRealtimeStatus] = useState<string>('CONNECTING');

    const fetchRecordings = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('call_recordings')
                .select('*')
                .order('start_time', { ascending: false })
                .limit(100);

            if (error) throw error;
            setRecordings(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch recordings');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Initial fetch
        fetchRecordings();

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
                    setRecordings((prev) => [payload.new as CallRecording, ...prev]);
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
                    setRecordings((prev) =>
                        prev.map((rec) =>
                            rec.id === (payload.new as CallRecording).id
                                ? (payload.new as CallRecording)
                                : rec
                        )
                    );
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
                    setRecordings((prev) =>
                        prev.filter((rec) => rec.id !== (payload.old as CallRecording).id)
                    );
                }
            )
            .subscribe((status, err) => {
                setRealtimeStatus(status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchRecordings]);

    return { recordings, loading, error, realtimeStatus, refetch: fetchRecordings };
}
