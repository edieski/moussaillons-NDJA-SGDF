import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? 'https://prxficuuovwhwatsuork.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
  throw new Error(
    'Missing SUPABASE_KEY. Add it to your environment (e.g. .env file) before using the Supabase client.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

