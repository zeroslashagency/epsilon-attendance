# Security Policy

## Reporting Security Issues

If you discover a security vulnerability, please email security@epsilon-attendance.com instead of using the issue tracker.

## Environment Variables

This project uses environment variables for sensitive configuration:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

**Important:**
- Never commit `.env` files to version control
- Use `.env.example` as a template
- Rotate keys if accidentally exposed
- Use Supabase Row Level Security (RLS) policies

## Security Best Practices

### 1. Authentication
- All authentication is handled by Supabase Auth
- Passwords are never stored in the application
- Session tokens are managed securely

### 2. Database Access
- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Admin access is role-based

### 3. API Keys
- Supabase anon key is safe to expose (public)
- Service role key should NEVER be in frontend code
- All sensitive operations use RLS policies

### 4. Data Protection
- All data transmission uses HTTPS
- Supabase handles encryption at rest
- No sensitive data in localStorage

## Secure Configuration Checklist

- [x] `.env` files in `.gitignore`
- [x] Environment variables validation
- [x] No hardcoded credentials
- [x] Supabase RLS policies enabled
- [x] HTTPS enforced
- [x] Session management secure
