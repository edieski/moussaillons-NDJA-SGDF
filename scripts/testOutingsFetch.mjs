// Minimal test to fetch outings from Supabase and print the whole table
// Usage:
//   SUPABASE_URL=... SUPABASE_ANON_KEY=... node scripts/testOutingsFetch.mjs
// Optional:
//   TEST_OUTING_ID=uuid node scripts/testOutingsFetch.mjs

import fs from 'fs'
import path from 'path'

async function loadConfigFromFile() {
  try {
    const p = path.join(process.cwd(), 'docs', 'js', 'supabase-config.js')
    const text = fs.readFileSync(p, 'utf8')
    const urlMatch = text.match(/url:\s*'([^']+)'/)
    const keyMatch = text.match(/anonKey:\s*'([^']+)'/)
    return {
      url: urlMatch ? urlMatch[1] : '',
      key: keyMatch ? keyMatch[1] : ''
    }
  } catch (e) {
    return { url: '', key: '' }
  }
}

async function main() {
  let SUPABASE_URL = process.env.SUPABASE_URL || ''
  let SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || ''

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const fileCfg = await loadConfigFromFile()
    SUPABASE_URL = SUPABASE_URL || fileCfg.url
    SUPABASE_ANON_KEY = SUPABASE_ANON_KEY || fileCfg.key
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase config. Set SUPABASE_URL and SUPABASE_ANON_KEY or fill docs/js/supabase-config.js')
    process.exit(2)
  }

  let createClient
  try {
    ;({ createClient } = await import('@supabase/supabase-js'))
  } catch (e) {
    console.error('Missing dependency @supabase/supabase-js. Run: npm i -D @supabase/supabase-js')
    process.exit(2)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } })

  const { data, error } = await supabase
    .from('outings')
    .select('id, slug, title, start_at, end_at, location, meeting_point, departure_details, return_details, notes, auto_carpool, created_at, updated_at')
    .order('start_at', { ascending: true })

  if (error) {
    console.error('Fetch error:', error)
    process.exit(1)
  }

  console.log('\n=== Outings table ===')
  console.log('Count:', data?.length || 0)
  if (data && data.length) {
    const keys = Object.keys(data[0])
    console.log('Columns:', keys.join(', '))
  }
  // Print a compact table view
  if (data && data.length) {
    const rows = data.map(r => ({
      id: r.id,
      title: r.title,
      start_at: r.start_at,
      location: r.location,
      meeting_point: r.meeting_point,
      departure: r.departure_details,
      return: r.return_details
    }))
    console.table(rows)
  }

  const TEST_OUTING_ID = process.env.TEST_OUTING_ID || ''
  if (TEST_OUTING_ID) {
    const { data: one, error: e2 } = await supabase
      .from('outings')
      .select('id, title, location, meeting_point, departure_details, return_details, notes')
      .eq('id', TEST_OUTING_ID)
      .maybeSingle()
    if (e2) {
      console.error('Fetch by id error:', e2)
      process.exit(1)
    }
    console.log('\n=== Outing by id ===')
    console.log(one)
  }

  process.exit(0)
}

main().catch(e => {
  console.error('Unhandled error:', e)
  process.exit(1)
})

