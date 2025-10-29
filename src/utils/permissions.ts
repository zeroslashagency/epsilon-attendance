// Role-based access control utilities
export type UserRole = 'admin' | 'employee' | 'manager' | 'operator';

export interface Permission {
  module: string;
  action: string;
}

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    { module: 'dashboard', action: 'view' },
    { module: 'schedule', action: 'view' },
    { module: 'schedule', action: 'create' },
    { module: 'schedule', action: 'edit' },
    { module: 'attendance', action: 'view_all' },
    { module: 'attendance', action: 'view_own' },
    { module: 'attendance', action: 'export' },
    { module: 'analytics', action: 'view' },
    { module: 'users', action: 'manage' },
    { module: 'production', action: 'view' },
    { module: 'monitoring', action: 'view' },
  ],
  manager: [
    { module: 'dashboard', action: 'view' },
    { module: 'schedule', action: 'view' },
    { module: 'schedule', action: 'create' },
    { module: 'attendance', action: 'view_all' },
    { module: 'attendance', action: 'export' },
    { module: 'analytics', action: 'view' },
    { module: 'production', action: 'view' },
  ],
  operator: [
    { module: 'dashboard', action: 'view' },
    { module: 'schedule', action: 'view' },
    { module: 'attendance', action: 'view_own' },
    { module: 'production', action: 'view' },
  ],
  employee: [
    { module: 'attendance', action: 'view_own' },
  ]
};

// Check if a user has a specific permission
export function hasPermission(
  userRole: string | null,
  module: string,
  action: string
): boolean {
  if (!userRole) return false;
  
  const role = userRole.toLowerCase() as UserRole;
  const permissions = ROLE_PERMISSIONS[role] || [];
  
  return permissions.some(
    permission => permission.module === module && permission.action === action
  );
}

// Check if user can access standalone attendance (only their own data)
export function canAccessStandaloneAttendance(userRole: string | null): boolean {
  return hasPermission(userRole, 'attendance', 'view_own');
}

// Check if user can view all attendance data
export function canViewAllAttendance(userRole: string | null): boolean {
  return hasPermission(userRole, 'attendance', 'view_all');
}

// Get available modules for a user role
export function getAvailableModules(userRole: string | null): string[] {
  if (!userRole) return [];
  
  const role = userRole.toLowerCase() as UserRole;
  const permissions = ROLE_PERMISSIONS[role] || [];
  
  return [...new Set(permissions.map(p => p.module))];
}

// Check if user should see only their own data
export function shouldRestrictToOwnData(userRole: string | null): boolean {
  if (!userRole) return true;
  
  const role = userRole.toLowerCase() as UserRole;
  
  // Employees and operators can only see their own data
  return role === 'employee' || role === 'operator';
}
