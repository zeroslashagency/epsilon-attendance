/**
 * Repository Interface: IAttendanceRepository
 * Defines the contract for attendance data access
 * Infrastructure layer will implement this
 */
import { Attendance } from '../entities/Attendance';
import { EmployeeCode } from '../value-objects/EmployeeCode';
import { DateRange } from '../value-objects/DateRange';

export interface IAttendanceRepository {
  /**
   * Get attendance records for an employee within a date range
   */
  getByEmployeeCode(
    employeeCode: EmployeeCode,
    dateRange: DateRange
  ): Promise<Attendance[]>;

  /**
   * Get attendance for a specific date
   */
  getByDate(
    employeeCode: EmployeeCode,
    date: Date
  ): Promise<Attendance | null>;

  /**
   * Save attendance record
   */
  save(attendance: Attendance): Promise<void>;

  /**
   * Subscribe to real-time attendance updates
   */
  subscribeToUpdates(
    employeeCode: EmployeeCode,
    callback: (attendance: Attendance) => void
  ): () => void;
}
