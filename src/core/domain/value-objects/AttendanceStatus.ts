/**
 * Value Object: AttendanceStatus
 * Represents the status of an attendance record
 * Immutable and type-safe
 */
type StatusValue = 'present' | 'late' | 'absent' | 'sick' | 'vacation' | 'break' | 'ambiguous';

export class AttendanceStatus {
  private constructor(private readonly _value: StatusValue) {}

  static create(value: string): AttendanceStatus {
    const normalized = value.toLowerCase() as StatusValue;
    
    const validStatuses: StatusValue[] = [
      'present', 'late', 'absent', 'sick', 'vacation', 'break', 'ambiguous'
    ];

    if (!validStatuses.includes(normalized)) {
      throw new Error(`Invalid attendance status: ${value}`);
    }

    return new AttendanceStatus(normalized);
  }

  static present(): AttendanceStatus {
    return new AttendanceStatus('present');
  }

  static late(): AttendanceStatus {
    return new AttendanceStatus('late');
  }

  static absent(): AttendanceStatus {
    return new AttendanceStatus('absent');
  }

  get value(): StatusValue {
    return this._value;
  }

  isPresent(): boolean {
    return this._value === 'present' || this._value === 'late';
  }

  isAbsent(): boolean {
    return this._value === 'absent';
  }

  equals(other: AttendanceStatus): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
