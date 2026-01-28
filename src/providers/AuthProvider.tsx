import { ReactNode, useState, useEffect } from 'react';
import { AuthContext, AuthContextType } from '@/contexts/AuthContext';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { USER_ROLES } from '@/config/roles';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [employeeCode, setEmployeeCode] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [standaloneEmployeeCode, setStandaloneEmployeeCode] = useState<string | null>(null);
  const [standaloneEmployeeName, setStandaloneEmployeeName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmployeeData(userId: string): Promise<void> {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('employee_code, role, full_name, standalone_attendance')
          .eq('id', userId)
          .single();

        if (profileError) {
          throw new Error(`Failed to fetch profile: ${profileError.message}`);
        }

        if (profile) {
          setEmployeeCode(profile.employee_code);
          setRole(profile.role);
          setIsStandalone(profile.standalone_attendance === 'YES');
          setStandaloneEmployeeCode(profile.employee_code);
          setEmployeeName(profile.full_name);
          setStandaloneEmployeeName(profile.full_name);
        }
      } catch (error) {
        console.error('Fetch employee data error:', error);
      }
    }

    async function initAuth(): Promise<void> {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        setSession(session);
        setUser(session?.user ?? null);

        // If we have a session, fetch real data
        if (session?.user) {
          await fetchEmployeeData(session.user.id);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (event === 'SIGNED_IN' && session?.user) {
        setLoading(true);
        await fetchEmployeeData(session.user.id);
        setLoading(false);
      }

      if (event === 'SIGNED_OUT') {
        clearState();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  function clearState(): void {
    setEmployeeCode(null);
    setEmployeeName(null);
    setRole(null);
    setIsStandalone(false);
    setStandaloneEmployeeCode(null);
    setStandaloneEmployeeName(null);
  }

  async function login(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      clearState();
      if (error) throw error;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async function resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  async function updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }

  function hasPermission(module: string, action: string): boolean {
    if (!role) return false;
    if (role === USER_ROLES.ADMIN || role === USER_ROLES.SUPER_ADMIN) return true;

    // Employee/Operator permissions
    if (role === USER_ROLES.EMPLOYEE || role === USER_ROLES.OPERATOR) {
      if (module === 'attendance' && action === 'view') return true;
      return false;
    }

    return false;
  }

  function canAccessStandaloneAttendance(): boolean {
    return isStandalone;
  }

  function shouldRestrictToOwnData(): boolean {
    return isStandalone || role === USER_ROLES.EMPLOYEE || role === USER_ROLES.OPERATOR;
  }

  const value: AuthContextType = {
    user,
    session,
    employeeCode,
    employeeName,
    role,
    loading,
    isAuthenticated: !!user,
    isStandalone,
    standaloneEmployeeCode,
    standaloneEmployeeName,
    hasPermission,
    canAccessStandaloneAttendance,
    shouldRestrictToOwnData,
    login,
    logout,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
