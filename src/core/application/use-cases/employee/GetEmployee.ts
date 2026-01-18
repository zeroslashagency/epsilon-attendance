/**
 * Use Case: Get Employee
 */
import type { IEmployeeRepository } from '@/core/domain/repositories/IEmployeeRepository';

export class GetEmployee {
    constructor(private employeeRepo: IEmployeeRepository) { }

    async execute(id: string) {
        return this.employeeRepo.getById(id);
    }

    async byCode(code: string) {
        return this.employeeRepo.getByEmployeeCode(code);
    }
}
