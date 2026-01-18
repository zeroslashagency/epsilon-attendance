/**
 * Use Case: Get Attendance Data
 */
import type { IAttendanceRepository, AttendanceFilter } from '@/core/domain/repositories/IAttendanceRepository';

export class GetAttendanceData {
    constructor(private attendanceRepo: IAttendanceRepository) { }

    async execute(filter?: AttendanceFilter) {
        return this.attendanceRepo.getAll(filter);
    }
}
