-- Create device_events table for Real-Time Monitoring (WiFi, Bluetooth, Screen, Calls)
CREATE TABLE IF NOT EXISTS public.device_events (
    id BIGSERIAL PRIMARY KEY,
    employee_code TEXT NOT NULL,
    device_id TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'wifi_scan', 'bluetooth_scan', 'screen_on', 'call_incoming', etc.
    event_time TIMESTAMPTZ NOT NULL,
    metadata JSONB, -- Stores ssid, rssi, call info, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient querying by employee and time
CREATE INDEX IF NOT EXISTS idx_device_events_employee_time 
ON public.device_events(employee_code, event_time DESC);

-- Enable RLS
ALTER TABLE public.device_events ENABLE ROW LEVEL SECURITY;

-- Policy (Allow insert/select for authenticated users)
CREATE POLICY "Enable all access for authenticated users" 
ON public.device_events FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Comment
COMMENT ON TABLE device_events IS 'Stores real-time device events like screen state, wifi scans, and bluetooth activity';
