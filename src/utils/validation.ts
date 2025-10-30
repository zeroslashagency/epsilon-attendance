// Input validation utilities for RPC parameters and user inputs
import { z } from 'zod';

// Employee code validation
export const employeeCodeSchema = z.string()
  .min(1, 'Employee code is required')
  .max(50, 'Employee code must be less than 50 characters')
  .regex(/^[a-zA-Z0-9_\- ]+$/, 'Employee code can only contain letters, numbers, spaces, hyphens, and underscores');

// Date validation (YYYY-MM-DD format)
export const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) && parsed.toISOString().split('T')[0] === date;
  }, 'Invalid date');

// User ID validation (UUID format)
export const userIdSchema = z.string()
  .uuid('User ID must be a valid UUID');

// Device ID validation
export const deviceIdSchema = z.string()
  .min(1, 'Device ID is required')
  .max(100, 'Device ID must be less than 100 characters');

// RPC parameter validation schemas
export const processAttendanceLogsSchema = z.object({
  p_employee_code: employeeCodeSchema,
  p_start_date: dateSchema,
  p_end_date: dateSchema
}).refine((data) => {
  const startDate = new Date(data.p_start_date);
  const endDate = new Date(data.p_end_date);
  return startDate <= endDate;
}, {
  message: 'Start date must be before or equal to end date',
  path: ['p_start_date']
});

export const getUserDataSchema = z.object({
  p_user_id: userIdSchema
});

export const logAuditEventSchema = z.object({
  p_event_type: z.string().min(1, 'Event type is required').max(50, 'Event type too long'),
  p_user_id: userIdSchema.optional(),
  p_user_email: z.string().email('Invalid email format').optional(),
  p_employee_code: employeeCodeSchema.optional(),
  p_event_description: z.string().min(1, 'Event description is required').max(1000, 'Description too long'),
  p_ip_address: z.string().ip('Invalid IP address').optional(),
  p_user_agent: z.string().max(500, 'User agent too long').optional(),
  p_session_id: z.string().max(255, 'Session ID too long').optional(),
  p_metadata: z.record(z.unknown()).optional(),
  p_severity: z.enum(['debug', 'info', 'warn', 'error']).default('info')
});

// Validation helper functions
export function validateEmployeeCode(code: string): { isValid: boolean; error?: string } {
  try {
    employeeCodeSchema.parse(code);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message };
    }
    return { isValid: false, error: 'Invalid employee code' };
  }
}

export function validateDateRange(startDate: string, endDate: string): { isValid: boolean; error?: string } {
  try {
    dateSchema.parse(startDate);
    dateSchema.parse(endDate);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return { isValid: false, error: 'Start date must be before or equal to end date' };
    }
    
    // Check if date range is reasonable (not more than 1 year)
    const diffMs = end.getTime() - start.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    if (diffDays > 365) {
      return { isValid: false, error: 'Date range cannot exceed 1 year' };
    }
    
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message };
    }
    return { isValid: false, error: 'Invalid date range' };
  }
}

export function validateUserId(userId: string): { isValid: boolean; error?: string } {
  try {
    userIdSchema.parse(userId);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message };
    }
    return { isValid: false, error: 'Invalid user ID' };
  }
}

// Generic validation function for any schema
export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): { 
  isValid: boolean; 
  data?: T; 
  error?: string 
} {
  try {
    const data = schema.parse(input);
    return { isValid: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { 
        isValid: false, 
        error: `${firstError.path.join('.')}: ${firstError.message}` 
      };
    }
    return { isValid: false, error: 'Validation failed' };
  }
}

// Sanitization helpers
export function sanitizeEmployeeCode(code: string): string {
  // Keep original case for employee codes (e.g., EE65, emp001)
  // Only trim whitespace, don't convert to lowercase
  return code.trim();
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function sanitizeString(input: string, maxLength = 255): string {
  return input.trim().slice(0, maxLength);
}

// Schemas are already exported above when declared
