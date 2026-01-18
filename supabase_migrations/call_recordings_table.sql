-- Migration: Create call_recordings table
-- This table stores metadata for all call recordings

CREATE TABLE IF NOT EXISTS call_recordings (
  id TEXT PRIMARY KEY,
  employee_id INTEGER REFERENCES employee_master(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  contact_name TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  scheduled_time TIMESTAMPTZ,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  file_url TEXT,
  upload_status TEXT DEFAULT 'PENDING' CHECK (upload_status IN ('PENDING', 'UPLOADING', 'UPLOADED', 'FAILED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries by employee
CREATE INDEX IF NOT EXISTS idx_call_recordings_employee_id ON call_recordings(employee_id);

-- Create index for faster queries by date
CREATE INDEX IF NOT EXISTS idx_call_recordings_start_time ON call_recordings(start_time DESC);

-- Enable Row Level Security
ALTER TABLE call_recordings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own recordings
CREATE POLICY "Users can view their own call recordings"
  ON call_recordings
  FOR SELECT
  USING (
    employee_id IN (
      SELECT em.id 
      FROM employee_master em
      JOIN profiles p ON p.employee_code = em.employee_code
      WHERE p.id = auth.uid()
    )
  );

-- Policy: Users can insert their own recordings
CREATE POLICY "Users can insert their own call recordings"
  ON call_recordings
  FOR INSERT
  WITH CHECK (
    employee_id IN (
      SELECT em.id 
      FROM employee_master em
      JOIN profiles p ON p.employee_code = em.employee_code
      WHERE p.id = auth.uid()
    )
  );

-- Policy: Users can update their own recordings
CREATE POLICY "Users can update their own call recordings"
  ON call_recordings
  FOR UPDATE
  USING (
    employee_id IN (
      SELECT em.id 
      FROM employee_master em
      JOIN profiles p ON p.employee_code = em.employee_code
      WHERE p.id = auth.uid()
    )
  );

-- Policy: Users can delete their own recordings
CREATE POLICY "Users can delete their own call recordings"
  ON call_recordings
  FOR DELETE
  USING (
    employee_id IN (
      SELECT em.id 
      FROM employee_master em
      JOIN profiles p ON p.employee_code = em.employee_code
      WHERE p.id = auth.uid()
    )
  );

-- Add comment to table
COMMENT ON TABLE call_recordings IS 'Stores metadata for scheduled and recorded phone calls';
