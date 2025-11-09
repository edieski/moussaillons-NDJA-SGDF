import { supabase } from '../lib/supabaseClient.mjs';

async function main() {
  // Perform a lightweight request so we know the client is usable.
  try {
    const { error } = await supabase.auth.getSession();

    if (error) {
      console.error('Supabase responded with an error:', error.message);
      process.exitCode = 1;
      return;
    }

    console.log('Supabase client instantiated successfully.');
  } catch (err) {
    console.error('Failed to talk to Supabase:', err instanceof Error ? err.message : err);
    process.exitCode = 1;
  }
}

main();

