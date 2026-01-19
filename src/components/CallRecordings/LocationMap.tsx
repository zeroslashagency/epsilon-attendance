'use client';

import { CallRecording } from '@/types/call-recordings';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issues in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationMapProps {
    recordings: CallRecording[];
}

export function LocationMap({ recordings }: LocationMapProps) {
    const recordingsWithLocation = recordings.filter(
        (rec) => rec.latitude !== null && rec.longitude !== null
    );

    // Default center (Bangalore)
    const defaultCenter: [number, number] = [12.9716, 77.5946];

    // Custom Marker Icon 
    const createCustomIcon = (isRecorded: boolean) => {
        // Colors matching our theme: Lime Green (#84cc16) for recorded, Blue (#3b82f6) for others
        const color = isRecorded ? '#84cc16' : '#3b82f6';

        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                background-color: ${color};
                width: 24px;
                height: 24px;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            "></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12], // Center the icon
            popupAnchor: [0, -12]
        });
    };

    if (recordingsWithLocation.length === 0) {
        return (
            <div className="bg-card dark:bg-card rounded-xl shadow-sm border border-border p-12">
                <div className="text-center">
                    <p className="text-muted-foreground">
                        No location data available yet. Make a call to see locations on the map.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card dark:bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold text-card-foreground">
                    🗺️ Call Locations
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    {recordingsWithLocation.length} call{recordingsWithLocation.length !== 1 ? 's' : ''} with GPS data
                </p>
            </div>
            <div className="h-[400px] w-full relative z-0">
                <MapContainer
                    center={defaultCenter}
                    zoom={11}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {recordingsWithLocation.map((recording) => (
                        <Marker
                            key={recording.id}
                            position={[recording.latitude!, recording.longitude!]}
                            icon={createCustomIcon(!!recording.file_url)}
                        >
                            <Popup>
                                <div style={{ fontFamily: 'system-ui, sans-serif', minWidth: '200px' }}>
                                    <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', color: '#111' }}>
                                        {recording.contact_name || 'Unknown'}
                                    </p>
                                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '6px' }}>
                                        {recording.phone_number}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>
                                            {new Date(recording.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        {recording.file_url && (
                                            <span style={{ fontSize: '10px', fontWeight: 600, color: '#fff', background: '#84cc16', padding: '2px 6px', borderRadius: '99px' }}>
                                                Recorded
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}
