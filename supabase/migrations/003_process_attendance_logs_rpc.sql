-- supabase/migrations/003_process_attendance_logs_rpc.sql

CREATE OR REPLACE FUNCTION process_attendance_logs(p_employee_code TEXT, p_start_date DATE, p_end_date DATE)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- Security Check: Ensure authenticated user owns the requested employee_code
    IF NOT EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.employee_code = p_employee_code
        UNION 
        SELECT 1 FROM employee_auth_mapping eam 
        WHERE eam.auth_user_id = auth.uid() AND eam.employee_code = p_employee_code
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Access denied for this employee code.';
    END IF;

    WITH daily_logs AS (
        SELECT
            log_date::date AS attendance_date,
            MIN(CASE WHEN punch_direction = 'in' THEN log_date END) AS check_in,
            MAX(CASE WHEN punch_direction = 'out' THEN log_date END) AS check_out
        FROM employee_raw_logs
        WHERE employee_code = p_employee_code
          AND log_date >= p_start_date::timestamp
          AND log_date < (p_end_date + INTERVAL '1 day')::timestamp
        GROUP BY log_date::date
    )
    SELECT json_object_agg(
        attendance_date,
        json_build_object(
            'date', attendance_date,
            'status', 
                CASE 
                    WHEN check_in IS NULL THEN 'absent'
                    WHEN check_in::time > '09:00:00' THEN 'late'
                    ELSE 'present'
                END,
            'checkIn', TO_CHAR(check_in, 'HH24:MI'),
            'checkOut', TO_CHAR(check_out, 'HH24:MI'),
            'totalHours', 
                CASE 
                    WHEN check_in IS NOT NULL AND check_out IS NOT NULL THEN 
                        TRIM(TO_CHAR(EXTRACT(HOUR FROM (check_out - check_in)), '00')) || ':' || TRIM(TO_CHAR(EXTRACT(MINUTE FROM (check_out - check_in)), '00'))
                    ELSE '0:00'
                END,
            'confidence', 'high',
            'hasAmbiguousPunches', false,
            'intervals', 
                CASE 
                    WHEN check_in IS NOT NULL AND check_out IS NOT NULL THEN
                        json_build_array(
                            json_build_object(
                                'checkIn', TO_CHAR(check_in, 'HH24:MI'),
                                'checkOut', TO_CHAR(check_out, 'HH24:MI'),
                                'duration', TRIM(TO_CHAR(EXTRACT(HOUR FROM (check_out - check_in)), '00')) || ':' || TRIM(TO_CHAR(EXTRACT(MINUTE FROM (check_out - check_in)), '00')),
                                'type', 'work'
                            )
                        )
                    ELSE '[]'::json
                END,
            'punchLogs', (
                SELECT COALESCE(json_agg(
                    json_build_object(
                        'time', TO_CHAR(log_date, 'HH24:MI'),
                        'direction', punch_direction,
                        'deviceId', serial_number,
                        'confidence', 'high',
                        'inferred', false
                    ) ORDER BY log_date
                ), '[]'::json)
                FROM employee_raw_logs 
                WHERE employee_code = p_employee_code 
                AND log_date::date = daily_logs.attendance_date
            )
        )
    )
    INTO result
    FROM daily_logs;

    RETURN COALESCE(result, '{}'::json);
END;
$$;
