/**
 * Use Case: GetEmployee
 * Fetches employee details by employee code
 */
import { injectable, inject } from 'inversify';
import type { IEmployeeRepository } from '@/core/domain/repositories/IEmployeeRepository';
import { EmployeeCode } from '@/core/domain/value-objects/EmployeeCode';
import { GetEmployeeRequest, GetEmployeeResponse } from '../../dtos/EmployeeDTO';
import { EmployeeDTOMapper } from '../../mappers/EmployeeDTOMapper';
import { TYPES } from '@/di/types';
import type { ILogger } from '../../ports/ILogger';
import { NotFoundError, ValidationError } from '@/core/domain/errors';

@injectable()
export class GetEmployee {
  constructor(
    @inject(TYPES.EmployeeRepository) private employeeRepository: IEmployeeRepository,
    @inject(TYPES.Logger) private logger: ILogger
  ) {}

  async execute(request: GetEmployeeRequest): Promise<GetEmployeeResponse> {
    try {
      this.logger.info('Executing GetEmployee use case', {
        employeeCode: request.employeeCode
      });

      // Validate input
      if (!request.employeeCode) {
        throw new ValidationError('Employee code is required');
      }

      // Create value object
      const employeeCode = EmployeeCode.create(request.employeeCode);

      // Fetch employee
      const employee = await this.employeeRepository.getByCode(employeeCode);

      if (!employee) {
        throw new NotFoundError('Employee', request.employeeCode);
      }

      // Convert to DTO
      const employeeDTO = EmployeeDTOMapper.toDTO(employee);

      this.logger.info('Successfully fetched employee', {
        employeeCode: request.employeeCode
      });

      return {
        employee: employeeDTO
      };
    } catch (error) {
      this.logger.error('Failed to get employee', error as Error, {
        request
      });
      throw error;
    }
  }
}
