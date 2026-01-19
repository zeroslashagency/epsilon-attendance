// Types for call recordings
export interface CallRecording {
    id: string;
    user_id: string;
    phone_number: string;
    contact_name: string | null;
    direction: 'incoming' | 'outgoing';
    call_type: 'answered' | 'missed' | 'rejected' | 'blocked' | null;
    scheduled_time: string | null;
    start_time: string;
    end_time: string | null;
    duration_seconds: number;
    file_url: string | null;
    upload_status: string;
    latitude: number | null;
    longitude: number | null;
    location_accuracy: number | null;
    location_timestamp: string | null;
    sim_number: string | null;
    created_at: string;
}

export interface CallStats {
    total: number;
    today: number;
    recorded: number;
    missed: number;
}
