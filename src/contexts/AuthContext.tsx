import { createContext } from 'react';
import { User, Session } from '@supabase/supabase-js';

/**
 * @interface AuthContextType
 * @description Defines the shape of the authentication context provided to the application.
 * This includes user session, employee details, roles, and authentication-related functions.
 */
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  employeeCode: string | null;
  employeeName: string | null;
  role: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isStandalone: boolean;
  standaloneEmployeeCode: string | null;
  standaloneEmployeeName: string | null;
  hasPermission: (module: string, action: string) => boolean;
  canAccessStandaloneAttendance: () => boolean;
  shouldRestrictToOwnData: () => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

/**
 * @name AuthContext
 * @description The React context for accessing authentication state and functions.
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
