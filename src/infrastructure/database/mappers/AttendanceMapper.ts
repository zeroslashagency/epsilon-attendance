/**
 * Mapper: AttendanceMapper
 * Converts between database records and domain entities
 */
import { Attendance } from '@/core/domain/entities/Attendance';
import { PunchLog } from '@/core/domain/entities/PunchLog';
import { WorkInterval } from '@/core/domain/entities/WorkInterval';
import { AttendanceStatus } from '@/core/domain/value-objects/AttendanceStatus';
import { EmployeeCode } from '@/core/domain/value-objects/EmployeeCode';

interface DatabaseAttendanceRecord {
  date: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
  totalHours?: string;
  confidence: 'high' | 'medium' | 'low';
  hasAmbiguousPunches: boolean;
  intervals: Array<{
    checkIn: string;
    checkOut: string;
    duration: string;
    type: 'work' | 'break';
  }>;
  punchLogs: Array<{
    time: string;
    direction: 'in' | 'out' | 'break';
    deviceId: string;
    confidence: 'high' | 'medium' | 'low';
    inferred?: boolean;
  }>;
}

export class AttendanceMapper {
  /**
   * Convert database record to domain entity
   */
  static toDomain(
    record: DatabaseAttendanceRecord,
    employeeCode: string
  ): Attendance {
    // Parse date
    const date = new Date(record.date);

    // Create employee code
    const empCode = EmployeeCode.create(employeeCode);

    // Create status
    const status = AttendanceStatus.create(record.status);

    // Map punch logs
    const punchLogs = record.punchLogs.map(log => {
      const logDate = new Date(record.date);
      const [hours, minutes] = log.time.split(':').map(Number);
      logDate.setHours(hours, minutes, 0, 0);

      return new PunchLog(
        logDate,
        log.direction,
        log.deviceId,
        log.confidence,
        log.inferred || false
      );
    });

    // Map intervals
    const intervals = record.intervals.map(interval => {
      const checkInDate = new Date(record.date);
      const [inHours, inMinutes] = interval.checkIn.split(':').map(Number);
      checkInDate.setHours(inHours, inMinutes, 0, 0);

      const checkOutDate = new Date(record.date);
      const [outHours, outMinutes] = interval.checkOut.split(':').map(Number);
      checkOutDate.setHours(outHours, outMinutes, 0, 0);

      return new WorkInterval(checkInDate, checkOutDate, interval.type);
    });

    return new Attendance(
      date,
      empCode,
      status,
      punchLogs,
      intervals,
      record.confidence,
      record.hasAmbiguousPunches
    );
  }

  /**
   * Convert domain entity to database record
   */
  static toDatabase(attendance: Attendance): DatabaseAttendanceRecord {
    return {
      date: attendance.date.toISOString().split('T')[0],
      status: attendance.status.value,
      checkIn: attendance.getCheckInTime()?.toTimeString().slice(0, 5),
      checkOut: attendance.getCheckOutTime()?.toTimeString().slice(0, 5),
      totalHours: attendance.getTotalHoursFormatted(),
      confidence: attendance.confidence,
      hasAmbiguousPunches: attendance.hasAmbiguousPunches,
      intervals: attendance.intervals.map(interval => ({
        checkIn: interval.checkIn.toTimeString().slice(0, 5),
        checkOut: interval.checkOut.toTimeString().slice(0, 5),
        duration: interval.getDurationFormatted(),
        type: interval.type
      })),
      punchLogs: attendance.punchLogs.map(log => ({
        time: log.getTimeFormatted(),
        direction: log.direction,
        deviceId: log.deviceId,
        confidence: log.confidence,
        inferred: log.inferred
      }))
    };
  }
}
