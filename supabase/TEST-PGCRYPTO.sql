-- ========================================
-- Test pgcrypto Extension Functions
-- ========================================
-- Run these tests one by one to diagnose the issue

-- Test 1: Check if extension is enabled
SELECT extname, extversion
FROM pg_extension
WHERE extname = 'pgcrypto';
-- Should show: pgcrypto | 1.3 (or similar)

-- Test 2: Test gen_salt (you said this works)
SELECT gen_salt('bf');
-- Should show: $2a$06$... (some random string)

-- Test 3: Test crypt function directly
SELECT crypt('test', gen_salt('bf'));
-- This should work if pgcrypto is properly enabled

-- Test 4: Check which schema pgcrypto is in
SELECT n.nspname as schema_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'crypt';
-- Should show: public or pg_catalog

-- Test 5: List all pgcrypto functions available
SELECT p.proname as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN ('crypt', 'gen_salt', 'digest', 'hmac')
ORDER BY p.proname;
-- Should show all these functions

-- ========================================
-- If crypt exists but in wrong schema, try this:
-- ========================================

-- Option A: Use pg_catalog prefix
SELECT pg_catalog.crypt('test', pg_catalog.gen_salt('bf'));

-- Option B: Check available extensions
SELECT * FROM pg_available_extensions WHERE name = 'pgcrypto';
