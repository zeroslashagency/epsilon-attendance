/**
 * Supabase Attendance Repository Implementation
 * Implements IAttendanceRepository using Supabase
 */
import {
    IAttendanceRepository,
    AttendanceRecord,
    AttendanceFilter
} from '@/core/domain/repositories/IAttendanceRepository';
import { supabase } from '@/lib/supabase';

type AttendanceRow = {
    id: string;
    employee_id: string;
    date: string;
    check_in: string | null;
    check_out: string | null;
    status: string;
    created_at: string;
    updated_at: string;
};

export class SupabaseAttendanceRepository implements IAttendanceRepository {
    private tableName = 'attendance_logs';
    private static mapToRecord(data: AttendanceRow): AttendanceRecord {
        return {
            id: data.id,
            employeeId: data.employee_id,
            date: data.date,
            checkIn: data.check_in,
            checkOut: data.check_out,
            status: data.status,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }

    async getById(id: string): Promise<AttendanceRecord | null> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;
        return SupabaseAttendanceRepository.mapToRecord(data as AttendanceRow);
    }

    async getAll(filter?: AttendanceFilter): Promise<AttendanceRecord[]> {
        let query = supabase.from(this.tableName).select('*');

        if (filter?.startDate) {
            query = query.gte('date', filter.startDate);
        }
        if (filter?.endDate) {
            query = query.lte('date', filter.endDate);
        }
        if (filter?.employeeId) {
            query = query.eq('employee_id', filter.employeeId);
        }
        if (filter?.status) {
            query = query.eq('status', filter.status);
        }

        const { data, error } = await query.order('date', { ascending: false });

        if (error || !data) return [];
        return (data as AttendanceRow[]).map(SupabaseAttendanceRepository.mapToRecord);
    }

    async getByEmployeeId(employeeId: string, filter?: AttendanceFilter): Promise<AttendanceRecord[]> {
        return this.getAll({ ...filter, employeeId });
    }

    async create(record: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<AttendanceRecord> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                employee_id: record.employeeId,
                date: record.date,
                check_in: record.checkIn,
                check_out: record.checkOut,
                status: record.status,
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create attendance: ${error.message}`);
        return SupabaseAttendanceRepository.mapToRecord(data as AttendanceRow);
    }

    async update(id: string, record: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
        const { data, error } = await supabase
            .from(this.tableName)
            .update({
                ...(record.checkIn && { check_in: record.checkIn }),
                ...(record.checkOut && { check_out: record.checkOut }),
                ...(record.status && { status: record.status }),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update attendance: ${error.message}`);
        return SupabaseAttendanceRepository.mapToRecord(data as AttendanceRow);
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete attendance: ${error.message}`);
    }

}
