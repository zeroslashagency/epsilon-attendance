import { describe, it, expect } from 'vitest';
import { Attendance } from '../Attendance';
import { PunchLog } from '../PunchLog';
import { WorkInterval } from '../WorkInterval';
import { AttendanceStatus } from '../../value-objects/AttendanceStatus';
import { EmployeeCode } from '../../value-objects/EmployeeCode';

describe('Attendance Entity', () => {
  const createTestAttendance = () => {
    const checkIn = new Date('2025-10-18T09:00:00');
    const checkOut = new Date('2025-10-18T17:30:00');
    
    const punchLogs = [
      new PunchLog(checkIn, 'in', 'DEVICE-001', 'high', false),
      new PunchLog(checkOut, 'out', 'DEVICE-001', 'high', false),
    ];

    const intervals = [
      new WorkInterval(checkIn, checkOut, 'work'),
    ];

    return new Attendance(
      new Date('2025-10-18'),
      EmployeeCode.create('EMP001'),
      AttendanceStatus.present(),
      punchLogs,
      intervals,
      'high',
      false
    );
  };

  describe('calculateTotalHours', () => {
    it('should calculate total hours correctly', () => {
      const attendance = createTestAttendance();
      const totalHours = attendance.calculateTotalHours();
      expect(totalHours).toBe(8.5);
    });

    it('should return 0 for attendance with no intervals', () => {
      const attendance = new Attendance(
        new Date(),
        EmployeeCode.create('EMP001'),
        AttendanceStatus.absent(),
        [],
        [],
        'high',
        false
      );
      expect(attendance.calculateTotalHours()).toBe(0);
    });
  });

  describe('isLate', () => {
    it('should identify late attendance (after 9:00 AM)', () => {
      const lateCheckIn = new Date('2025-10-18T09:15:00');
      const checkOut = new Date('2025-10-18T17:30:00');
      
      const punchLogs = [
        new PunchLog(lateCheckIn, 'in', 'DEVICE-001', 'high', false),
        new PunchLog(checkOut, 'out', 'DEVICE-001', 'high', false),
      ];

      const intervals = [new WorkInterval(lateCheckIn, checkOut, 'work')];

      const attendance = new Attendance(
        new Date('2025-10-18'),
        EmployeeCode.create('EMP001'),
        AttendanceStatus.late(),
        punchLogs,
        intervals,
        'high',
        false
      );

      expect(attendance.isLate()).toBe(true);
    });

    it('should not identify on-time attendance as late', () => {
      const attendance = createTestAttendance();
      expect(attendance.isLate()).toBe(false);
    });
  });

  describe('isPresent', () => {
    it('should return true for present status', () => {
      const attendance = createTestAttendance();
      expect(attendance.isPresent()).toBe(true);
    });

    it('should return true for late status', () => {
      const lateCheckIn = new Date('2025-10-18T09:15:00');
      const checkOut = new Date('2025-10-18T17:30:00');
      
      const attendance = new Attendance(
        new Date('2025-10-18'),
        EmployeeCode.create('EMP001'),
        AttendanceStatus.late(),
        [new PunchLog(lateCheckIn, 'in', 'DEVICE-001', 'high', false)],
        [new WorkInterval(lateCheckIn, checkOut, 'work')],
        'high',
        false
      );

      expect(attendance.isPresent()).toBe(true);
    });

    it('should return false for absent status', () => {
      const attendance = new Attendance(
        new Date('2025-10-18'),
        EmployeeCode.create('EMP001'),
        AttendanceStatus.absent(),
        [],
        [],
        'high',
        false
      );

      expect(attendance.isPresent()).toBe(false);
    });
  });

  describe('getTotalHoursFormatted', () => {
    it('should format hours correctly', () => {
      const attendance = createTestAttendance();
      expect(attendance.getTotalHoursFormatted()).toBe('08:30');
    });

    it('should pad single digits', () => {
      const checkIn = new Date('2025-10-18T09:00:00');
      const checkOut = new Date('2025-10-18T10:05:00');
      
      const attendance = new Attendance(
        new Date('2025-10-18'),
        EmployeeCode.create('EMP001'),
        AttendanceStatus.present(),
        [],
        [new WorkInterval(checkIn, checkOut, 'work')],
        'high',
        false
      );

      expect(attendance.getTotalHoursFormatted()).toBe('01:05');
    });
  });

  describe('getCheckInTime', () => {
    it('should return first in punch time', () => {
      const attendance = createTestAttendance();
      const checkIn = attendance.getCheckInTime();
      
      expect(checkIn).not.toBeNull();
      expect(checkIn?.getHours()).toBe(9);
      expect(checkIn?.getMinutes()).toBe(0);
    });

    it('should return null when no in punch exists', () => {
      const attendance = new Attendance(
        new Date('2025-10-18'),
        EmployeeCode.create('EMP001'),
        AttendanceStatus.absent(),
        [],
        [],
        'high',
        false
      );

      expect(attendance.getCheckInTime()).toBeNull();
    });
  });

  describe('getCheckOutTime', () => {
    it('should return last out punch time', () => {
      const attendance = createTestAttendance();
      const checkOut = attendance.getCheckOutTime();
      
      expect(checkOut).not.toBeNull();
      expect(checkOut?.getHours()).toBe(17);
      expect(checkOut?.getMinutes()).toBe(30);
    });

    it('should return null when no out punch exists', () => {
      const checkIn = new Date('2025-10-18T09:00:00');
      
      const attendance = new Attendance(
        new Date('2025-10-18'),
        EmployeeCode.create('EMP001'),
        AttendanceStatus.present(),
        [new PunchLog(checkIn, 'in', 'DEVICE-001', 'high', false)],
        [],
        'high',
        false
      );

      expect(attendance.getCheckOutTime()).toBeNull();
    });
  });
});
