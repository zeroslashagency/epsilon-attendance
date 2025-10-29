/**
 * Domain Service: PermissionService
 * Handles permission checks and access control logic
 */
import { User } from '../entities/User';
import { EmployeeCode } from '../value-objects/EmployeeCode';

export type Permission = 
  | 'view_all_attendance'
  | 'view_own_attendance'
  | 'edit_attendance'
  | 'export_data'
  | 'manage_users'
  | 'view_reports'
  | 'manage_settings';

export class PermissionService {
  /**
   * Check if user has a specific permission
   */
  hasPermission(user: User, permission: Permission): boolean {
    switch (permission) {
      case 'view_all_attendance':
        return user.isAdmin() && !user.isStandalone;

      case 'view_own_attendance':
        return user.hasEmployeeCode();

      case 'edit_attendance':
        return user.isAdmin();

      case 'export_data':
        return user.isAdmin() || user.isEmployee();

      case 'manage_users':
        return user.isAdmin() && !user.isStandalone;

      case 'view_reports':
        return user.isAdmin();

      case 'manage_settings':
        return user.isAdmin() && !user.isStandalone;

      default:
        return false;
    }
  }

  /**
   * Check if user can access specific employee's data
   */
  canAccessEmployeeData(user: User, employeeCode: EmployeeCode): boolean {
    // Admin can access all employee data (unless standalone)
    if (user.isAdmin() && !user.isStandalone) {
      return true;
    }

    // Users can only access their own data
    const userEmployeeCode = user.getAccessibleEmployeeCode();
    if (!userEmployeeCode) {
      return false;
    }

    return userEmployeeCode.equals(employeeCode);
  }

  /**
   * Get accessible employee codes for a user
   */
  getAccessibleEmployeeCodes(user: User, allEmployeeCodes: EmployeeCode[]): EmployeeCode[] {
    // Admin can access all (unless standalone)
    if (user.isAdmin() && !user.isStandalone) {
      return allEmployeeCodes;
    }

    // Others can only access their own
    const userCode = user.getAccessibleEmployeeCode();
    return userCode ? [userCode] : [];
  }

  /**
   * Check if user should see standalone attendance only
   */
  shouldRestrictToOwnData(user: User): boolean {
    return user.isStandalone || user.isEmployee();
  }

  /**
   * Get user's role display name
   */
  getRoleDisplayName(user: User): string {
    if (user.isAdmin()) {
      return user.isStandalone ? 'Admin (Standalone)' : 'Administrator';
    }
    if (user.isEmployee()) {
      return 'Employee';
    }
    return user.role;
  }
}
