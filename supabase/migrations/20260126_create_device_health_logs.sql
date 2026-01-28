-- Create table for Device Sensor Health Logs
-- Tracks the health status of mobile sensors (WiFi, Bluetooth, etc.) and errors

CREATE TABLE IF NOT EXISTS device_health_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    device_id TEXT NOT NULL,
    employee_code TEXT NOT NULL,
    sensor_type TEXT NOT NULL, -- 'wifi', 'bluetooth', 'app_usage', 'screen_time', 'gps'
    status TEXT NOT NULL, -- 'ACTIVE', 'ERROR', 'PERMISSION_DENIED', 'DISABLED', 'UNAVAILABLE', 'MISMATCH'
    error_message TEXT,
    check_timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata column for extra details (e.g. mismatch values)
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for querying
CREATE INDEX IF NOT EXISTS idx_device_health_employee ON device_health_logs(employee_code);
CREATE INDEX IF NOT EXISTS idx_device_health_device ON device_health_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_device_health_sensor ON device_health_logs(sensor_type);
CREATE INDEX IF NOT EXISTS idx_device_health_status ON device_health_logs(status);
CREATE INDEX IF NOT EXISTS idx_device_health_timestamp ON device_health_logs(check_timestamp DESC);

-- RLS Policies
ALTER TABLE device_health_logs ENABLE ROW LEVEL SECURITY;

-- Insert: Authenticated users can log their own device health
CREATE POLICY "Users can insert own device health logs" ON device_health_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        employee_code = (SELECT employee_code FROM profiles WHERE id = auth.uid())
    );

-- Select: Admins can view all, users can view their own
CREATE POLICY "Admins can view all device health logs" ON device_health_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin'))
        OR
        employee_code = (SELECT employee_code FROM profiles WHERE id = auth.uid())
    );
