-- =====================================================
-- Device Monitoring Module - Database Schema
-- Migration: 005_device_monitoring_tables
-- Created: 2026-01-18
-- =====================================================

-- Screen Time Logs: Track daily screen time and unlock events
CREATE TABLE IF NOT EXISTS screen_time_logs (
  id BIGSERIAL PRIMARY KEY,
  employee_code TEXT NOT NULL,
  device_id TEXT NOT NULL,
  log_date DATE NOT NULL,
  total_screen_time_minutes INTEGER DEFAULT 0,
  unlock_count INTEGER DEFAULT 0,
  first_unlock TIMESTAMPTZ,
  last_lock TIMESTAMPTZ,
  screen_events JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_screen_time UNIQUE (employee_code, device_id, log_date)
);

-- App Usage Logs: Track per-app usage statistics
CREATE TABLE IF NOT EXISTS app_usage_logs (
  id BIGSERIAL PRIMARY KEY,
  employee_code TEXT NOT NULL,
  device_id TEXT NOT NULL,
  log_date DATE NOT NULL,
  package_name TEXT NOT NULL,
  app_name TEXT NOT NULL,
  category TEXT,
  foreground_time_minutes INTEGER DEFAULT 0,
  launch_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_app_usage UNIQUE (employee_code, device_id, log_date, package_name)
);

-- Network Logs: Track WiFi and mobile data usage
CREATE TABLE IF NOT EXISTS network_logs (
  id BIGSERIAL PRIMARY KEY,
  employee_code TEXT NOT NULL,
  device_id TEXT NOT NULL,
  log_date DATE NOT NULL,
  connection_type TEXT NOT NULL, -- 'wifi', 'mobile_data'
  network_name TEXT,
  bytes_sent BIGINT DEFAULT 0,
  bytes_received BIGINT DEFAULT 0,
  connection_events JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bluetooth Logs: Track connected bluetooth devices
CREATE TABLE IF NOT EXISTS bluetooth_logs (
  id BIGSERIAL PRIMARY KEY,
  employee_code TEXT NOT NULL,
  device_id TEXT NOT NULL,
  log_date DATE NOT NULL,
  device_name TEXT NOT NULL,
  device_mac TEXT,
  device_type TEXT, -- 'audio', 'peripheral', 'computer', 'phone', 'other'
  connection_count INTEGER DEFAULT 0,
  total_connected_minutes INTEGER DEFAULT 0,
  connection_events JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Device Notifications: Push notifications sent to devices
CREATE TABLE IF NOT EXISTS device_notifications (
  id BIGSERIAL PRIMARY KEY,
  employee_code TEXT NOT NULL,
  device_id TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- 'reminder', 'alert', 'broadcast', 'policy'
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  sent_by TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' -- 'pending', 'sent', 'delivered', 'read', 'acknowledged', 'failed'
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_screen_time_employee ON screen_time_logs(employee_code);
CREATE INDEX IF NOT EXISTS idx_screen_time_date ON screen_time_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_screen_time_device ON screen_time_logs(device_id);

CREATE INDEX IF NOT EXISTS idx_app_usage_employee ON app_usage_logs(employee_code);
CREATE INDEX IF NOT EXISTS idx_app_usage_date ON app_usage_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_app_usage_category ON app_usage_logs(category);

CREATE INDEX IF NOT EXISTS idx_network_employee ON network_logs(employee_code);
CREATE INDEX IF NOT EXISTS idx_network_date ON network_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_network_type ON network_logs(connection_type);

CREATE INDEX IF NOT EXISTS idx_bluetooth_employee ON bluetooth_logs(employee_code);
CREATE INDEX IF NOT EXISTS idx_bluetooth_date ON bluetooth_logs(log_date);

CREATE INDEX IF NOT EXISTS idx_notifications_employee ON device_notifications(employee_code);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON device_notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON device_notifications(notification_type);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE screen_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bluetooth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_notifications ENABLE ROW LEVEL SECURITY;

-- Screen Time: Users can view/insert their own data, admins can view all
CREATE POLICY "Users can view own screen time" ON screen_time_logs
  FOR SELECT USING (
    employee_code = (SELECT employee_code FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin'))
  );

CREATE POLICY "Users can insert own screen time" ON screen_time_logs
  FOR INSERT WITH CHECK (
    employee_code = (SELECT employee_code FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update own screen time" ON screen_time_logs
  FOR UPDATE USING (
    employee_code = (SELECT employee_code FROM profiles WHERE id = auth.uid())
  );

-- App Usage: Similar policies
CREATE POLICY "Users can view own app usage" ON app_usage_logs
  FOR SELECT USING (
    employee_code = (SELECT employee_code FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin'))
  );

CREATE POLICY "Users can insert own app usage" ON app_usage_logs
  FOR INSERT WITH CHECK (
    employee_code = (SELECT employee_code FROM profiles WHERE id = auth.uid())
  );

-- Network Logs: Similar policies
CREATE POLICY "Users can view own network logs" ON network_logs
  FOR SELECT USING (
    employee_code = (SELECT employee_code FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin'))
  );

CREATE POLICY "Users can insert own network logs" ON network_logs
  FOR INSERT WITH CHECK (
    employee_code = (SELECT employee_code FROM profiles WHERE id = auth.uid())
  );

-- Bluetooth Logs: Similar policies
CREATE POLICY "Users can view own bluetooth logs" ON bluetooth_logs
  FOR SELECT USING (
    employee_code = (SELECT employee_code FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin'))
  );

CREATE POLICY "Users can insert own bluetooth logs" ON bluetooth_logs
  FOR INSERT WITH CHECK (
    employee_code = (SELECT employee_code FROM profiles WHERE id = auth.uid())
  );

-- Notifications: Users see their own, admins can manage all
CREATE POLICY "Users can view own notifications" ON device_notifications
  FOR SELECT USING (
    employee_code = (SELECT employee_code FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin'))
  );

CREATE POLICY "Admins can insert notifications" ON device_notifications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin'))
  );

CREATE POLICY "Users can update own notification status" ON device_notifications
  FOR UPDATE USING (
    employee_code = (SELECT employee_code FROM profiles WHERE id = auth.uid())
  );

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE screen_time_logs IS 'Stores daily screen time metrics from mobile devices';
COMMENT ON TABLE app_usage_logs IS 'Stores per-app usage statistics from mobile devices';
COMMENT ON TABLE network_logs IS 'Stores WiFi and mobile data usage logs';
COMMENT ON TABLE bluetooth_logs IS 'Stores bluetooth device connection history';
COMMENT ON TABLE device_notifications IS 'Stores push notifications sent to mobile devices';
