/**
 * Attendance Repository Interface
 * Domain repository for attendance operations
 */
export interface AttendanceRecord {
    id: string;
    employeeId: string;
    date: string;
    checkIn?: string;
    checkOut?: string;
    status: 'present' | 'absent' | 'late' | 'half-day' | 'leave';
    createdAt: string;
    updatedAt: string;
}

export interface AttendanceFilter {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
    status?: AttendanceRecord['status'];
}

export interface IAttendanceRepository {
    getById(id: string): Promise<AttendanceRecord | null>;
    getAll(filter?: AttendanceFilter): Promise<AttendanceRecord[]>;
    getByEmployeeId(employeeId: string, filter?: AttendanceFilter): Promise<AttendanceRecord[]>;
    create(record: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<AttendanceRecord>;
    update(id: string, record: Partial<AttendanceRecord>): Promise<AttendanceRecord>;
    delete(id: string): Promise<void>;
}
