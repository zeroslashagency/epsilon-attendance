import { createClient } from '@supabase/supabase-js'

// Environment variables - these should be set in .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      employee_master: {
        Row: {
          id: number
          employee_code: string
          employee_name: string
          department: string | null
          designation: string | null
          location: string | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          employee_code: string
          employee_name: string
          department?: string | null
          designation?: string | null
          location?: string | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          employee_code?: string
          employee_name?: string
          department?: string | null
          designation?: string | null
          location?: string | null
          status?: string | null
          created_at?: string | null
        }
      }
      employee_attendance_logs: {
        Row: {
          id: number
          employee_code: string
          employee_name: string | null
          log_date: string
          punch_direction: string
          serial_number: string | null
          temperature: number | null
          temperature_state: string | null
          device_location: string | null
          sync_timestamp: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          employee_code: string
          employee_name?: string | null
          log_date: string
          punch_direction: string
          serial_number?: string | null
          temperature?: number | null
          temperature_state?: string | null
          device_location?: string | null
          sync_timestamp?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          employee_code?: string
          employee_name?: string | null
          log_date?: string
          punch_direction?: string
          serial_number?: string | null
          temperature?: number | null
          temperature_state?: string | null
          device_location?: string | null
          sync_timestamp?: string | null
          created_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
          role: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          role?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          role?: string | null
        }
      }
    }
  }
}
