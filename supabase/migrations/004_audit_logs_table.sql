-- supabase/migrations/004_audit_logs_table.sql

-- Create audit_logs table to track security events
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    user_email VARCHAR(255),
    employee_code VARCHAR(50),
    event_description TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    metadata JSONB,
    severity VARCHAR(20) DEFAULT 'info',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_severity ON public.audit_logs(severity);
CREATE INDEX idx_audit_logs_user_email ON public.audit_logs(user_email);

-- Enable RLS on audit_logs table
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can view audit logs
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM employee_auth_mapping eam 
            WHERE eam.auth_user_id = auth.uid() 
            AND eam.role = 'admin'
        )
    );

-- RLS Policy: System can insert audit logs (for logging function)
CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- Create function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
    p_event_type VARCHAR(50),
    p_user_id UUID DEFAULT NULL,
    p_user_email VARCHAR(255) DEFAULT NULL,
    p_employee_code VARCHAR(50) DEFAULT NULL,
    p_event_description TEXT DEFAULT '',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_session_id VARCHAR(255) DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL,
    p_severity VARCHAR(20) DEFAULT 'info'
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    audit_id BIGINT;
BEGIN
    INSERT INTO public.audit_logs (
        event_type,
        user_id,
        user_email,
        employee_code,
        event_description,
        ip_address,
        user_agent,
        session_id,
        metadata,
        severity
    ) VALUES (
        p_event_type,
        p_user_id,
        p_user_email,
        p_employee_code,
        p_event_description,
        p_ip_address,
        p_user_agent,
        p_session_id,
        p_metadata,
        p_severity
    ) RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$;

-- Create function to get user's IP address (for logging)
CREATE OR REPLACE FUNCTION get_client_ip()
RETURNS INET
LANGUAGE sql
STABLE
AS $$
    SELECT COALESCE(
        current_setting('request.headers', true)::json->>'x-forwarded-for',
        current_setting('request.headers', true)::json->>'x-real-ip',
        inet_client_addr()::text
    )::inet;
$$;
