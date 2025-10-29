/**
 * Data Mapper: AttendanceDataMapper
 * Converts between Clean Architecture DTOs and legacy data formats
 * Maintains backward compatibility during migration
 */
import type { AttendanceDTO, AttendanceSummaryDTO } from '@/core/application/dtos/AttendanceDTO';
import type { ProcessedDayData } from '@/types/attendance';

/**
 * Convert AttendanceDTO array to legacy Record<string, ProcessedDayData> format
 */
export function mapAttendanceDTOsToLegacyFormat(
  attendances: AttendanceDTO[]
): Record<string, ProcessedDayData> {
  const result: Record<string, ProcessedDayData> = {};

  attendances.forEach(attendance => {
    const date = attendance.date;
    
    result[date] = {
      date,
      status: mapStatusToLegacy(attendance.status),
      checkIn: attendance.checkInTime || undefined,
      checkOut: attendance.checkOutTime || undefined,
      totalHours: attendance.totalHours || '0:00',
      confidence: 'high' as const, // DTOs are always high confidence
      hasAmbiguousPunches: false,
      intervals: attendance.workIntervals.map(interval => ({
        checkIn: interval.startTime,
        checkOut: interval.endTime,
        duration: interval.duration,
        type: 'work' as const
      })),
      punchLogs: attendance.punchLogs.map(log => ({
        time: log.timestamp,
        direction: mapPunchDirectionToLegacy(log.direction),
        deviceId: log.deviceId || 'unknown',
        confidence: 'high' as const,
        inferred: false
      }))
    };
  });

  return result;
}

/**
 * Map DTO status to legacy status format
 */
function mapStatusToLegacy(status: string): 'present' | 'late' | 'absent' {
  switch (status.toLowerCase()) {
    case 'present':
      return 'present';
    case 'late':
      return 'late';
    case 'absent':
      return 'absent';
    default:
      return 'absent';
  }
}

/**
 * Map DTO punch direction to legacy format
 */
function mapPunchDirectionToLegacy(direction: string): 'in' | 'out' | 'break' {
  switch (direction.toLowerCase()) {
    case 'in':
      return 'in';
    case 'out':
      return 'out';
    case 'break':
      return 'break';
    default:
      return 'in';
  }
}

/**
 * Extract summary data from AttendanceSummaryDTO
 */
export function extractSummaryData(summary: AttendanceSummaryDTO | null) {
  if (!summary) {
    return {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      totalHours: '0:00'
    };
  }

  return {
    totalDays: summary.totalDays,
    presentDays: summary.presentDays,
    absentDays: summary.absentDays,
    lateDays: summary.lateDays || 0,
    totalHours: summary.totalHours
  };
}
