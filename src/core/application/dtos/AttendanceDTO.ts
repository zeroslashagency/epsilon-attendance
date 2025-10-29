/**
 * Data Transfer Object: AttendanceDTO
 * Used for transferring attendance data between layers
 */

export interface PunchLogDTO {
  time: string;
  direction: 'in' | 'out' | 'break';
  deviceId: string;
  confidence: 'high' | 'medium' | 'low';
  inferred: boolean;
}

export interface WorkIntervalDTO {
  checkIn: string;
  checkOut: string;
  duration: string;
  type: 'work' | 'break';
}

export interface AttendanceDTO {
  date: string;
  employeeCode: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
  totalHours: string;
  confidence: 'high' | 'medium' | 'low';
  hasAmbiguousPunches: boolean;
  intervals: WorkIntervalDTO[];
  punchLogs: PunchLogDTO[];
}

export interface AttendanceSummaryDTO {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  totalHours: string;
  averageHours: string;
  attendanceRate: number;
}

export interface GetAttendanceRequest {
  employeeCode: string;
  startDate: string;
  endDate: string;
}

export interface GetAttendanceResponse {
  attendances: AttendanceDTO[];
  summary: AttendanceSummaryDTO;
}
