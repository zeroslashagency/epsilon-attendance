/**
 * Dependency Injection Container
 * Central registry for all dependencies
 * 
 * NOTE: Using dynamic imports to avoid circular dependencies
 * and ensure proper module loading in Vite
 */
import { Container } from 'inversify';
import 'reflect-metadata';
import { TYPES } from './types';

// Domain
import type { IAttendanceRepository } from '@/core/domain/repositories/IAttendanceRepository';
import type { IEmployeeRepository } from '@/core/domain/repositories/IEmployeeRepository';

// Application Ports
import type { ILogger } from '@/core/application/ports/ILogger';
import type { INotificationService } from '@/core/application/ports/INotificationService';

const container = new Container();

// Lazy initialization flag
let isInitialized = false;

/**
 * Initialize container with all bindings
 * Called lazily on first use
 */
async function initializeContainer() {
  if (isInitialized) return;

  // Dynamic imports to avoid issues with Vite dev server
  const { SupabaseAttendanceRepository } = await import('@/infrastructure/database/repositories/SupabaseAttendanceRepository');
  const { SupabaseEmployeeRepository } = await import('@/infrastructure/database/repositories/SupabaseEmployeeRepository');
  const { ConsoleLogger } = await import('@/infrastructure/services/ConsoleLogger');
  const { ToastNotificationService } = await import('@/infrastructure/services/ToastNotificationService');
  const { GetAttendanceData } = await import('@/core/application/use-cases/attendance/GetAttendanceData');
  const { RefreshAttendance } = await import('@/core/application/use-cases/attendance/RefreshAttendance');
  const { GetEmployee } = await import('@/core/application/use-cases/employee/GetEmployee');
  const { GetAllEmployees } = await import('@/core/application/use-cases/employee/GetAllEmployees');

  // Bind Repositories
  container.bind<IAttendanceRepository>(TYPES.AttendanceRepository)
    .to(SupabaseAttendanceRepository)
    .inSingletonScope();

  container.bind<IEmployeeRepository>(TYPES.EmployeeRepository)
    .to(SupabaseEmployeeRepository)
    .inSingletonScope();

  // Bind Services
  container.bind<ILogger>(TYPES.Logger)
    .to(ConsoleLogger)
    .inSingletonScope();

  container.bind<INotificationService>(TYPES.NotificationService)
    .to(ToastNotificationService)
    .inSingletonScope();

  // Bind Use Cases
  container.bind(TYPES.GetAttendanceData)
    .to(GetAttendanceData)
    .inTransientScope();

  container.bind(TYPES.RefreshAttendance)
    .to(RefreshAttendance)
    .inTransientScope();

  container.bind(TYPES.GetEmployee)
    .to(GetEmployee)
    .inTransientScope();

  container.bind(TYPES.GetAllEmployees)
    .to(GetAllEmployees)
    .inTransientScope();

  isInitialized = true;
}

// Initialize immediately (but async)
initializeContainer().catch(console.error);

export { container, TYPES, initializeContainer };
