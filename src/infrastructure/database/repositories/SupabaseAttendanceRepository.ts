/**
 * Repository Implementation: SupabaseAttendanceRepository
 * Implements IAttendanceRepository using Supabase
 */
import { injectable, inject } from 'inversify';
import { IAttendanceRepository } from '@/core/domain/repositories/IAttendanceRepository';
import { Attendance } from '@/core/domain/entities/Attendance';
import { EmployeeCode } from '@/core/domain/value-objects/EmployeeCode';
import { DateRange } from '@/core/domain/value-objects/DateRange';
import { AttendanceMapper } from '../mappers/AttendanceMapper';
import { supabase } from '../supabase/client';
import { TYPES } from '@/di/types';
import { ILogger } from '@/core/application/ports/ILogger';
import { NotFoundError } from '@/core/domain/errors';

@injectable()
export class SupabaseAttendanceRepository implements IAttendanceRepository {
  constructor(
    @inject(TYPES.Logger) private logger: ILogger
  ) {}

  async getByEmployeeCode(
    employeeCode: EmployeeCode,
    dateRange: DateRange
  ): Promise<Attendance[]> {
    try {
      this.logger.info('Fetching attendance data', {
        employeeCode: employeeCode.value,
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString()
      });

      // Call the RPC function
      const { data, error } = await supabase.rpc('process_attendance_logs', {
        p_employee_code: employeeCode.value,
        p_start_date: dateRange.startDate.toISOString().split('T')[0],
        p_end_date: dateRange.endDate.toISOString().split('T')[0]
      });

      if (error) {
        this.logger.error('Error fetching attendance data', error);
        throw error;
      }

      if (!data) {
        this.logger.warn('No attendance data found', {
          employeeCode: employeeCode.value
        });
        return [];
      }

      // Convert the JSON response to domain entities
      const attendances: Attendance[] = [];
      
      for (const [date, record] of Object.entries(data as Record<string, any>)) {
        try {
          const attendance = AttendanceMapper.toDomain(
            record,
            employeeCode.value
          );
          attendances.push(attendance);
        } catch (error) {
          this.logger.warn('Failed to map attendance record', {
            date,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      this.logger.info('Successfully fetched attendance data', {
        employeeCode: employeeCode.value,
        count: attendances.length
      });

      return attendances;
    } catch (error) {
      this.logger.error('Failed to fetch attendance data', error as Error, {
        employeeCode: employeeCode.value
      });
      throw error;
    }
  }

  async getByDate(
    employeeCode: EmployeeCode,
    date: Date
  ): Promise<Attendance | null> {
    try {
      const dateRange = DateRange.create(date, date);
      const attendances = await this.getByEmployeeCode(employeeCode, dateRange);
      
      return attendances.length > 0 ? attendances[0] : null;
    } catch (error) {
      this.logger.error('Failed to fetch attendance by date', error as Error, {
        employeeCode: employeeCode.value,
        date: date.toISOString()
      });
      throw error;
    }
  }

  async save(attendance: Attendance): Promise<void> {
    try {
      this.logger.info('Saving attendance', {
        employeeCode: attendance.employeeCode.value,
        date: attendance.date.toISOString()
      });

      // Convert to database format
      const record = AttendanceMapper.toDatabase(attendance);

      // In a real implementation, you would save this to a processed_attendance table
      // For now, we'll just log it since we're using the RPC function for reads
      this.logger.info('Attendance saved (mock)', { record });

      // TODO: Implement actual save logic when we have a processed_attendance table
    } catch (error) {
      this.logger.error('Failed to save attendance', error as Error, {
        employeeCode: attendance.employeeCode.value
      });
      throw error;
    }
  }

  subscribeToUpdates(
    employeeCode: EmployeeCode,
    callback: (attendance: Attendance) => void
  ): () => void {
    this.logger.info('Subscribing to attendance updates', {
      employeeCode: employeeCode.value
    });

    // Subscribe to employee_raw_logs changes
    const channel = supabase
      .channel('employee_raw_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employee_raw_logs',
          filter: `employee_code=eq.${employeeCode.value}`
        },
        async (payload) => {
          this.logger.info('Received real-time update', {
            employeeCode: employeeCode.value,
            event: payload.eventType
          });

          // Fetch updated data for the affected date
          if (payload.new && 'log_date' in payload.new) {
            const logDate = new Date(payload.new.log_date as string);
            const attendance = await this.getByDate(employeeCode, logDate);
            
            if (attendance) {
              callback(attendance);
            }
          }
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      this.logger.info('Unsubscribing from attendance updates', {
        employeeCode: employeeCode.value
      });
      supabase.removeChannel(channel);
    };
  }
}
