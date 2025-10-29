# ⚠️ Security Notice - Action Required Before Making Repository Public

## 🔴 CRITICAL: Exposed Credentials in Git History

Your git history contains **hardcoded Supabase credentials** in the initial commit:

```
Commit: e3b28ff (Initial commit)
File: src/lib/supabase.ts
Exposed: Supabase URL and anon key
```

## 🛡️ Recommended Actions

### Option 1: Rotate Credentials (RECOMMENDED - Easiest)

1. **Go to Supabase Dashboard**
   - Project Settings → API
   - Generate new anon key
   - Update your `.env` file with new credentials

2. **Update your code** (already done)
   - Credentials removed from code
   - Now uses environment variables

3. **Make repository public**
   - Old keys in history are now invalid
   - Safe to make public

### Option 2: Rewrite Git History (Advanced)

**⚠️ WARNING: This will change all commit hashes and require force push**

```bash
# Backup your repository first
cp -r attendr-folio-main attendr-folio-main-backup

# Create a file with text to replace
cat > /tmp/replacements.txt << 'EOF'
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4bmFvcHpnYWRkdnppcGxybGJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MjUyODQsImV4cCI6MjA3MjIwMTI4NH0.o3UAaJtrNpVh_AsljSC1oZNkJPvQomedvtJlXTE3L6w==>REDACTED_SUPABASE_KEY
https://sxnaopzgaddvziplrlbe.supabase.co==>REDACTED_SUPABASE_URL
EOF

# Use BFG Repo Cleaner (easier than git-filter-repo)
brew install bfg
bfg --replace-text /tmp/replacements.txt attendr-folio-main

# Clean up
cd attendr-folio-main
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (⚠️ destructive)
git push --force
```

### Option 3: Start Fresh Repository (Nuclear Option)

1. Create new GitHub repository
2. Copy current code (not git history)
3. Make initial commit with clean code
4. Push to new repository

## 📋 Current Status

✅ **Fixed in current code:**
- Credentials removed from `src/lib/supabase.ts`
- Environment variables properly configured
- `.gitignore` updated
- `.env.example` created
- `SECURITY.md` added

❌ **Still in git history:**
- Initial commit contains hardcoded credentials
- Visible to anyone who clones the repository

## 🎯 Recommendation

**For your use case, I recommend Option 1 (Rotate Credentials):**
- Fastest and safest
- No risk of breaking git history
- Takes 2 minutes in Supabase dashboard
- Old keys become useless

## 📝 Important Notes

**About Supabase Anon Keys:**
- Designed to be public-facing
- Safe when Row Level Security (RLS) is enabled
- Not as critical as service role keys
- Still best practice to rotate if exposed

**Before Making Public:**
1. Rotate Supabase keys (recommended)
2. Enable RLS policies on all tables
3. Review database permissions
4. Test with new keys
