import { USER_ROLES, UserRole as AppUserRole } from '@/config/roles';

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<string, { module: string; action: string }[]> = {
  [USER_ROLES.SUPER_ADMIN]: [
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
  [USER_ROLES.ADMIN]: [
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
  [USER_ROLES.OPERATOR]: [
    { module: 'dashboard', action: 'view' },
    { module: 'schedule', action: 'view' },
    { module: 'attendance', action: 'view_own' },
    { module: 'production', action: 'view' },
  ],
  [USER_ROLES.EMPLOYEE]: [
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
  
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  
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
  if (userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.SUPER_ADMIN) return true;
  return hasPermission(userRole, 'attendance', 'view_all');
}

// Get available modules for a user role
export function getAvailableModules(userRole: string | null): string[] {
  if (!userRole) return [];
  
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  
  return [...new Set(permissions.map(p => p.module))];
}

// Check if user should see only their own data
export function shouldRestrictToOwnData(userRole: string | null): boolean {
  if (!userRole) return true;
  
  // Only Admin and Super Admin can see everyone's data
  return userRole !== USER_ROLES.ADMIN && userRole !== USER_ROLES.SUPER_ADMIN;
}
