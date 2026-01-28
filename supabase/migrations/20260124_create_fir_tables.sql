-- Create tables for Field Inspection Reports (FIR) system

-- 1. Main FIR Activity Table
CREATE TABLE IF NOT EXISTS fir_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    fir_type TEXT DEFAULT 'BAD', -- 'GOOD' or 'BAD'
    priority TEXT DEFAULT 'Medium',
    category TEXT DEFAULT 'Other',
    status TEXT DEFAULT 'REPORTED', -- 'REPORTED', 'PERSON_RESPONSE', 'SUPER_ADMIN_REVIEW', 'CLOSED'
    
    -- Creation & Ownership
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT, -- Stores name of creator (denormalized for display)
    created_by_id UUID REFERENCES auth.users(id), -- Stores UUID of creator
    
    -- Assignments
    employee_id UUID REFERENCES auth.users(id), -- Assigned to this user (if applicable)
    submitted_person_id UUID REFERENCES auth.users(id), -- Alias for reporter if needed
    user_id UUID REFERENCES auth.users(id), -- General user association
    
    -- Legacy/Compatibility fields
    stage_2_status TEXT, -- 'ACCEPTED', 'REFUSED'
    stage_2_notes TEXT,
    stage_2_attachments JSONB DEFAULT '[]'::jsonb,
    
    stage_3_by TEXT,
    stage_3_notes TEXT,
    
    response_comment TEXT,
    final_decision TEXT, -- 'CONFIRMED', 'SENT_BACK'
    closed_at TIMESTAMPTZ,
    
    attachments JSONB DEFAULT '[]'::jsonb
);

-- 2. FIR Messages Table (Timeline/Comments)
CREATE TABLE IF NOT EXISTS fir_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES fir_activity(id) ON DELETE CASCADE,
    
    -- User Info (Snapshot)
    user_id UUID REFERENCES auth.users(id),
    user_name TEXT,
    user_role TEXT,
    
    -- Content
    message TEXT,
    message_type TEXT DEFAULT 'comment', -- 'comment', 'action', 'system'
    action TEXT, -- 'accept', 'reject', 'confirm', 'send_back', etc.
    attachments JSONB DEFAULT '[]'::jsonb,
    
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE fir_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE fir_messages ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies (Permissive for now to match typical "internal tool" requirements)

-- fir_activity policies
CREATE POLICY "Enable read access for authenticated users" ON fir_activity
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON fir_activity
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON fir_activity
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- fir_messages policies
CREATE POLICY "Enable read access for authenticated users" ON fir_messages
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON fir_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON fir_messages
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fir_activity_created_at ON fir_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fir_activity_employee_id ON fir_activity(employee_id);
CREATE INDEX IF NOT EXISTS idx_fir_messages_report_id ON fir_messages(report_id);
