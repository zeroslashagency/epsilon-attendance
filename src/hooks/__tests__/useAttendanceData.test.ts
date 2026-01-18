/**
 * Unit tests for useAttendanceData hook
 * 
 * Tests the core attendance data fetching and processing logic.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAttendanceData } from '../useAttendanceData';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    order: vi.fn(() => ({
                        limit: vi.fn(() => Promise.resolve({
                            data: [
                                {
                                    id: '1',
                                    employee_code: 'EMP001',
                                    log_date: '2024-01-15 09:00:00',
                                    punch_direction: 'in',
                                    sync_time: '2024-01-15 09:00:05',
                                },
                                {
                                    id: '2',
                                    employee_code: 'EMP001',
                                    log_date: '2024-01-15 18:00:00',
                                    punch_direction: 'out',
                                    sync_time: '2024-01-15 18:00:05',
                                },
                            ],
                            error: null,
                        })),
                    })),
                })),
            })),
        })),
        rpc: vi.fn(() => Promise.resolve({ data: null, error: { code: '42883' } })),
        channel: vi.fn(() => ({
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn(),
        })),
        removeChannel: vi.fn(),
    },
}));

describe('useAttendanceData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with loading state', () => {
        const { result } = renderHook(() =>
            useAttendanceData({ employeeCode: 'EMP001' })
        );

        expect(result.current.isLoading).toBe(true);
        expect(result.current.attendanceData).toEqual({});
        expect(result.current.error).toBeNull();
    });

    it('should set error when no employee code provided', async () => {
        const { result } = renderHook(() =>
            useAttendanceData({ employeeCode: null as unknown as string })
        );

        await waitFor(() => {
            expect(result.current.error).toBe('No employee code provided');
        });
    });

    it('should fetch attendance data for valid employee', async () => {
        const { result } = renderHook(() =>
            useAttendanceData({ employeeCode: 'EMP001' })
        );

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        // Verify data was processed
        expect(result.current.error).toBeNull();
    });

    it('should support manual refresh', async () => {
        const { result } = renderHook(() =>
            useAttendanceData({ employeeCode: 'EMP001' })
        );

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        // Trigger refresh
        await act(async () => {
            await result.current.refresh();
        });

        expect(result.current.lastUpdate).toBeDefined();
    });

    it('should validate employee code format', async () => {
        const { result } = renderHook(() =>
            useAttendanceData({ employeeCode: '!invalid!' })
        );

        await waitFor(() => {
            expect(result.current.error).toContain('Invalid employee code');
        });
    });
});
