'use client';

import { useState } from 'react';
import { CallRecording } from '@/types/call-recordings';
import {
    Play,
    Download,
    MapPin,
    Clock,
    Phone,
    Search,
    ArrowUpDown
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { WaveformPlayer } from './WaveformPlayer';

interface CallLogsTableProps {
    recordings: CallRecording[];
}

export function CallLogsTable({ recordings }: CallLogsTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'duration'>('date');

    const filteredRecordings = recordings
        .filter((rec) => {
            const search = searchTerm.toLowerCase();
            return (
                rec.phone_number.toLowerCase().includes(search) ||
                rec.contact_name?.toLowerCase().includes(search) ||
                ''
            );
        })
        .sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            return b.duration_seconds - a.duration_seconds;
        });

    const getStatusBadge = (recording: CallRecording) => {
        if (recording.call_type === 'missed') {
            return (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                    Missed
                </span>
            );
        }
        if (recording.call_type === 'rejected') {
            return (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                    Rejected
                </span>
            );
        }
        if (recording.file_url) {
            return (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    Recorded
                </span>
            );
        }
        return (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
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

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Call Logs
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSortBy(sortBy === 'date' ? 'duration' : 'date')}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                            <ArrowUpDown className="w-4 h-4" />
                            Sort by {sortBy === 'date' ? 'Duration' : 'Date'}
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by contact or number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Duration
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredRecordings.map((recording) => (
                            <tr
                                key={recording.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <Phone className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {recording.contact_name || 'Unknown'}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {recording.phone_number}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(recording)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-900 dark:text-white">
                                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                                        {formatDuration(recording.duration_seconds)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {formatDistanceToNow(new Date(recording.created_at), { addSuffix: true })}
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
                                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400">
                                                <Play className="w-4 h-4" />
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            {recording.latitude && recording.longitude && (
                                                <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors">
                                                    <MapPin className="w-5 h-5" />
                                                </button>
                                            )}
                                            {recording.file_url && (
                                                <a
                                                    href={recording.file_url}
                                                    download={`recording-${recording.id}.m4a`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredRecordings.length === 0 && (
                    <div className="text-center py-12">
                        <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                            {searchTerm ? 'No calls found matching your search' : 'No call recordings yet'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
