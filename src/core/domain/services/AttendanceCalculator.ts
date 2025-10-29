/**
 * Domain Service: AttendanceCalculator
 * Contains complex business logic for attendance calculations
 */
import { Attendance } from '../entities/Attendance';
import { WorkInterval } from '../entities/WorkInterval';

export class AttendanceCalculator {
  /**
   * Calculate total work hours for multiple attendance records
   */
  calculateTotalWorkHours(attendances: Attendance[]): number {
    return attendances.reduce(
      (total, attendance) => total + attendance.calculateTotalHours(),
      0
    );
  }

  /**
   * Calculate average check-in time
   */
  calculateAverageCheckIn(attendances: Attendance[]): Date | null {
    const checkIns = attendances
      .map(a => a.getCheckInTime())
      .filter((time): time is Date => time !== null);

    if (checkIns.length === 0) return null;

    const totalMinutes = checkIns.reduce((sum, time) => {
      return sum + time.getHours() * 60 + time.getMinutes();
    }, 0);

    const avgMinutes = totalMinutes / checkIns.length;
    const avgDate = new Date();
    avgDate.setHours(Math.floor(avgMinutes / 60));
    avgDate.setMinutes(Math.floor(avgMinutes % 60));
    avgDate.setSeconds(0);
    avgDate.setMilliseconds(0);

    return avgDate;
  }

  /**
   * Calculate average check-out time
   */
  calculateAverageCheckOut(attendances: Attendance[]): Date | null {
    const checkOuts = attendances
      .map(a => a.getCheckOutTime())
      .filter((time): time is Date => time !== null);

    if (checkOuts.length === 0) return null;

    const totalMinutes = checkOuts.reduce((sum, time) => {
      return sum + time.getHours() * 60 + time.getMinutes();
    }, 0);

    const avgMinutes = totalMinutes / checkOuts.length;
    const avgDate = new Date();
    avgDate.setHours(Math.floor(avgMinutes / 60));
    avgDate.setMinutes(Math.floor(avgMinutes % 60));
    avgDate.setSeconds(0);
    avgDate.setMilliseconds(0);

    return avgDate;
  }

  /**
   * Calculate attendance rate (percentage)
   */
  calculateAttendanceRate(attendances: Attendance[]): number {
    if (attendances.length === 0) return 0;

    const presentCount = attendances.filter(a => a.isPresent()).length;
    return Math.round((presentCount / attendances.length) * 100);
  }

  /**
   * Count late days
   */
  countLateDays(attendances: Attendance[]): number {
    return attendances.filter(a => a.isLate()).length;
  }

  /**
   * Count absent days
   */
  countAbsentDays(attendances: Attendance[]): number {
    return attendances.filter(a => !a.isPresent()).length;
  }

  /**
   * Calculate total break time
   */
  calculateTotalBreakTime(attendances: Attendance[]): number {
    return attendances.reduce((total, attendance) => {
      const breakIntervals = attendance.intervals.filter(i => i.isBreakInterval());
      const breakTime = breakIntervals.reduce(
        (sum, interval) => sum + interval.getDurationInHours(),
        0
      );
      return total + breakTime;
    }, 0);
  }

  /**
   * Format hours to HH:MM
   */
  formatHours(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  /**
   * Format time to HH:MM
   */
  formatTime(date: Date | null): string {
    if (!date) return '00:00';
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
}
