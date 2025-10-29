-- supabase/migrations/002_rls_policies.sql

-- 1. Enable RLS on all relevant tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_auth_mapping ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policy for 'profiles'
-- Users can only see and edit their own profile.
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. RLS Policy for 'employee_master'
-- Allow public read access as employee details are not highly sensitive
-- and are needed for various lookups. For stricter security, this could be restricted.
DROP POLICY IF EXISTS "Allow public read access on employee_master" ON public.employee_master;
CREATE POLICY "Allow public read access on employee_master" ON public.employee_master
  FOR SELECT USING (true);

-- 4. RLS Policy for 'employee_auth_mapping'
-- Users can only see their own mapping.
DROP POLICY IF EXISTS "Users can view their own auth mapping" ON public.employee_auth_mapping;
CREATE POLICY "Users can view their own auth mapping" ON public.employee_auth_mapping
  FOR SELECT USING (auth.uid() = auth_user_id);
