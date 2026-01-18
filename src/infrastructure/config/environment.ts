/**
 * Environment Configuration
 * Centralized environment variable access
 */
export const environment = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  },
  app: {
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    mode: import.meta.env.MODE
  }
};

// Runtime validation - fail fast if credentials are missing
if (!environment.supabase.url || !environment.supabase.anonKey) {
  throw new Error(
    'Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set'
  );
}
