// Test selection logic used by carpool UI for ?outing / dropdown
// Usage:
//   SUPABASE_URL=... SUPABASE_ANON_KEY=... node scripts/testCarpoolSelection.mjs "qp string or id"

import fs from 'fs'
import path from 'path'

async function loadConfigFromFile() {
  try {
    const p = path.join(process.cwd(), 'docs', 'js', 'supabase-config.js')
    const text = fs.readFileSync(p, 'utf8')
    const urlMatch = text.match(/url:\s*'([^']+)'/)
    const keyMatch = text.match(/anonKey:\s*'([^']+)'/)
    return { url: urlMatch ? urlMatch[1] : '', key: keyMatch ? keyMatch[1] : '' }
  } catch (e) {
    return { url: '', key: '' }
  }
}

function selectMatch(outings, qpRaw) {
  if (!qpRaw) return null
  const qp = qpRaw.toString()
  const lc = qp.toLowerCase()
  return (
    outings.find(o => (o.id || '') === qp) ||
    outings.find(o => (o.slug || '').toLowerCase() === lc) ||
    outings.find(o => (o.title || '').toLowerCase() === lc) ||
    outings.find(o => (o.title || '').toLowerCase().includes(lc)) ||
    null
  )
}

async function main() {
  let SUPABASE_URL = process.env.SUPABASE_URL || ''
  let SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || ''
  const arg = process.argv[2] || process.env.TEST_QP || ''

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
    .select('id, slug, title, start_at, end_at, location, meeting_point, departure_details, return_details, notes')
    .order('start_at', { ascending: true })

  if (error) {
    console.error('Fetch error:', error)
    process.exit(1)
  }

  console.log(`Loaded outings: ${data?.length || 0}`)
  if (!data || !data.length) process.exit(1)

  const match = selectMatch(data, arg)
  if (!match) {
    console.warn('No match for qp:', arg)
    process.exit(1)
  }

  console.log('Matched outing:')
  console.log({ id: match.id, title: match.title, slug: match.slug })
  console.log('Meta:')
  console.table({
    location: match.location,
    meeting_point: match.meeting_point,
    departure_details: match.departure_details,
    return_details: match.return_details,
    notes: match.notes
  })

  process.exit(0)
}

main().catch(e => {
  console.error('Unhandled error:', e)
  process.exit(1)
})

