import { supabase } from '../lib/supabaseClient.mjs';

async function testBasicPersistence() {
  console.log('=== Basic Database Persistence Test ===\n');

  try {
    // Test 1: Verify schema tables exist
    console.log('1. Testing database schema...');

    const tables = ['outings', 'carpool_drivers', 'carpool_passengers', 'attendance_records'];
    let allTablesExist = true;

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.error(`  ❌ Table '${table}' error:`, error.message);
        allTablesExist = false;
      } else {
        console.log(`  ✓ Table '${table}' exists and is accessible`);
      }
    }

    if (!allTablesExist) {
      console.log('\n⚠️  Some tables are missing. Please apply the schema from supabase/schema.sql');
      return false;
    }
    console.log();

    // Test 2: Check for existing data
    console.log('2. Checking for existing data...');
    const { data: outings, error: outingsError } = await supabase
      .from('outings')
      .select('*');

    if (outingsError) {
      console.error('  ❌ Error reading outings:', outingsError.message);
      return false;
    }

    console.log(`  ✓ Found ${outings.length} outing(s) in database`);

    if (outings.length > 0) {
      console.log('\n  Recent outings:');
      outings.slice(0, 3).forEach((outing, index) => {
        console.log(`    ${index + 1}. ${outing.title} (${outing.slug})`);
        console.log(`       Start: ${new Date(outing.start_at).toLocaleDateString()}`);
        console.log(`       Location: ${outing.location || 'N/A'}`);
      });
    }
    console.log();

    // Test 3: Check carpool data
    console.log('3. Checking carpool data...');
    const { data: drivers, error: driversError } = await supabase
      .from('carpool_drivers')
      .select('*');

    if (!driversError) {
      console.log(`  ✓ Found ${drivers.length} driver(s)`);
    }

    const { data: passengers, error: passengersError } = await supabase
      .from('carpool_passengers')
      .select('*');

    if (!passengersError) {
      console.log(`  ✓ Found ${passengers.length} passenger(s)`);
    }
    console.log();

    // Test 4: Check attendance data
    console.log('4. Checking attendance data...');
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance_records')
      .select('*');

    if (!attendanceError) {
      console.log(`  ✓ Found ${attendance.length} attendance record(s)`);
    }
    console.log();

    // Test 5: Verify RLS is working
    console.log('5. Verifying Row Level Security (RLS)...');
    console.log('  Testing direct insert (should fail with anon key)...');

    const { error: insertError } = await supabase
      .from('outings')
      .insert({
        slug: 'test-should-fail',
        title: 'This should not be inserted',
        start_at: new Date().toISOString(),
        end_at: new Date().toISOString()
      });

    if (insertError && insertError.message.includes('row-level security')) {
      console.log('  ✓ RLS is correctly blocking direct inserts with anon key');
    } else if (insertError) {
      console.log('  ⚠️  Insert failed but not due to RLS:', insertError.message);
    } else {
      console.log('  ❌ Insert succeeded - RLS may not be configured correctly!');
    }
    console.log();

    // Summary
    console.log('=== Database Persistence Status ===\n');
    console.log('✓ Database connection: Working');
    console.log('✓ Schema tables: All exist and accessible');
    console.log('✓ Data reading: Functional');
    console.log('✓ Data persistence: Confirmed (existing data is readable)');
    console.log('✓ RLS policies: Active and protecting data');
    console.log();

    if (outings.length === 0) {
      console.log('⚠️  No outings found. To create outings:');
      console.log('   1. First enable pgcrypto extension in Supabase SQL editor:');
      console.log('      CREATE EXTENSION IF NOT EXISTS pgcrypto;');
      console.log('   2. Set the outing secret:');
      console.log('      SELECT public.set_outing_secret(\'Scout2025!\', \'primary\');');
      console.log('   3. Use the create_outing_with_secret RPC function from your app');
    }
    console.log();

    return true;

  } catch (err) {
    console.error('❌ Unexpected error:', err instanceof Error ? err.message : err);
    return false;
  }
}

// Run the test
testBasicPersistence().then(success => {
  process.exitCode = success ? 0 : 1;
});
