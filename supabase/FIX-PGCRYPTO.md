# Fix: pgcrypto Extension Not Enabled

## The Problem

You're getting this error:
```
ERROR: function gen_salt(unknown) does not exist
```

This means the `pgcrypto` extension is **not actually enabled** in your Supabase database.

## Solution: Enable pgcrypto Extension

### Step 1: Check Current Extensions

In your **Supabase SQL Editor**, run:

```sql
SELECT extname, extversion
FROM pg_extension
WHERE extname = 'pgcrypto';
```

**Expected results:**
- If you see **NO ROWS**: Extension is not enabled (this is your issue)
- If you see **1 row with pgcrypto**: Extension is enabled (skip to Step 3)

### Step 2: Enable the Extension

In your **Supabase SQL Editor**, run this **exact command**:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

**Important Notes:**
- Run this as a **single query** (not part of a larger script)
- You might need to use the Supabase Dashboard Extensions page instead
- Some Supabase projects have restrictions on extension installation

**Alternative: Use Supabase Dashboard**

If the SQL command doesn't work:

1. Go to your Supabase Dashboard
2. Click on **Database** in the left sidebar
3. Click on **Extensions**
4. Find `pgcrypto` in the list
5. Click the toggle to **enable** it
6. Wait for it to finish enabling (may take a few seconds)

### Step 3: Verify Extension is Enabled

Run this again:

```sql
SELECT extname, extversion
FROM pg_extension
WHERE extname = 'pgcrypto';
```

You should now see:
```
extname    | extversion
-----------|------------
pgcrypto   | 1.3
```

### Step 4: Test the gen_salt Function

Run this simple test:

```sql
SELECT gen_salt('bf');
```

**Expected result:** You should see a random salt string like `$2a$06$...`

If you get an error here, the extension is still not enabled.

### Step 5: Now Set the Secret

Once pgcrypto is confirmed enabled, run:

```sql
SELECT public.set_outing_secret('Scout2025!', 'primary');
```

This should now work without errors.

### Step 6: Verify Secret Was Created

```sql
SELECT id, label, active, created_at
FROM public.outing_secrets;
```

You should see 1 row with your secret.

## Troubleshooting

### If CREATE EXTENSION fails with permission error:

Your Supabase user might not have permission to create extensions. Try:

1. Use the **Supabase Dashboard > Database > Extensions** UI (recommended)
2. Contact Supabase support if the extension is restricted
3. Check if you're on a free plan with extension limitations

### If pgcrypto is not in the extensions list:

This would be unusual for Supabase. Check:
- Your Supabase project version
- Whether you're using a self-hosted instance
- Supabase documentation for your specific plan

### Alternative: Use a Simpler Hash

If you absolutely cannot enable pgcrypto, you can modify the schema to use a simpler approach (less secure):

**NOT RECOMMENDED - Only as last resort:**

```sql
-- Replace the set_outing_secret function with this simpler version
CREATE OR REPLACE FUNCTION public.set_outing_secret(p_secret text, p_label text default 'default')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- WARNING: This is less secure than bcrypt
    -- Only use if pgcrypto is unavailable
    INSERT INTO public.outing_secrets (label, secret_hash, active)
    VALUES (
        p_label,
        encode(digest(p_secret, 'sha256'), 'hex'),  -- Simple SHA-256 hash
        true
    );
END;
$$;

-- Also update verify function
CREATE OR REPLACE FUNCTION public.verify_outing_secret(p_secret text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.outing_secrets s
        WHERE s.active
          AND s.secret_hash = encode(digest(p_secret, 'sha256'), 'hex')
    );
END;
$$;
```

## Next Steps After Fixing

Once pgcrypto is enabled and the secret is set, test everything:

```bash
npm run test:persistence:full
```

This will verify all persistence features are working.
