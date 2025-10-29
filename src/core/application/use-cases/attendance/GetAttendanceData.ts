/**
 * Use Case: GetAttendanceData
 * Fetches attendance data for an employee within a date range
 */
import { injectable, inject } from 'inversify';
import type { IAttendanceRepository } from '@/core/domain/repositories/IAttendanceRepository';
import { EmployeeCode } from '@/core/domain/value-objects/EmployeeCode';
import { DateRange } from '@/core/domain/value-objects/DateRange';
import { GetAttendanceRequest, GetAttendanceResponse } from '../../dtos/AttendanceDTO';
import { AttendanceDTOMapper } from '../../mappers/AttendanceDTOMapper';
import { TYPES } from '@/di/types';
import type { ILogger } from '../../ports/ILogger';
import { ValidationError } from '@/core/domain/errors';

@injectable()
export class GetAttendanceData {
  constructor(
    @inject(TYPES.AttendanceRepository) private attendanceRepository: IAttendanceRepository,
    @inject(TYPES.Logger) private logger: ILogger
  ) {}

  async execute(request: GetAttendanceRequest): Promise<GetAttendanceResponse> {
    try {
      this.logger.info('Executing GetAttendanceData use case', {
        employeeCode: request.employeeCode,
        startDate: request.startDate,
        endDate: request.endDate
      });

      // Validate input
      if (!request.employeeCode) {
        throw new ValidationError('Employee code is required');
      }
      if (!request.startDate || !request.endDate) {
        throw new ValidationError('Start date and end date are required');
      }

      // Create value objects
      const employeeCode = EmployeeCode.create(request.employeeCode);
      const dateRange = DateRange.create(
        new Date(request.startDate),
        new Date(request.endDate)
      );

      // Fetch attendance data
      const attendances = await this.attendanceRepository.getByEmployeeCode(
        employeeCode,
        dateRange
      );

      // Convert to DTOs
      const attendanceDTOs = AttendanceDTOMapper.toDTOs(attendances);
      const summary = AttendanceDTOMapper.toSummaryDTO(attendances);

      this.logger.info('Successfully fetched attendance data', {
        employeeCode: request.employeeCode,
        count: attendances.length
      });

      return {
        attendances: attendanceDTOs,
        summary
      };
    } catch (error) {
      this.logger.error('Failed to get attendance data', error as Error, {
        request
      });
      throw error;
    }
  }
}
