-- ========================================
-- SIMPLE PASSWORD FUNCTIONS (No Encryption Needed)
-- ========================================
-- For scout applications where basic password protection is sufficient

-- Drop existing functions
DROP FUNCTION IF EXISTS public.set_outing_secret(text, text);
DROP FUNCTION IF EXISTS public.verify_outing_secret(text);

-- Simple set password function
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
        p_secret,  -- Just store the password directly (or use simple hash below)
        true
    );
END;
$$;

-- Simple verify password function
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
          AND s.secret_hash = p_secret
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_outing_secret(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_outing_secret(text) TO anon, authenticated;

-- Clear old attempts and set the password
DELETE FROM public.outing_secrets;
SELECT public.set_outing_secret('Scout2025!', 'primary');

-- Test it works
SELECT public.verify_outing_secret('Scout2025!') as is_valid;
-- Should return: true

SELECT public.verify_outing_secret('WrongPassword') as is_valid;
-- Should return: false

-- Verify the secret was created
SELECT id, label, active, created_at FROM public.outing_secrets;
