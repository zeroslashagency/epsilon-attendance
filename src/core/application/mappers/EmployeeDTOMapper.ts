/**
 * Mapper: EmployeeDTOMapper
 * Converts between Employee entities and DTOs
 */
import { Employee } from '@/core/domain/entities/Employee';
import { EmployeeDTO } from '../dtos/EmployeeDTO';

export class EmployeeDTOMapper {
  /**
   * Convert domain entity to DTO
   */
  static toDTO(employee: Employee): EmployeeDTO {
    return {
      id: employee.id,
      code: employee.code.value,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      designation: employee.designation,
      phone: employee.phone,
      joinDate: employee.joinDate?.toISOString().split('T')[0],
      location: employee.location,
      initials: employee.getInitials()
    };
  }

  /**
   * Convert multiple domain entities to DTOs
   */
  static toDTOs(employees: Employee[]): EmployeeDTO[] {
    return employees.map(e => this.toDTO(e));
  }
}
