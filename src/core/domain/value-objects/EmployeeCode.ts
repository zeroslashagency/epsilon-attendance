/**
 * Value Object: EmployeeCode
 * Represents an employee's unique identifier
 * Immutable and self-validating
 */
export class EmployeeCode {
  private constructor(private readonly _value: string) {}

  static create(value: string): EmployeeCode {
    if (!value || value.trim().length === 0) {
      throw new Error('Employee code cannot be empty');
    }

    const trimmed = value.trim();
    
    if (trimmed.length > 50) {
      throw new Error('Employee code cannot exceed 50 characters');
    }

    return new EmployeeCode(trimmed);
  }

  get value(): string {
    return this._value;
  }

  equals(other: EmployeeCode): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
