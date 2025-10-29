/**
 * Dependency Injection Type Symbols
 * Used for binding and resolving dependencies
 */
export const TYPES = {
  // Repositories
  AttendanceRepository: Symbol.for('IAttendanceRepository'),
  EmployeeRepository: Symbol.for('IEmployeeRepository'),
  AuthRepository: Symbol.for('IAuthRepository'),
  AuditRepository: Symbol.for('IAuditRepository'),

  // Use Cases - Attendance
  GetAttendanceData: Symbol.for('GetAttendanceData'),
  RefreshAttendance: Symbol.for('RefreshAttendance'),
  ConfirmAttendance: Symbol.for('ConfirmAttendance'),
  ExportAttendance: Symbol.for('ExportAttendance'),
  
  // Use Cases - Employee
  GetEmployee: Symbol.for('GetEmployee'),
  GetAllEmployees: Symbol.for('GetAllEmployees'),
  
  // Use Cases - Auth
  LoginUser: Symbol.for('LoginUser'),
  LogoutUser: Symbol.for('LogoutUser'),

  // Services
  Logger: Symbol.for('ILogger'),
  NotificationService: Symbol.for('INotificationService'),

  // Infrastructure
  SupabaseClient: Symbol.for('SupabaseClient'),
} as const;
