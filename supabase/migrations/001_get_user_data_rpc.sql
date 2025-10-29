-- supabase/migrations/001_get_user_data_rpc.sql

CREATE OR REPLACE FUNCTION get_user_data(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'employee_code', COALESCE(eam.employee_code, p.employee_code, 'demo'),
        'employee_name', COALESCE(em.employee_name, p.full_name, 'Demo Employee'),
        'role', COALESCE(eam.role, p.role, 'employee'),
        'is_standalone', (p.standalone_attendance = 'YES' AND p.employee_code IS NOT NULL),
        'standalone_employee_code', CASE WHEN p.standalone_attendance = 'YES' THEN p.employee_code ELSE NULL END,
        'standalone_employee_name', (SELECT em_stand.employee_name FROM employee_master em_stand WHERE em_stand.employee_code = p.employee_code AND p.standalone_attendance = 'YES')
    )
    INTO result
    FROM auth.users u
    LEFT JOIN profiles p ON u.id = p.id
    LEFT JOIN employee_auth_mapping eam ON u.id = eam.auth_user_id
    LEFT JOIN employee_master em ON eam.employee_code = em.employee_code
    WHERE u.id = p_user_id;

    RETURN result;
END;
$$;
