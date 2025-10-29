# Database Schema Documentation

**Last Updated:** October 18, 2025  
**Status:** ✅ STANDARDIZED

---

## Employee Data - Source of Truth

### Primary Tables

#### 1. `profiles` Table
**Purpose:** User authentication and basic employee info  
**Usage:** AuthProvider, user management  
**Key Columns:**
- `id` (uuid) - Auth user ID
- `email` (text) - User email
- `employee_code` (text) - Links to employee_master
- `role` (text) - Admin, Employee, Operator
- `standalone_attendance` (text) - 'YES' or 'NO'

**Used By:**
- `src/providers/AuthProvider.tsx`
- All authentication flows

---

#### 2. `employee_master` Table
**Purpose:** Complete employee information  
**Usage:** Employee details, name lookup  
**Key Columns:**
- `employee_code` (text) - Primary identifier
- `employee_name` (text) - Full name
- Additional employee details

**Used By:**
- `src/providers/AuthProvider.tsx` (name lookup)
- Clean Architecture repositories

**⚠️ Note:** This is the ONLY employee master table to use. Do not use `employee_master_simple`.

---

#### 3. `employee_raw_logs` Table
**Purpose:** Attendance punch logs  
**Usage:** Attendance tracking, reports  
**Key Columns:**
- `id` (bigint) - Auto-increment
- `employee_code` (text) - Links to employee_master
- `log_date` (timestamp) - Punch time
- `punch_direction` (text) - 'in' or 'out'
- `sync_time` (timestamp) - When synced

**Used By:**
- `src/hooks/useAttendanceData.ts`
- Attendance pages
- Reports

---

## Deprecated/Unused Tables

### ❌ `employee_auth_mapping`
**Status:** DEPRECATED - Do not use  
**Reason:** Redundant with `profiles.employee_code`  
**Alternative:** Use `profiles` table directly

### ❌ `employee_master_simple`
**Status:** DEPRECATED - Do not use  
**Reason:** Duplicate of `employee_master`  
**Alternative:** Use `employee_master` table

---

## Data Flow

### Authentication Flow
```
User Login
    ↓
Supabase Auth (auth.users)
    ↓
profiles table (get employee_code, role)
    ↓
employee_master table (get employee_name)
    ↓
AuthContext (provide to app)
```

### Attendance Data Flow
```
Device/Manual Entry
    ↓
employee_raw_logs table (punch in/out)
    ↓
useAttendanceData hook (fetch & process)
    ↓
Attendance Pages (display)
```

---

## Table Relationships

```
auth.users (Supabase Auth)
    ↓ (id)
profiles
    ↓ (employee_code)
employee_master
    ↓ (employee_code)
employee_raw_logs
```

---

## Standardization Rules

### ✅ DO
- Use `profiles` for auth and employee_code lookup
- Use `employee_master` for employee details
- Use `employee_raw_logs` for attendance data
- Always join via `employee_code`

### ❌ DON'T
- Don't use `employee_auth_mapping`
- Don't use `employee_master_simple`
- Don't create duplicate employee tables
- Don't store employee data in multiple places

---

## Migration Notes

### If You Need to Clean Up Old Tables

```sql
-- Backup first (if needed)
CREATE TABLE employee_auth_mapping_backup AS 
SELECT * FROM employee_auth_mapping;

CREATE TABLE employee_master_simple_backup AS 
SELECT * FROM employee_master_simple;

-- Then drop (only if confirmed unused)
DROP TABLE employee_auth_mapping;
DROP TABLE employee_master_simple;
```

**⚠️ Warning:** Only drop tables after confirming no external services use them.

---

## Query Examples

### Get Employee Info
```typescript
// Get employee from profiles
const { data: profile } = await supabase
  .from('profiles')
  .select('employee_code, role, standalone_attendance')
  .eq('id', userId)
  .single();

// Get employee name
const { data: employee } = await supabase
  .from('employee_master')
  .select('employee_name')
  .eq('employee_code', profile.employee_code)
  .single();
```

### Get Attendance Data
```typescript
const { data: logs } = await supabase
  .from('employee_raw_logs')
  .select('*')
  .eq('employee_code', employeeCode)
  .order('log_date', { ascending: false })
  .limit(1000);
```

---

## Questions?

If you're unsure which table to use:
1. **Auth/User data** → `profiles`
2. **Employee details** → `employee_master`
3. **Attendance logs** → `employee_raw_logs`

**Never use deprecated tables!**
