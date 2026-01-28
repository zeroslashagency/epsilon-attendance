-- Create tables for Task Management system
-- Task ID: 250

-- 1. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    priority TEXT DEFAULT 'medium', -- low, medium, high
    due_date TIMESTAMPTZ,
    
    -- Creation & Ownership
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Task Assignments Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS task_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    
    UNIQUE(task_id, user_id)
);

-- 3. Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Tasks Policies
CREATE POLICY "Enable read access for authenticated users" ON tasks
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON tasks
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable update for creators and admins" ON tasks
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = created_by 
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin'))
        OR EXISTS (SELECT 1 FROM task_assignments WHERE task_id = id AND user_id = auth.uid())
    )
    WITH CHECK (true);

CREATE POLICY "Enable delete for creators and admins" ON tasks
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() = created_by 
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin'))
    );

-- Task Assignments Policies
CREATE POLICY "Enable read access for authenticated users" ON task_assignments
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON task_assignments
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON task_assignments
    FOR DELETE
    TO authenticated
    USING (true);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_user_id ON task_assignments(user_id);

-- 6. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
