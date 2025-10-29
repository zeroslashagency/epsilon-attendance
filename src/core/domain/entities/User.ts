/**
 * Entity: User
 * Represents an authenticated user in the system
 */
import { EmployeeCode } from '../value-objects/EmployeeCode';

export class User {
  constructor(
    private readonly _id: string,
    private readonly _email: string,
    private readonly _employeeCode: EmployeeCode | null,
    private readonly _role: string,
    private readonly _isStandalone: boolean = false
  ) {}

  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get employeeCode(): EmployeeCode | null {
    return this._employeeCode;
  }

  get role(): string {
    return this._role;
  }

  get isStandalone(): boolean {
    return this._isStandalone;
  }

  // Business logic methods
  hasEmployeeCode(): boolean {
    return this._employeeCode !== null;
  }

  isAdmin(): boolean {
    return this._role.toLowerCase() === 'admin';
  }

  isEmployee(): boolean {
    return this._role.toLowerCase() === 'employee' || this._role.toLowerCase() === 'operator';
  }

  canAccessAllEmployeeData(): boolean {
    return this.isAdmin() && !this._isStandalone;
  }

  canAccessOnlyOwnData(): boolean {
    return this._isStandalone || this.isEmployee();
  }

  getAccessibleEmployeeCode(): EmployeeCode | null {
    if (!this.hasEmployeeCode()) {
      return null;
    }
    return this._employeeCode;
  }
}
