/**
 * Use Case: Get All Employees
 */
import type { IEmployeeRepository, EmployeeFilter } from '@/core/domain/repositories/IEmployeeRepository';

export class GetAllEmployees {
    constructor(private employeeRepo: IEmployeeRepository) { }

    async execute(filter?: EmployeeFilter) {
        return this.employeeRepo.getAll(filter);
    }
}
