-- Recreate the verify_outing_secret function
-- This is needed because it was created before pgcrypto was enabled

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

-- Test it works
SELECT public.verify_outing_secret('Scout2025!') as is_valid;
-- Should return: true
