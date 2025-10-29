/**
 * Repository Interface: IEmployeeRepository
 * Defines the contract for employee data access
 */
import { Employee } from '../entities/Employee';
import { EmployeeCode } from '../value-objects/EmployeeCode';

export interface IEmployeeRepository {
  /**
   * Get employee by code
   */
  getByCode(code: EmployeeCode): Promise<Employee | null>;

  /**
   * Get employee by ID
   */
  getById(id: string): Promise<Employee | null>;

  /**
   * Get all employees
   */
  getAll(): Promise<Employee[]>;

  /**
   * Save employee
   */
  save(employee: Employee): Promise<void>;
}
