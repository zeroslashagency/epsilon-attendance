/**
 * View Model Hook: useEmployeeViewModel
 * Connects UI to GetEmployee use case
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { container } from '@/di/container';
import { TYPES } from '@/di/types';
import { GetEmployee } from '@/core/application/use-cases/employee/GetEmployee';
import type { EmployeeDTO } from '@/core/application/dtos/EmployeeDTO';

interface UseEmployeeViewModelProps {
  employeeCode: string;
}

interface UseEmployeeViewModelResult {
  employee: EmployeeDTO | null;
  isLoading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

export function useEmployeeViewModel({
  employeeCode
}: UseEmployeeViewModelProps): UseEmployeeViewModelResult {
  const [employee, setEmployee] = useState<EmployeeDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get use case from DI container
  const getEmployee = useMemo(
    () => container.get<GetEmployee>(TYPES.GetEmployee),
    []
  );

  const fetchData = useCallback(async () => {
    if (!employeeCode) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await getEmployee.execute({ employeeCode });
      setEmployee(result.employee);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch employee:', err);
    } finally {
      setIsLoading(false);
    }
  }, [employeeCode, getEmployee]);

  const reload = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    employee,
    isLoading,
    error,
    reload
  };
}
