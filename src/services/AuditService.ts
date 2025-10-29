import { supabase } from '@/lib/supabase';

export type AuditEventType = 
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED' 
  | 'UNAUTHORIZED_ACCESS_ATTEMPT'
  | 'ACCESS_DENIED'
  | 'LOGOUT'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_CHANGE'
  | 'ATTENDANCE_VIEW'
  | 'STANDALONE_MODE_ACTIVATED'
  | 'PROFILE_UPDATE'
  | 'SECURITY_VIOLATION';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AuditLogEntry {
  event_type: AuditEventType;
  user_id?: string;
  user_email?: string;
  employee_code?: string;
  event_description: string;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  metadata?: Record<string, unknown>;
  severity?: AuditSeverity;
}

export class AuditService {
  /**
   * Log an audit event to the database
   */
  static async logEvent(entry: AuditLogEntry): Promise<void> {
    try {
      // Get client information
      const userAgent = navigator.userAgent;
      const sessionId = await this.getSessionId();
      
      // Call the audit logging RPC function
      const { error } = await supabase.rpc('log_audit_event', {
        p_event_type: entry.event_type,
        p_user_id: entry.user_id || null,
        p_user_email: entry.user_email || null,
        p_employee_code: entry.employee_code || null,
        p_event_description: entry.event_description,
        p_ip_address: null, // Will be determined server-side
        p_user_agent: userAgent,
        p_session_id: sessionId,
        p_metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
        p_severity: entry.severity || 'info'
      });

      if (error) {
        console.error('Failed to log audit event:', error);
        // Don't throw error to avoid breaking main application flow
      }
    } catch (error) {
      console.error('Audit logging error:', error);
      // Silent fail - audit logging should not break the app
    }
  }

  /**
   * Log unauthorized access attempt
   */
  static async logUnauthorizedAccess(
    userEmail: string, 
    userId?: string, 
    employeeCode?: string,
    additionalInfo?: Record<string, unknown>
  ): Promise<void> {
    await this.logEvent({
      event_type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      user_id: userId,
      user_email: userEmail,
      employee_code: employeeCode,
      event_description: `Unauthorized access attempt by user ${userEmail}. User does not have standalone_attendance permission.`,
      severity: 'warning',
      metadata: {
        timestamp: new Date().toISOString(),
        standalone_attendance_status: 'NO',
        action_taken: 'forced_logout',
        ...additionalInfo
      }
    });
  }

  /**
   * Log access denied event
   */
  static async logAccessDenied(
    userEmail: string,
    reason: string,
    userId?: string,
    employeeCode?: string
  ): Promise<void> {
    await this.logEvent({
      event_type: 'ACCESS_DENIED',
      user_id: userId,
      user_email: userEmail,
      employee_code: employeeCode,
      event_description: `Access denied for user ${userEmail}. Reason: ${reason}`,
      severity: 'warning',
      metadata: {
        denial_reason: reason,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log successful login
   */
  static async logLoginSuccess(
    userEmail: string,
    userId: string,
    employeeCode?: string,
    isStandalone?: boolean
  ): Promise<void> {
    await this.logEvent({
      event_type: 'LOGIN_SUCCESS',
      user_id: userId,
      user_email: userEmail,
      employee_code: employeeCode,
      event_description: `Successful login by user ${userEmail}${isStandalone ? ' (standalone mode)' : ''}`,
      severity: 'info',
      metadata: {
        standalone_mode: isStandalone || false,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log failed login attempt
   */
  static async logLoginFailed(
    userEmail: string,
    reason: string,
    userId?: string
  ): Promise<void> {
    await this.logEvent({
      event_type: 'LOGIN_FAILED',
      user_id: userId,
      user_email: userEmail,
      event_description: `Failed login attempt for user ${userEmail}. Reason: ${reason}`,
      severity: 'warning',
      metadata: {
        failure_reason: reason,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log logout event
   */
  static async logLogout(
    userEmail: string,
    userId: string,
    employeeCode?: string,
    forced?: boolean
  ): Promise<void> {
    await this.logEvent({
      event_type: 'LOGOUT',
      user_id: userId,
      user_email: userEmail,
      employee_code: employeeCode,
      event_description: `User ${userEmail} logged out${forced ? ' (forced)' : ''}`,
      severity: forced ? 'warning' : 'info',
      metadata: {
        forced_logout: forced || false,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log standalone mode activation
   */
  static async logStandaloneModeActivated(
    userEmail: string,
    userId: string,
    targetEmployeeCode: string,
    targetEmployeeName?: string
  ): Promise<void> {
    await this.logEvent({
      event_type: 'STANDALONE_MODE_ACTIVATED',
      user_id: userId,
      user_email: userEmail,
      employee_code: targetEmployeeCode,
      event_description: `User ${userEmail} activated standalone mode to view attendance for employee ${targetEmployeeCode}${targetEmployeeName ? ` (${targetEmployeeName})` : ''}`,
      severity: 'info',
      metadata: {
        target_employee_code: targetEmployeeCode,
        target_employee_name: targetEmployeeName,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Get current session ID
   */
  private static async getSessionId(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token?.substring(0, 20) || null;
    } catch {
      return null;
    }
  }

  /**
   * Get audit logs (admin only)
   */
  static async getAuditLogs(
    limit: number = 100,
    eventType?: AuditEventType,
    severity?: AuditSeverity,
    startDate?: Date,
    endDate?: Date
  ) {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (severity) {
      query = query.eq('severity', severity);
    }

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    return query;
  }
}
