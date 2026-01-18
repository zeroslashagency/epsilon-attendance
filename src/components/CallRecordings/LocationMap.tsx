'use client';

import { useEffect, useRef, useState } from 'react';
import { CallRecording } from '@/types/call-recordings';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set your Mapbox token (Vite uses import.meta.env instead of process.env)
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface LocationMapProps {
    recordings: CallRecording[];
}

export function LocationMap({ recordings }: LocationMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    const recordingsWithLocation = recordings.filter(
        (rec) => rec.latitude !== null && rec.longitude !== null
    );

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        // Skip map initialization if no token
        if (!mapboxgl.accessToken) {
            console.warn('Mapbox token not configured - map disabled');
            return;
        }

        try {
            // Initialize map
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/dark-v11',
                center: [77.5946, 12.9716], // Bangalore coordinates as default
                zoom: 11,
            });

            map.current.on('load', () => {
                setMapLoaded(true);
            });

            // Add navigation controls
            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        } catch (error) {
            console.error('Failed to initialize map:', error);
        }

        return () => {
            map.current?.remove();
        };
    }, []);

    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        // Remove existing markers
        const markers = document.querySelectorAll('.mapboxgl-marker');
        markers.forEach((marker) => marker.remove());

        // Add markers for each recording with location
        recordingsWithLocation.forEach((recording) => {
            if (recording.latitude && recording.longitude) {
                // Create custom marker element
                const el = document.createElement('div');
                el.className = 'custom-marker';
                el.style.width = '30px';
                el.style.height = '30px';
                el.style.borderRadius = '50%';
                el.style.backgroundColor = recording.file_url ? '#10b981' : '#3b82f6';
                el.style.border = '3px solid white';
                el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                el.style.cursor = 'pointer';

                // Create popup
                const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px;">
            <p style="font-weight: bold; margin-bottom: 4px;">
              ${recording.contact_name || 'Unknown'}
            </p>
            <p style="font-size: 12px; color: #666; margin-bottom: 4px;">
              ${recording.phone_number}
            </p>
            <p style="font-size: 11px; color: #999;">
              ${new Date(recording.start_time).toLocaleString()}
            </p>
            ${recording.file_url
                        ? '<p style="font-size: 11px; color: #10b981; margin-top: 4px;">🎵 Recorded</p>'
                        : ''
                    }
          </div>
        `);

                // Add marker to map
                new mapboxgl.Marker(el)
                    .setLngLat([recording.longitude, recording.latitude])
                    .setPopup(popup)
                    .addTo(map.current!);
            }
        });

        // Fit map to show all markers
        if (recordingsWithLocation.length > 0) {
            const bounds = new mapboxgl.LngLatBounds();
            recordingsWithLocation.forEach((rec) => {
                if (rec.latitude && rec.longitude) {
                    bounds.extend([rec.longitude, rec.latitude]);
                }
            });
            map.current.fitBounds(bounds, { padding: 50, maxZoom: 14 });
        }
    }, [recordingsWithLocation, mapLoaded]);

    // Show message if no Mapbox token
    if (!mapboxgl.accessToken) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12">
                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                        📍 Map disabled - Mapbox token not configured
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        Add VITE_MAPBOX_TOKEN to .env to enable location visualization
                    </p>
                </div>
            </div>
        );
    }

    if (recordingsWithLocation.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12">
                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                        No location data available yet. Make a call to see locations on the map.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    🗺️ Call Locations
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {recordingsWithLocation.length} call{recordingsWithLocation.length !== 1 ? 's' : ''} with GPS data
                </p>
            </div>
            <div ref={mapContainer} className="h-[400px] w-full" />
        </div>
    );
}
