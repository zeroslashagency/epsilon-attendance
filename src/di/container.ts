/**
 * Simple Dependency Injection Container
 * Factory-based pattern (no decorators needed)
 */
import { TYPES } from './types';

// Interfaces
import type { ILogger } from '@/core/application/ports/ILogger';
import type { INotificationService } from '@/core/application/ports/INotificationService';
import type { IAttendanceRepository } from '@/core/domain/repositories/IAttendanceRepository';
import type { IEmployeeRepository } from '@/core/domain/repositories/IEmployeeRepository';

// Singleton storage
const singletons = new Map<symbol, any>();
let isInitialized = false;

// Factory functions (lazy loaded)
const factories: Record<symbol, () => Promise<any>> = {};

/**
 * Register factory functions for all dependencies
 */
async function registerFactories() {
  // Logger
  factories[TYPES.Logger] = async () => {
    const { ConsoleLogger } = await import('@/infrastructure/services/ConsoleLogger');
    return new ConsoleLogger();
  };

  // Notification Service
  factories[TYPES.NotificationService] = async () => {
    const { ToastNotificationService } = await import('@/infrastructure/services/ToastNotificationService');
    return new ToastNotificationService();
  };

  // Repositories
  factories[TYPES.AttendanceRepository] = async () => {
    const { SupabaseAttendanceRepository } = await import('@/infrastructure/database/repositories/SupabaseAttendanceRepository');
    return new SupabaseAttendanceRepository();
  };

  factories[TYPES.EmployeeRepository] = async () => {
    const { SupabaseEmployeeRepository } = await import('@/infrastructure/database/repositories/SupabaseEmployeeRepository');
    return new SupabaseEmployeeRepository();
  };

  // Use Cases
  factories[TYPES.GetAttendanceData] = async () => {
    const { GetAttendanceData } = await import('@/core/application/use-cases/attendance/GetAttendanceData');
    const repo = await resolve<IAttendanceRepository>(TYPES.AttendanceRepository);
    return new GetAttendanceData(repo);
  };

  factories[TYPES.RefreshAttendance] = async () => {
    const { RefreshAttendance } = await import('@/core/application/use-cases/attendance/RefreshAttendance');
    const repo = await resolve<IAttendanceRepository>(TYPES.AttendanceRepository);
    const logger = await resolve<ILogger>(TYPES.Logger);
    return new RefreshAttendance(repo, logger);
  };

  factories[TYPES.GetEmployee] = async () => {
    const { GetEmployee } = await import('@/core/application/use-cases/employee/GetEmployee');
    const repo = await resolve<IEmployeeRepository>(TYPES.EmployeeRepository);
    return new GetEmployee(repo);
  };

  factories[TYPES.GetAllEmployees] = async () => {
    const { GetAllEmployees } = await import('@/core/application/use-cases/employee/GetAllEmployees');
    const repo = await resolve<IEmployeeRepository>(TYPES.EmployeeRepository);
    return new GetAllEmployees(repo);
  };
}

/**
 * Resolve a dependency by type
 */
async function resolve<T>(type: symbol): Promise<T> {
  // Check if already created (singleton)
  if (singletons.has(type)) {
    return singletons.get(type) as T;
  }

  // Create new instance
  const factory = factories[type];
  if (!factory) {
    throw new Error(`No factory registered for ${type.toString()}`);
  }

  const instance = await factory();
  singletons.set(type, instance);
  return instance as T;
}

/**
 * Initialize container
 */
async function initializeContainer() {
  if (isInitialized) return;
  await registerFactories();
  isInitialized = true;
}

// Simple container API
const container = {
  resolve,
  isInitialized: () => isInitialized,
};

// Initialize immediately
initializeContainer().catch(console.error);

export { container, TYPES, initializeContainer, resolve };
