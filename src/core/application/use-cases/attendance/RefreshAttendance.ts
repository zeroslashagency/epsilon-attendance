/**
 * Use Case: Refresh Attendance
 */
import type { IAttendanceRepository, AttendanceFilter } from '@/core/domain/repositories/IAttendanceRepository';
import type { ILogger } from '@/core/application/ports/ILogger';

export class RefreshAttendance {
    constructor(
        private attendanceRepo: IAttendanceRepository,
        private logger: ILogger
    ) { }

    async execute(filter?: AttendanceFilter) {
        this.logger.info('Refreshing attendance data', { filter });
        return this.attendanceRepo.getAll(filter);
    }
}
