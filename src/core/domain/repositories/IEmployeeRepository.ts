/**
 * Employee Repository Interface
 * Domain repository for employee operations
 */
export interface Employee {
    id: string;
    employeeCode: string;
    fullName: string;
    email?: string;
    department?: string;
    role?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface EmployeeFilter {
    department?: string;
    role?: string;
    isActive?: boolean;
    search?: string;
}

export interface IEmployeeRepository {
    getById(id: string): Promise<Employee | null>;
    getByEmployeeCode(code: string): Promise<Employee | null>;
    getAll(filter?: EmployeeFilter): Promise<Employee[]>;
    create(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee>;
    update(id: string, employee: Partial<Employee>): Promise<Employee>;
    delete(id: string): Promise<void>;
}
