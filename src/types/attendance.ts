// Shared types for attendance system

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'sick' | 'vacation' | 'break' | 'ambiguous';

export interface PunchLogEntry {
  EmployeeCode: string;
  LogDate: string;
  SerialNumber: string;
  PunchDirection: 'in' | 'out' | 'break';
  Temperature: number;
  TemperatureState: string;
}

export interface ProcessedDayData {
  date: string;
  status: AttendanceStatus;
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

export interface AttendanceStats {
  totalAttendance: number;
  workingDays: number;
  avgCheckIn: string;
  avgCheckOut: string;
  sickDays: number;
  vacationDays: number;
  lateDays: number;
  ambiguousEntries: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  employeeCode: string;
  email: string;
  phone: string;
  joinDate: string;
  avatar: string;
  location: string;
}

export interface LeaveBalance {
  vacation: { used: number; total: number };
  sick: { used: number; total: number };
}


