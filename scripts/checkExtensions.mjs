import { supabase } from '../lib/supabaseClient.mjs';

async function checkExtensions() {
  console.log('=== Checking Supabase Extensions ===\n');

  try {
    // Check if pgcrypto extension is enabled
    const { data: extensions, error } = await supabase
      .rpc('pg_available_extensions')
      .catch(() => {
        // If RPC doesn't exist, try a different approach
        return { data: null, error: null };
      });

    // Alternative: Try to use a pgcrypto function
    console.log('Testing pgcrypto extension...');

    const { data: testCrypt, error: cryptError } = await supabase
      .rpc('test_pgcrypto')
      .catch(() => ({ data: null, error: { message: 'Function does not exist' } }));

    if (cryptError && cryptError.message.includes('does not exist')) {
      console.log('⚠️  Cannot directly test pgcrypto from client\n');
      console.log('Please run this SQL query in your Supabase SQL Editor:');
      console.log('');
      console.log('SELECT extname, extversion');
      console.log('FROM pg_extension');
      console.log('WHERE extname IN (\'uuid-ossp\', \'pgcrypto\');');
      console.log('');
      console.log('You should see both extensions listed.');
      console.log('');
      console.log('If they are NOT listed, run:');
      console.log('');
      console.log('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
      console.log('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
      console.log('');
    }

    // Check if the secret setting function exists
    console.log('Checking if set_outing_secret function exists...');

    const { data: secretTest, error: secretError } = await supabase
      .rpc('set_outing_secret', {
        p_secret: 'test',
        p_label: 'test'
      })
      .catch(err => ({ data: null, error: err }));

    if (secretError) {
      if (secretError.message.includes('permission denied')) {
        console.log('✓ Function exists (permission denied is expected with anon key)\n');
      } else if (secretError.message.includes('does not exist')) {
        console.log('❌ set_outing_secret function does not exist');
        console.log('   Schema may not be fully applied\n');
      } else if (secretError.message.includes('gen_salt')) {
        console.log('❌ pgcrypto extension is NOT enabled!');
        console.log('');
        console.log('SOLUTION:');
        console.log('1. Open your Supabase SQL Editor');
        console.log('2. Run this command:');
        console.log('');
        console.log('   CREATE EXTENSION IF NOT EXISTS pgcrypto;');
        console.log('');
        console.log('3. Then run:');
        console.log('');
        console.log('   SELECT public.set_outing_secret(\'Scout2025!\', \'primary\');');
        console.log('');
      } else {
        console.log('⚠️  Unexpected error:', secretError.message);
      }
    }

    // Check if outings table exists
    console.log('\nChecking database tables...');
    const { data: outings, error: tableError } = await supabase
      .from('outings')
      .select('count')
      .limit(0);

    if (tableError) {
      console.log('❌ Outings table does not exist or is not accessible');
      console.log('   Please apply the schema from supabase/schema.sql\n');
    } else {
      console.log('✓ Outings table exists\n');
    }

    // Summary
    console.log('=== Setup Status ===\n');
    console.log('Next steps:');
    console.log('1. Enable pgcrypto extension (see above)');
    console.log('2. Set the outing secret (see above)');
    console.log('3. Run: npm run test:persistence:full');
    console.log('');

  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkExtensions();
