/**
 * Mapper: AttendanceDTOMapper
 * Converts between domain entities and DTOs
 */
import { Attendance } from '@/core/domain/entities/Attendance';
import { AttendanceDTO, PunchLogDTO, WorkIntervalDTO, AttendanceSummaryDTO } from '../dtos/AttendanceDTO';
import { AttendanceCalculator } from '@/core/domain/services/AttendanceCalculator';

export class AttendanceDTOMapper {
  private static calculator = new AttendanceCalculator();

  /**
   * Convert domain entity to DTO
   */
  static toDTO(attendance: Attendance): AttendanceDTO {
    return {
      date: attendance.date.toISOString().split('T')[0],
      employeeCode: attendance.employeeCode.value,
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

  /**
   * Convert multiple domain entities to DTOs
   */
  static toDTOs(attendances: Attendance[]): AttendanceDTO[] {
    return attendances.map(a => this.toDTO(a));
  }

  /**
   * Create summary DTO from domain entities
   */
  static toSummaryDTO(attendances: Attendance[]): AttendanceSummaryDTO {
    const totalDays = attendances.length;
    const presentDays = attendances.filter(a => a.isPresent()).length;
    const absentDays = this.calculator.countAbsentDays(attendances);
    const lateDays = this.calculator.countLateDays(attendances);
    const totalHours = this.calculator.calculateTotalWorkHours(attendances);
    const averageHours = totalDays > 0 ? totalHours / totalDays : 0;
    const attendanceRate = this.calculator.calculateAttendanceRate(attendances);

    return {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      totalHours: this.calculator.formatHours(totalHours),
      averageHours: this.calculator.formatHours(averageHours),
      attendanceRate
    };
  }
}
