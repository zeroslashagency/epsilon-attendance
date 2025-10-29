/**
 * Repository Implementation: SupabaseEmployeeRepository
 * Implements IEmployeeRepository using Supabase
 */
import { injectable, inject } from 'inversify';
import { IEmployeeRepository } from '@/core/domain/repositories/IEmployeeRepository';
import { Employee } from '@/core/domain/entities/Employee';
import { EmployeeCode } from '@/core/domain/value-objects/EmployeeCode';
import { EmployeeMapper } from '../mappers/EmployeeMapper';
import { supabase } from '../supabase/client';
import { TYPES } from '@/di/types';
import { ILogger } from '@/core/application/ports/ILogger';
import { NotFoundError } from '@/core/domain/errors';

@injectable()
export class SupabaseEmployeeRepository implements IEmployeeRepository {
  constructor(
    @inject(TYPES.Logger) private logger: ILogger
  ) {}

  async getByCode(code: EmployeeCode): Promise<Employee | null> {
    try {
      this.logger.info('Fetching employee by code', {
        employeeCode: code.value
      });

      const { data, error } = await supabase
        .from('employee_master_simple')
        .select('*')
        .eq('employee_code', code.value)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          this.logger.warn('Employee not found', { employeeCode: code.value });
          return null;
        }
        throw error;
      }

      if (!data) {
        return null;
      }

      const employee = EmployeeMapper.toDomain({
        id: data.id?.toString() || data.employee_code,
        employee_code: data.employee_code,
        employee_name: data.employee_name,
        email: data.email,
        role: data.role,
        department: data.department,
        designation: data.designation,
        phone: data.phone,
        join_date: data.join_date,
        location: data.location
      });

      this.logger.info('Successfully fetched employee', {
        employeeCode: code.value
      });

      return employee;
    } catch (error) {
      this.logger.error('Failed to fetch employee by code', error as Error, {
        employeeCode: code.value
      });
      throw error;
    }
  }

  async getById(id: string): Promise<Employee | null> {
    try {
      this.logger.info('Fetching employee by ID', { id });

      const { data, error } = await supabase
        .from('employee_master_simple')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          this.logger.warn('Employee not found', { id });
          return null;
        }
        throw error;
      }

      if (!data) {
        return null;
      }

      const employee = EmployeeMapper.toDomain({
        id: data.id?.toString() || data.employee_code,
        employee_code: data.employee_code,
        employee_name: data.employee_name,
        email: data.email,
        role: data.role,
        department: data.department,
        designation: data.designation,
        phone: data.phone,
        join_date: data.join_date,
        location: data.location
      });

      this.logger.info('Successfully fetched employee', { id });

      return employee;
    } catch (error) {
      this.logger.error('Failed to fetch employee by ID', error as Error, { id });
      throw error;
    }
  }

  async getAll(): Promise<Employee[]> {
    try {
      this.logger.info('Fetching all employees');

      const { data, error } = await supabase
        .from('employee_master_simple')
        .select('*')
        .order('employee_name');

      if (error) {
        throw error;
      }

      if (!data) {
        return [];
      }

      const employees = data.map(record =>
        EmployeeMapper.toDomain({
          id: record.id?.toString() || record.employee_code,
          employee_code: record.employee_code,
          employee_name: record.employee_name,
          email: record.email,
          role: record.role,
          department: record.department,
          designation: record.designation,
          phone: record.phone,
          join_date: record.join_date,
          location: record.location
        })
      );

      this.logger.info('Successfully fetched all employees', {
        count: employees.length
      });

      return employees;
    } catch (error) {
      this.logger.error('Failed to fetch all employees', error as Error);
      throw error;
    }
  }

  async save(employee: Employee): Promise<void> {
    try {
      this.logger.info('Saving employee', {
        employeeCode: employee.code.value
      });

      const record = EmployeeMapper.toDatabase(employee);

      const { error } = await supabase
        .from('employee_master_simple')
        .upsert(record);

      if (error) {
        throw error;
      }

      this.logger.info('Successfully saved employee', {
        employeeCode: employee.code.value
      });
    } catch (error) {
      this.logger.error('Failed to save employee', error as Error, {
        employeeCode: employee.code.value
      });
      throw error;
    }
  }
}
