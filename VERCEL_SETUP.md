# Vercel Environment Variables Setup

## Error: Missing Supabase environment variables

Your app is deployed on Vercel but missing environment variables.

## Fix (2 minutes):

1. **Go to Vercel Dashboard:**
   https://vercel.com/dashboard

2. **Select your project:** `epsilon-attendance`

3. **Go to Settings → Environment Variables**

4. **Add these variables:**

   **Variable 1:**
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://sxnaopzgaddvziplrlbe.supabase.co`
   - Environment: Production, Preview, Development (select all)

   **Variable 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4bmFvcHpnYWRkdnppcGxybGJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MjUyODQsImV4cCI6MjA3MjIwMTI4NH0.o3UAaJtrNpVh_AsljSC1oZNkJPvQomedvtJlXTE3L6w`
   - Environment: Production, Preview, Development (select all)

5. **Redeploy:**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

## ✅ Done!

Your app will rebuild with the environment variables and work correctly.

## 🔒 Security Note:

Remember to rotate these Supabase keys before making the GitHub repository public (see SECURITY_NOTICE.md).
