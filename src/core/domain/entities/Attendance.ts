/**
 * Entity: Attendance
 * Aggregate root for attendance data
 * Contains all business logic related to attendance
 */
import { AttendanceStatus } from '../value-objects/AttendanceStatus';
import { EmployeeCode } from '../value-objects/EmployeeCode';
import { PunchLog } from './PunchLog';
import { WorkInterval } from './WorkInterval';

export class Attendance {
  constructor(
    private readonly _date: Date,
    private readonly _employeeCode: EmployeeCode,
    private readonly _status: AttendanceStatus,
    private readonly _punchLogs: PunchLog[],
    private readonly _intervals: WorkInterval[],
    private readonly _confidence: 'high' | 'medium' | 'low',
    private readonly _hasAmbiguousPunches: boolean
  ) {}

  get date(): Date {
    return this._date;
  }

  get employeeCode(): EmployeeCode {
    return this._employeeCode;
  }

  get status(): AttendanceStatus {
    return this._status;
  }

  get punchLogs(): PunchLog[] {
    return [...this._punchLogs];
  }

  get intervals(): WorkInterval[] {
    return [...this._intervals];
  }

  get confidence(): 'high' | 'medium' | 'low' {
    return this._confidence;
  }

  get hasAmbiguousPunches(): boolean {
    return this._hasAmbiguousPunches;
  }

  // Business logic methods
  calculateTotalHours(): number {
    return this._intervals.reduce(
      (total, interval) => total + interval.getDurationInHours(),
      0
    );
  }

  isLate(lateThreshold: Date = new Date(0, 0, 0, 9, 0)): boolean {
    if (this._punchLogs.length === 0) return false;
    
    const firstPunch = this._punchLogs[0];
    const punchTime = firstPunch.time;
    
    return punchTime.getHours() > lateThreshold.getHours() ||
           (punchTime.getHours() === lateThreshold.getHours() && 
            punchTime.getMinutes() > lateThreshold.getMinutes());
  }

  isPresent(): boolean {
    return this._status.isPresent();
  }

  getCheckInTime(): Date | null {
    const firstInPunch = this._punchLogs.find(log => log.direction === 'in');
    return firstInPunch ? firstInPunch.time : null;
  }

  getCheckOutTime(): Date | null {
    const lastOutPunch = [...this._punchLogs]
      .reverse()
      .find(log => log.direction === 'out');
    return lastOutPunch ? lastOutPunch.time : null;
  }

  getTotalHoursFormatted(): string {
    const totalHours = this.calculateTotalHours();
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}
