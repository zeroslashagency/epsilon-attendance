/**
 * Supabase Employee Repository Implementation
 * Implements IEmployeeRepository using Supabase
 */
import {
    IEmployeeRepository,
    Employee,
    EmployeeFilter
} from '@/core/domain/repositories/IEmployeeRepository';
import { supabase } from '@/lib/supabase';

export class SupabaseEmployeeRepository implements IEmployeeRepository {
    private tableName = 'employee_master';

    async getById(id: string): Promise<Employee | null> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;
        return this.mapToEmployee(data);
    }

    async getByEmployeeCode(code: string): Promise<Employee | null> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('employee_code', code)
            .single();

        if (error || !data) return null;
        return this.mapToEmployee(data);
    }

    async getAll(filter?: EmployeeFilter): Promise<Employee[]> {
        let query = supabase.from(this.tableName).select('*');

        if (filter?.department) {
            query = query.eq('department', filter.department);
        }
        if (filter?.role) {
            query = query.eq('role', filter.role);
        }
        if (filter?.isActive !== undefined) {
            query = query.eq('is_active', filter.isActive);
        }
        if (filter?.search) {
            query = query.or(`full_name.ilike.%${filter.search}%,employee_code.ilike.%${filter.search}%`);
        }

        const { data, error } = await query.order('full_name', { ascending: true });

        if (error || !data) return [];
        return data.map(this.mapToEmployee);
    }

    async create(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                employee_code: employee.employeeCode,
                full_name: employee.fullName,
                email: employee.email,
                department: employee.department,
                role: employee.role,
                is_active: employee.isActive,
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create employee: ${error.message}`);
        return this.mapToEmployee(data);
    }

    async update(id: string, employee: Partial<Employee>): Promise<Employee> {
        const { data, error } = await supabase
            .from(this.tableName)
            .update({
                ...(employee.fullName && { full_name: employee.fullName }),
                ...(employee.email && { email: employee.email }),
                ...(employee.department && { department: employee.department }),
                ...(employee.role && { role: employee.role }),
                ...(employee.isActive !== undefined && { is_active: employee.isActive }),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update employee: ${error.message}`);
        return this.mapToEmployee(data);
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete employee: ${error.message}`);
    }

    private mapToEmployee(data: any): Employee {
        return {
            id: data.id,
            employeeCode: data.employee_code,
            fullName: data.full_name,
            email: data.email,
            department: data.department,
            role: data.role,
            isActive: data.is_active,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }
}
