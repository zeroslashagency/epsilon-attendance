import { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause } from 'lucide-react';

interface WaveformPlayerProps {
    fileUrl: string;
    durationSeconds: number;
    isActive: boolean;
    onPlay: () => void;
    onPause: () => void;
}

export function WaveformPlayer({
    fileUrl,
    durationSeconds,
    isActive,
    onPlay,
    onPause
}: WaveformPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    // Generate random bar heights for the visualizer
    // We use useMemo to keep them stable across renders
    const bars = useMemo(() => {
        return Array.from({ length: 24 }).map(() => Math.max(0.3, Math.random()));
    }, []);

    useEffect(() => {
        const audio = new Audio(fileUrl);
        audioRef.current = audio;

        audio.addEventListener('loadedmetadata', () => setIsLoaded(true));

        audio.addEventListener('timeupdate', () => {
            setCurrentTime(audio.currentTime);
        });

        audio.addEventListener('ended', () => {
            setCurrentTime(0);
            onPause();
        });

        return () => {
            audio.pause();
            audio.src = '';
        };
    }, [fileUrl]); // Re-create if URL changes

    // Handle active state changes controlled by parent
    useEffect(() => {
        if (!audioRef.current) return;

        if (isActive) {
            audioRef.current.play().catch(console.error);
        } else {
            audioRef.current.pause();
            // Optional: reset time if deactivated? 
            // Usually nice to keep place, but if another plays, maybe pause is enough.
        }
    }, [isActive]);

    const togglePlay = () => {
        if (isActive) {
            onPause();
        } else {
            onPlay();
        }
    };

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress for visualizer
    const progress = durationSeconds > 0 ? currentTime / durationSeconds : 0;

    return (
        <div className="flex items-center gap-3 bg-gray-900 dark:bg-black rounded-full px-3 py-2 w-fit transition-all hover:bg-gray-800">
            {/* Play/Pause Button */}
            <button
                onClick={togglePlay}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
                {isActive ? (
                    <Pause className="w-4 h-4 fill-white" />
                ) : (
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                )}
            </button>

            {/* Waveform Visualizer */}
            <div className="flex items-center gap-[2px] h-6 w-32 cursor-pointer"
                onClick={(e) => {
                    // Seek functionality
                    if (audioRef.current) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const pct = x / rect.width;
                        const newTime = pct * durationSeconds;
                        audioRef.current.currentTime = newTime;
                        setCurrentTime(newTime);
                        if (!isActive) onPlay();
                    }
                }}>
                {bars.map((height, i) => {
                    const barProgress = i / bars.length;
                    const isPlayed = barProgress < progress;

                    return (
                        <div
                            key={i}
                            className={`w-1 rounded-full transition-colors duration-200 ${isPlayed ? 'bg-orange-500' : 'bg-gray-600'
                                }`}
                            style={{
                                height: `${height * 100}%`,
                                minHeight: '4px'
                            }}
                        />
                    );
                })}
            </div>

            {/* Timer */}
            <div className="text-xs font-medium text-gray-300 tabular-nums w-10 text-right">
                {isActive ? formatTime(currentTime) : formatTime(durationSeconds)}
            </div>
        </div>
    );
}
