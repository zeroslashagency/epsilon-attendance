/**
 * Domain Service: AttendanceValidator
 * Validates attendance data and business rules
 */
import { Attendance } from '../entities/Attendance';
import { PunchLog } from '../entities/PunchLog';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class AttendanceValidator {
  /**
   * Validate attendance record
   */
  validate(attendance: Attendance): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for missing punch logs
    if (attendance.punchLogs.length === 0) {
      errors.push('No punch logs found');
    }

    // Check for unpaired punches
    const unpairedPunches = this.findUnpairedPunches(attendance.punchLogs);
    if (unpairedPunches.length > 0) {
      warnings.push(`Found ${unpairedPunches.length} unpaired punch(es)`);
    }

    // Check for ambiguous punches
    if (attendance.hasAmbiguousPunches) {
      warnings.push('Attendance has ambiguous punches');
    }

    // Check for low confidence
    if (attendance.confidence === 'low') {
      warnings.push('Attendance data has low confidence');
    }

    // Check for missing intervals
    if (attendance.intervals.length === 0 && attendance.punchLogs.length > 0) {
      warnings.push('No work intervals calculated despite having punch logs');
    }

    // Check for excessive work hours (>12 hours)
    const totalHours = attendance.calculateTotalHours();
    if (totalHours > 12) {
      warnings.push(`Excessive work hours: ${totalHours.toFixed(2)} hours`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Find unpaired punches (in without out, or out without in)
   */
  private findUnpairedPunches(punchLogs: PunchLog[]): PunchLog[] {
    const unpaired: PunchLog[] = [];
    let expectingOut = false;

    for (const punch of punchLogs) {
      if (punch.direction === 'in') {
        if (expectingOut) {
          // Found 'in' when expecting 'out' - previous 'in' is unpaired
          unpaired.push(punch);
        }
        expectingOut = true;
      } else if (punch.direction === 'out') {
        if (!expectingOut) {
          // Found 'out' without preceding 'in'
          unpaired.push(punch);
        }
        expectingOut = false;
      }
    }

    return unpaired;
  }

  /**
   * Validate punch log sequence
   */
  validatePunchSequence(punchLogs: PunchLog[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (punchLogs.length === 0) {
      return { isValid: true, errors, warnings };
    }

    // Check chronological order
    for (let i = 1; i < punchLogs.length; i++) {
      if (punchLogs[i].time < punchLogs[i - 1].time) {
        errors.push('Punch logs are not in chronological order');
        break;
      }
    }

    // Check for duplicate punches (same time and direction)
    for (let i = 1; i < punchLogs.length; i++) {
      if (
        punchLogs[i].time.getTime() === punchLogs[i - 1].time.getTime() &&
        punchLogs[i].direction === punchLogs[i - 1].direction
      ) {
        warnings.push('Found duplicate punch entries');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if attendance needs review
   */
  needsReview(attendance: Attendance): boolean {
    const validation = this.validate(attendance);
    return !validation.isValid || validation.warnings.length > 0;
  }
}
