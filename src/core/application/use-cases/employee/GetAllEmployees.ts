/**
 * Use Case: GetAllEmployees
 * Fetches all employees
 */
import { injectable, inject } from 'inversify';
import type { IEmployeeRepository } from '@/core/domain/repositories/IEmployeeRepository';
import { GetAllEmployeesResponse } from '../../dtos/EmployeeDTO';
import { EmployeeDTOMapper } from '../../mappers/EmployeeDTOMapper';
import { TYPES } from '@/di/types';
import type { ILogger } from '../../ports/ILogger';

@injectable()
export class GetAllEmployees {
  constructor(
    @inject(TYPES.EmployeeRepository) private employeeRepository: IEmployeeRepository,
    @inject(TYPES.Logger) private logger: ILogger
  ) {}

  async execute(): Promise<GetAllEmployeesResponse> {
    try {
      this.logger.info('Executing GetAllEmployees use case');

      // Fetch all employees
      const employees = await this.employeeRepository.getAll();

      // Convert to DTOs
      const employeeDTOs = EmployeeDTOMapper.toDTOs(employees);

      this.logger.info('Successfully fetched all employees', {
        count: employees.length
      });

      return {
        employees: employeeDTOs
      };
    } catch (error) {
      this.logger.error('Failed to get all employees', error as Error);
      throw error;
    }
  }
}
