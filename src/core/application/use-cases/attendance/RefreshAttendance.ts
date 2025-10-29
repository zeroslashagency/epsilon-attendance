/**
 * Use Case: RefreshAttendance
 * Refreshes attendance data for an employee
 */
import { injectable, inject } from 'inversify';
import type { IAttendanceRepository } from '@/core/domain/repositories/IAttendanceRepository';
import { EmployeeCode } from '@/core/domain/value-objects/EmployeeCode';
import { DateRange } from '@/core/domain/value-objects/DateRange';
import { GetAttendanceRequest, GetAttendanceResponse } from '../../dtos/AttendanceDTO';
import { AttendanceDTOMapper } from '../../mappers/AttendanceDTOMapper';
import { TYPES } from '@/di/types';
import type { ILogger } from '../../ports/ILogger';
import type { INotificationService } from '../../ports/INotificationService';

@injectable()
export class RefreshAttendance {
  constructor(
    @inject(TYPES.AttendanceRepository) private attendanceRepository: IAttendanceRepository,
    @inject(TYPES.Logger) private logger: ILogger,
    @inject(TYPES.NotificationService) private notificationService: INotificationService
  ) {}

  async execute(request: GetAttendanceRequest): Promise<GetAttendanceResponse> {
    const loadingId = this.notificationService.loading('Refreshing attendance data...');

    try {
      this.logger.info('Refreshing attendance data', {
        employeeCode: request.employeeCode
      });

      // Create value objects
      const employeeCode = EmployeeCode.create(request.employeeCode);
      const dateRange = DateRange.create(
        new Date(request.startDate),
        new Date(request.endDate)
      );

      // Fetch fresh data
      const attendances = await this.attendanceRepository.getByEmployeeCode(
        employeeCode,
        dateRange
      );

      // Convert to DTOs
      const attendanceDTOs = AttendanceDTOMapper.toDTOs(attendances);
      const summary = AttendanceDTOMapper.toSummaryDTO(attendances);

      this.notificationService.dismiss(loadingId);
      this.notificationService.success('Attendance data refreshed successfully');

      this.logger.info('Successfully refreshed attendance data', {
        employeeCode: request.employeeCode,
        count: attendances.length
      });

      return {
        attendances: attendanceDTOs,
        summary
      };
    } catch (error) {
      this.notificationService.dismiss(loadingId);
      this.notificationService.error('Failed to refresh attendance data');
      
      this.logger.error('Failed to refresh attendance', error as Error, {
        request
      });
      throw error;
    }
  }
}
