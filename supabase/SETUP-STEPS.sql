-- ========================================
-- SUPABASE DATABASE SETUP - RUN THESE IN ORDER
-- ========================================
-- Copy and paste these commands into your Supabase SQL Editor
-- Run them one at a time in the order shown

-- STEP 1: Enable Required Extensions
-- This MUST be done first before running the schema
-- ========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Verify extensions are enabled (you should see both listed)
SELECT extname, extversion FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto');

-- ========================================
-- STEP 2: Apply the Main Schema
-- ========================================
-- Now copy and paste the ENTIRE contents of schema.sql
-- (The schema.sql file in this same folder)

-- ========================================
-- STEP 3: Set the Outing Secret
-- ========================================
-- After the schema is applied, set the password
-- This uses the password from docs/js/common.js (CORRECT_PASSWORD)

SELECT public.set_outing_secret('Scout2025!', 'primary');

-- Verify the secret was created (you should see 1 row)
SELECT id, label, active, created_at FROM public.outing_secrets;

-- ========================================
-- STEP 4 (Optional): Add Carpool RPC Functions
-- ========================================
-- If you want password-protected carpool operations,
-- copy and paste the contents of carpool-rpc-functions.sql

-- ========================================
-- STEP 5: Verify Setup
-- ========================================
-- Check that all tables exist

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('outings', 'carpool_drivers', 'carpool_passengers', 'attendance_records', 'outing_secrets')
ORDER BY table_name;

-- You should see all 5 tables listed

-- ========================================
-- STEP 6: Test from your application
-- ========================================
-- Run: npm run test:persistence:full
-- This will verify everything is working correctly
