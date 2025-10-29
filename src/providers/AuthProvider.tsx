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
  const [loading, setLoading] = useState(false); // Start with false for instant load
  const [employeeCode, setEmployeeCode] = useState<string | null>('1'); // Default to your code
  const [employeeName, setEmployeeName] = useState<string | null>('Nandhini'); // Default to your name
  const [role, setRole] = useState<string | null>('Admin'); // Default role
  const [isStandalone, setIsStandalone] = useState(true); // Default standalone
  const [standaloneEmployeeCode, setStandaloneEmployeeCode] = useState<string | null>('1');
  const [standaloneEmployeeName, setStandaloneEmployeeName] = useState<string | null>('Nandhini');

  useEffect(() => {
    console.log('AuthProvider: INSTANT version starting');
    
    // Get session and update data in background (non-blocking)
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session found:', session?.user?.email || 'No session');
        
        setSession(session);
        setUser(session?.user ?? null);

        // If we have a session, fetch real data in background
        if (session?.user) {
          fetchEmployeeDataBackground(session.user.id);
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };

    // Background data fetch (doesn't block UI)
    const fetchEmployeeDataBackground = async (userId: string) => {
      try {
        console.log('Background: Fetching real employee data');
        
        // FIX #1: Add error validation for profiles query
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('employee_code, role, full_name, standalone_attendance')
          .eq('id', userId)
          .single();

        // Check for error first
        if (profileError) {
          console.error('Profile fetch error:', profileError.message);
          throw new Error(`Failed to fetch profile: ${profileError.message}`);
        }

        // Check if data exists
        if (!profile) {
          console.warn('No profile data found for user:', userId);
          return;
        }

        console.log('Background: Profile found', profile);
        setEmployeeCode(profile.employee_code);
        setRole(profile.role);
        setIsStandalone(profile.standalone_attendance === 'YES');
        setStandaloneEmployeeCode(profile.employee_code);

        // Get real employee name
        // FIX #1: Add error validation for employee_master query
        const { data: employee, error: employeeError } = await supabase
          .from('employee_master')
          .select('employee_name')
          .eq('employee_code', profile.employee_code)
          .single();

        // Check for error
        if (employeeError) {
          console.warn('Employee master fetch error:', employeeError.message);
          // Not critical - continue with profile full_name
        } else if (employee?.employee_name) {
          console.log('Background: Real name found:', employee.employee_name);
          setEmployeeName(employee.employee_name);
          setStandaloneEmployeeName(employee.employee_name);
        }
      } catch (error) {
        console.error('Background fetch failed:', error);
        // Keep defaults, app still works
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth change:', event);
      setSession(session);
      setUser(session?.user ?? null);
      
      // FIX #2: Handle SIGNED_IN event to fetch data after login
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in - fetching employee data');
        fetchEmployeeDataBackground(session.user.id);
      }
      
      // FIX #2: Clear data properly on logout
      if (event === 'SIGNED_OUT') {
        console.log('User signed out - clearing data');
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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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

  console.log('AuthProvider: Rendering instantly with loading =', loading);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
