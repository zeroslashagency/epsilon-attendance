/**
 * AuthProvider - INSTANT VERSION
 * No delays, loads immediately, fetches data in background
 */
import { ReactNode, useState, useEffect } from 'react';
import { AuthContext, AuthContextType } from '@/contexts/AuthContext';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [employeeCode, setEmployeeCode] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [standaloneEmployeeCode, setStandaloneEmployeeCode] = useState<string | null>(null);
  const [standaloneEmployeeName, setStandaloneEmployeeName] = useState<string | null>(null);

  useEffect(() => {


    // Get session and update data in background (non-blocking)
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();


        setSession(session);
        setUser(session?.user ?? null);

        // If we have a session, fetch real data in background
        if (session?.user) {
          fetchEmployeeDataBackground(session.user.id);
        }
      } catch (error) {

      }
    };

    // Background data fetch (doesn't block UI)
    const fetchEmployeeDataBackground = async (userId: string) => {
      try {


        // OPTIMIZED: Simple query without join (avoids 400 error from FK syntax)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('employee_code, role, full_name, standalone_attendance')
          .eq('id', userId)
          .single();

        // Check for error first
        if (profileError) {

          throw new Error(`Failed to fetch profile: ${profileError.message}`);
        }

        // Check if data exists
        if (!profile) {

          return;
        }


        setEmployeeCode(profile.employee_code);
        setRole(profile.role);
        setIsStandalone(profile.standalone_attendance === 'YES');
        setStandaloneEmployeeCode(profile.employee_code);

        // Use full_name from profile
        const employeeName = profile.full_name;
        if (employeeName) {
          setEmployeeName(employeeName);
          setStandaloneEmployeeName(employeeName);
        }
      } catch (error) {

        // Keep defaults, app still works
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {

      setSession(session);
      setUser(session?.user ?? null);

      // FIX #2: Handle SIGNED_IN event to fetch data after login
      if (event === 'SIGNED_IN' && session?.user) {

        fetchEmployeeDataBackground(session.user.id);
      }

      // FIX #2: Clear data properly on logout
      if (event === 'SIGNED_OUT') {

        setEmployeeCode('1');
        setEmployeeName('Nandhini');
        setRole('Admin');
        setIsStandalone(true);
        setStandaloneEmployeeCode('1');
        setStandaloneEmployeeName('Nandhini');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const logout = async () => {
    try {
      // Clear local state first
      setEmployeeCode('1');
      setEmployeeName('');
      setRole('employee');
      setIsStandalone(false);
      setStandaloneEmployeeCode('');
      setStandaloneEmployeeName('');

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {

        throw error;
      }


    } catch (error) {

      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const hasPermission = (module: string, action: string): boolean => {
    if (!role) return false;
    if (role === 'Admin') return true;

    // Employee/Operator permissions
    if (role === 'Employee' || role === 'Operator') {
      // Can only view their own attendance
      if (module === 'attendance' && action === 'view') return true;
      return false;
    }

    return false;
  };

  const canAccessStandaloneAttendance = (): boolean => {
    return isStandalone;
  };

  const shouldRestrictToOwnData = (): boolean => {
    return isStandalone || role === 'Employee' || role === 'Operator';
  };

  const value: AuthContextType = {
    user,
    session,
    employeeCode,
    employeeName,
    role,
    loading, // Always false for instant load
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
