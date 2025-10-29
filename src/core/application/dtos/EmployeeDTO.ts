/**
 * Data Transfer Object: EmployeeDTO
 * Used for transferring employee data between layers
 */

export interface EmployeeDTO {
  id: string;
  code: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  designation?: string;
  phone?: string;
  joinDate?: string;
  location?: string;
  initials: string;
}

export interface GetEmployeeRequest {
  employeeCode: string;
}

export interface GetEmployeeResponse {
  employee: EmployeeDTO;
}

export interface GetAllEmployeesResponse {
  employees: EmployeeDTO[];
}
