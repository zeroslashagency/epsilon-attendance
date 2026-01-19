'use client';

import { useState, useEffect } from 'react';
import { CallRecording } from '@/types/call-recordings';
import {
    Play,
    Download,
    MapPin,
    Clock,
    Phone,
    Search,
    ArrowUpDown,
    Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { WaveformPlayer } from './WaveformPlayer';
import { getCityFromCoordinates } from '@/utils/geocoding';

interface CallLogsTableProps {
    recordings: CallRecording[];
}

export function CallLogsTable({ recordings }: CallLogsTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'duration'>('date');
    const [locationNames, setLocationNames] = useState<Record<string, string>>({});

    // Auto-Contact Resolution: Build a map of PhoneNumber -> Name from all records
    const contactMap = recordings.reduce((acc, rec) => {
        if (rec.contact_name && rec.contact_name !== 'Unknown' && rec.phone_number) {
            acc[rec.phone_number] = rec.contact_name;
        }
        return acc;
    }, {} as Record<string, string>);

    const filteredRecordings = recordings
        .filter((rec) => {
            const search = searchTerm.toLowerCase();
            // Resolve name for search
            const resolvedName = rec.contact_name || contactMap[rec.phone_number];
            return (
                rec.phone_number.toLowerCase().includes(search) ||
                resolvedName?.toLowerCase().includes(search) ||
                false
            );
        })
        // deduplicate by id just in case
        .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
        .sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            return b.duration_seconds - a.duration_seconds;
        });

    // Fetch location names for visible rows
    useEffect(() => {
        filteredRecordings.forEach(async (rec) => {
            if (rec.latitude && rec.longitude && !locationNames[rec.id]) {
                const city = await getCityFromCoordinates(rec.latitude, rec.longitude);
                if (city) {
                    setLocationNames(prev => ({ ...prev, [rec.id]: city }));
                }
            }
        });
    }, [filteredRecordings, locationNames]);

    const getStatusBadge = (recording: CallRecording) => {
        if (recording.call_type === 'missed') {
            return (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                    Missed
                </span>
            );
        }
        if (recording.call_type === 'rejected') {
            return (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20">
                    Rejected
                </span>
            );
        }
        if (recording.file_url) {
            return (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary-foreground bg-primary">
                    Recorded
                </span>
            );
        }
        return (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                Answered
            </span>
        );
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const [playingId, setPlayingId] = useState<string | null>(null);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

    const handlePlay = (recording: CallRecording) => {
        if (playingId === recording.id) {
            // Stop/Pause
            audioElement?.pause();
            setPlayingId(null);
            setAudioElement(null);
        } else {
            // Play new
            if (audioElement) {
                audioElement.pause();
            }
            const audio = new Audio(recording.file_url!);
            audio.play().catch(e => console.error("Playback failed", e));
            audio.onended = () => {
                setPlayingId(null);
                setAudioElement(null);
            };
            setAudioElement(audio);
            setPlayingId(recording.id);
        }
    };

    // Helper to get the best available name
    const getResolvedName = (recording: CallRecording) => {
        if (recording.contact_name && recording.contact_name !== 'Unknown') {
            return recording.contact_name;
        }
        return contactMap[recording.phone_number] || null;
    };

    return (
        <div className="bg-card dark:bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-card-foreground">
                        Call Logs
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSortBy(sortBy === 'date' ? 'duration' : 'date')}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                        >
                            <ArrowUpDown className="w-4 h-4" />
                            Sort by {sortBy === 'date' ? 'Duration' : 'Date'}
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by contact or number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Duration
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Place
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredRecordings.map((recording) => {
                            const resolvedName = getResolvedName(recording);
                            const cityName = locationNames[recording.id];

                            return (
                                <tr
                                    key={recording.id}
                                    className="hover:bg-muted/50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Phone className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="ml-3">
                                                {resolvedName ? (
                                                    <>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-sm font-medium text-foreground">
                                                                {resolvedName}
                                                            </div>
                                                            {recording.sim_number && (
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                                                                    SIM {recording.sim_number.includes('0') ? '1' : recording.sim_number.includes('1') ? '2' : recording.sim_number}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {recording.phone_number}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-sm font-medium text-foreground">
                                                                {recording.phone_number}
                                                            </div>
                                                            {recording.sim_number && (
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                                                                    SIM {recording.sim_number.includes('0') ? '1' : recording.sim_number.includes('1') ? '2' : recording.sim_number}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground italic">
                                                            Unknown Name
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(recording)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-foreground">
                                            <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                                            {formatDuration(recording.duration_seconds)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        {formatDistanceToNow(new Date(recording.created_at), { addSuffix: true })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        {recording.latitude && recording.longitude ? (
                                            <div className="flex items-center gap-2">
                                                <button className="text-blue-500 hover:text-blue-600 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors flex-shrink-0">
                                                    <MapPin className="w-5 h-5" />
                                                </button>
                                                <span className="text-sm truncate max-w-[150px]" title={cityName || 'Loading location...'}>
                                                    {cityName || (
                                                        <span className="text-muted-foreground animate-pulse">Loading...</span>
                                                    )}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground px-2">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-4">
                                            {recording.file_url ? (
                                                <WaveformPlayer
                                                    fileUrl={recording.file_url}
                                                    durationSeconds={recording.duration_seconds}
                                                    isActive={playingId === recording.id}
                                                    onPlay={() => setPlayingId(recording.id)}
                                                    onPause={() => setPlayingId(null)}
                                                />
                                            ) : (
                                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground opacity-50 cursor-not-allowed">
                                                    <Play className="w-4 h-4" />
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2">
                                                {recording.file_url && (
                                                    <a
                                                        href={recording.file_url}
                                                        download={`recording-${recording.id}.m4a`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-full transition-colors"
                                                    >
                                                        <Download className="w-5 h-5" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {filteredRecordings.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Phone className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-1">No calls found</h3>
                        <p className="text-muted-foreground">
                            {searchTerm ? 'Try adjusting your search terms' : 'No call recordings available yet'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
