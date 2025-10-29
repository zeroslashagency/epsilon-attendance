/**
 * Mapper: EmployeeMapper
 * Converts between database records and Employee entities
 */
import { Employee } from '@/core/domain/entities/Employee';
import { EmployeeCode } from '@/core/domain/value-objects/EmployeeCode';

interface DatabaseEmployeeRecord {
  id: string;
  employee_code: string;
  employee_name: string;
  email?: string;
  role?: string;
  department?: string;
  designation?: string;
  phone?: string;
  join_date?: string;
  location?: string;
}

export class EmployeeMapper {
  /**
   * Convert database record to domain entity
   */
  static toDomain(record: DatabaseEmployeeRecord): Employee {
    return new Employee(
      record.id,
      EmployeeCode.create(record.employee_code),
      record.employee_name,
      record.email || `${record.employee_code}@company.com`,
      record.role || 'employee',
      record.department,
      record.designation,
      record.phone,
      record.join_date ? new Date(record.join_date) : undefined,
      record.location
    );
  }

  /**
   * Convert domain entity to database record
   */
  static toDatabase(employee: Employee): Partial<DatabaseEmployeeRecord> {
    return {
      id: employee.id,
      employee_code: employee.code.value,
      employee_name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      designation: employee.designation,
      phone: employee.phone,
      join_date: employee.joinDate?.toISOString().split('T')[0],
      location: employee.location
    };
  }
}
