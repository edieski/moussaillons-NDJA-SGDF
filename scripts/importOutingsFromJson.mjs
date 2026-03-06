import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { supabase } from '../lib/supabaseClient.mjs';

const PASSWORD = 'Scout2025!';

async function loadOutingsJson() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const jsonPath = path.resolve(__dirname, '..', 'outings_to_import.json');

  const raw = await fs.readFile(jsonPath, 'utf8');
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error('Invalid outings_to_import.json format: expected an array');
  }

  return parsed;
}

async function getExistingSlugs() {
  const { data, error } = await supabase.from('outings').select('slug');

  if (error) {
    throw new Error(`Failed to read existing outings: ${error.message}`);
  }

  return new Set((data || []).map((row) => row.slug));
}

async function importOutings() {
  console.log('=== Importing outings from outings_to_import.json ===\n');

  const outings = await loadOutingsJson();
  console.log(`Found ${outings.length} outing(s) in JSON file.\n`);

  const existingSlugs = await getExistingSlugs();
  let createdCount = 0;
  let skippedCount = 0;
  const errors = [];

  for (const outing of outings) {
    if (!outing.slug || !outing.title || !outing.start_at) {
      console.warn(
        `Skipping outing with missing required fields (slug/title/start_at):`,
        outing
      );
      skippedCount += 1;
      continue;
    }

    if (existingSlugs.has(outing.slug)) {
      console.log(`↷ Skipping existing outing: ${outing.slug}`);
      skippedCount += 1;
      continue;
    }

    console.log(`→ Creating outing: ${outing.title} (${outing.slug})`);

    const { data, error } = await supabase.rpc('create_outing_with_secret', {
      p_secret: PASSWORD,
      p_slug: outing.slug,
      p_title: outing.title,
      p_start_at: outing.start_at,
      p_end_at: outing.end_at,
      p_location: outing.location ?? '',
      p_meeting_point: outing.meeting_point ?? '',
      p_departure_details: outing.departure_details ?? '',
      p_return_details: outing.return_details ?? '',
      p_notes: outing.notes ?? '',
      p_auto_carpool: Boolean(outing.auto_carpool),
    });

    if (error) {
      console.error(
        `  ❌ Failed to create outing "${outing.title}" (${outing.slug}):`,
        error.message
      );
      errors.push({ outing, error });
      continue;
    }

    createdCount += 1;
    existingSlugs.add(data.slug);
  }

  console.log('\n=== Import Summary ===');
  console.log(`Created: ${createdCount}`);
  console.log(`Skipped (existing or invalid): ${skippedCount}`);
  console.log(`Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\nSome outings failed to import. See messages above for details.');
  } else {
    console.log(
      '\nAll outings imported successfully. The calendar should now load outings from Supabase.'
    );
  }
}

importOutings().catch((err) => {
  console.error('Unexpected import error:', err instanceof Error ? err.message : err);
  if (err?.stack) {
    console.error(err.stack);
  }
  process.exitCode = 1;
});

