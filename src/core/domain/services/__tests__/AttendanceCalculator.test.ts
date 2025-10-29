import { describe, it, expect } from 'vitest';
import { AttendanceCalculator } from '../AttendanceCalculator';
import { Attendance } from '../../entities/Attendance';
import { PunchLog } from '../../entities/PunchLog';
import { WorkInterval } from '../../entities/WorkInterval';
import { AttendanceStatus } from '../../value-objects/AttendanceStatus';
import { EmployeeCode } from '../../value-objects/EmployeeCode';

describe('AttendanceCalculator Service', () => {
  const calculator = new AttendanceCalculator();

  const createAttendance = (checkInHour: number, checkOutHour: number) => {
    const checkIn = new Date(`2025-10-18T${checkInHour.toString().padStart(2, '0')}:00:00`);
    const checkOut = new Date(`2025-10-18T${checkOutHour.toString().padStart(2, '0')}:00:00`);
    
    return new Attendance(
      new Date('2025-10-18'),
      EmployeeCode.create('EMP001'),
      AttendanceStatus.present(),
      [
        new PunchLog(checkIn, 'in', 'DEVICE-001', 'high', false),
        new PunchLog(checkOut, 'out', 'DEVICE-001', 'high', false),
      ],
      [new WorkInterval(checkIn, checkOut, 'work')],
      'high',
      false
    );
  };

  describe('calculateTotalWorkHours', () => {
    it('should calculate total hours for multiple attendances', () => {
      const attendances = [
        createAttendance(9, 17),  // 8 hours
        createAttendance(9, 18),  // 9 hours
      ];

      const total = calculator.calculateTotalWorkHours(attendances);
      expect(total).toBe(17);
    });

    it('should return 0 for empty array', () => {
      expect(calculator.calculateTotalWorkHours([])).toBe(0);
    });
  });

  describe('calculateAttendanceRate', () => {
    it('should calculate attendance rate correctly', () => {
      const attendances = [
        createAttendance(9, 17),  // present
        createAttendance(9, 17),  // present
        new Attendance(
          new Date('2025-10-18'),
          EmployeeCode.create('EMP001'),
          AttendanceStatus.absent(),
          [],
          [],
          'high',
          false
        ),  // absent
      ];

      const rate = calculator.calculateAttendanceRate(attendances);
      expect(rate).toBe(67); // 2 out of 3 = 66.67% rounded to 67%
    });

    it('should return 0 for empty array', () => {
      expect(calculator.calculateAttendanceRate([])).toBe(0);
    });

    it('should return 100 for all present', () => {
      const attendances = [
        createAttendance(9, 17),
        createAttendance(9, 17),
      ];

      expect(calculator.calculateAttendanceRate(attendances)).toBe(100);
    });
  });

  describe('countLateDays', () => {
    it('should count late days correctly', () => {
      const lateCheckIn = new Date('2025-10-18T09:30:00');
      const checkOut = new Date('2025-10-18T17:30:00');
      
      const lateAttendance = new Attendance(
        new Date('2025-10-18'),
        EmployeeCode.create('EMP001'),
        AttendanceStatus.late(),
        [new PunchLog(lateCheckIn, 'in', 'DEVICE-001', 'high', false)],
        [new WorkInterval(lateCheckIn, checkOut, 'work')],
        'high',
        false
      );

      const attendances = [
        createAttendance(9, 17),  // on time
        lateAttendance,           // late
        createAttendance(9, 17),  // on time
      ];

      expect(calculator.countLateDays(attendances)).toBe(1);
    });
  });

  describe('formatHours', () => {
    it('should format hours correctly', () => {
      expect(calculator.formatHours(8.5)).toBe('08:30');
      expect(calculator.formatHours(1.25)).toBe('01:15');
      expect(calculator.formatHours(0)).toBe('00:00');
    });

    it('should pad single digits', () => {
      expect(calculator.formatHours(5.5)).toBe('05:30');
    });
  });

  describe('formatTime', () => {
    it('should format time correctly', () => {
      const time = new Date('2025-10-18T09:30:00');
      expect(calculator.formatTime(time)).toBe('09:30');
    });

    it('should return 00:00 for null', () => {
      expect(calculator.formatTime(null)).toBe('00:00');
    });
  });
});
