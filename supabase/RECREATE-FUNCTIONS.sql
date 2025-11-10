-- ========================================
-- RECREATE FUNCTIONS AFTER ENABLING PGCRYPTO
-- ========================================
-- Run this AFTER you've enabled the pgcrypto extension
-- This recreates the functions so they can see the pgcrypto functions

-- Drop and recreate set_outing_secret
DROP FUNCTION IF EXISTS public.set_outing_secret(text, text);

CREATE OR REPLACE FUNCTION public.set_outing_secret(p_secret text, p_label text default 'default')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.outing_secrets (label, secret_hash, active)
    VALUES (
        p_label,
        crypt(p_secret, gen_salt('bf')),
        true
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_outing_secret(text, text) TO service_role;

-- Drop and recreate verify_outing_secret
DROP FUNCTION IF EXISTS public.verify_outing_secret(text);

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
          AND s.secret_hash = crypt(p_secret, s.secret_hash)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_outing_secret(text) TO anon, authenticated;

-- Test that gen_salt works in the function context
SELECT gen_salt('bf');

-- Now set the secret (should work!)
SELECT public.set_outing_secret('Scout2025!', 'primary');

-- Verify it was created
SELECT id, label, active, created_at FROM public.outing_secrets;
