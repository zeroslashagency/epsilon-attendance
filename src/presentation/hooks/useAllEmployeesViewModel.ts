/**
 * View Model Hook: useAllEmployeesViewModel
 * Connects UI to GetAllEmployees use case
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { container } from '@/di/container';
import { TYPES } from '@/di/types';
import { GetAllEmployees } from '@/core/application/use-cases/employee/GetAllEmployees';
import type { EmployeeDTO } from '@/core/application/dtos/EmployeeDTO';

interface UseAllEmployeesViewModelResult {
  employees: EmployeeDTO[];
  isLoading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

export function useAllEmployeesViewModel(): UseAllEmployeesViewModelResult {
  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get use case from DI container
  const getAllEmployees = useMemo(
    () => container.get<GetAllEmployees>(TYPES.GetAllEmployees),
    []
  );

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getAllEmployees.execute();
      setEmployees(result.employees);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch employees:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getAllEmployees]);

  const reload = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    employees,
    isLoading,
    error,
    reload
  };
}
