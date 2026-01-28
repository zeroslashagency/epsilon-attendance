-- Create device_monitoring_logs table for Call Logs and other events
CREATE TABLE IF NOT EXISTS public.device_monitoring_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id TEXT NOT NULL,
    employee_code TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'call_incoming', 'call_outgoing', 'call_missed', 'screen_on', etc.
    timestamp TIMESTAMPTZ NOT NULL,
    metadata JSONB, -- Stores number, duration, name, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_device_monitoring_logs_employee 
ON public.device_monitoring_logs(employee_code, timestamp DESC);

-- Enable RLS
ALTER TABLE public.device_monitoring_logs ENABLE ROW LEVEL SECURITY;

-- Policy (Allow insert/select for authenticated users)
CREATE POLICY "Enable all access for authenticated users" 
ON public.device_monitoring_logs FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Ensure device_health_logs exists (created in previous step, but safe to repeat IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.device_health_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id TEXT NOT NULL,
    employee_code TEXT NOT NULL,
    sensor_type TEXT NOT NULL,
    status TEXT NOT NULL,
    error_message TEXT,
    checked_at TIMESTAMPTZ NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for health logs
CREATE INDEX IF NOT EXISTS idx_device_health_logs_employee 
ON public.device_health_logs(employee_code, checked_at DESC);

-- Enable RLS for health logs
ALTER TABLE public.device_health_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for authenticated users" 
ON public.device_health_logs FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
