/**
 * Entity: Employee
 * Represents an employee in the system
 */
import { EmployeeCode } from '../value-objects/EmployeeCode';

export class Employee {
  constructor(
    private readonly _id: string,
    private readonly _code: EmployeeCode,
    private readonly _name: string,
    private readonly _email: string,
    private readonly _role: string,
    private readonly _department?: string,
    private readonly _designation?: string,
    private readonly _phone?: string,
    private readonly _joinDate?: Date,
    private readonly _location?: string
  ) {}

  get id(): string {
    return this._id;
  }

  get code(): EmployeeCode {
    return this._code;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get role(): string {
    return this._role;
  }

  get department(): string | undefined {
    return this._department;
  }

  get designation(): string | undefined {
    return this._designation;
  }

  get phone(): string | undefined {
    return this._phone;
  }

  get joinDate(): Date | undefined {
    return this._joinDate;
  }

  get location(): string | undefined {
    return this._location;
  }

  // Business logic methods
  getInitials(): string {
    return this._name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  getFullDisplayName(): string {
    return `${this._name} (${this._code.value})`;
  }

  isAdmin(): boolean {
    return this._role.toLowerCase() === 'admin';
  }

  isEmployee(): boolean {
    return this._role.toLowerCase() === 'employee' || this._role.toLowerCase() === 'operator';
  }

  isManager(): boolean {
    return this._role.toLowerCase() === 'manager';
  }

  hasRole(role: string): boolean {
    return this._role.toLowerCase() === role.toLowerCase();
  }
}
