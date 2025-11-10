# Supabase Outing Sync Setup

This folder documents the SQL objects required to keep the calendar, covoiturage, and registre pages in sync through a shared Supabase backend.

## 1. Apply the schema

1. Open the [Supabase SQL editor](https://app.supabase.com/project/_/sql).
2. Paste the contents of [`schema.sql`](schema.sql) and run it once.
   - This will create:
     - `outings` (core outing metadata)
     - `carpool_drivers` / `carpool_passengers`
     - `attendance_records`
     - `outing_secrets` (stores a hashed “chef password”)
   - Helper RPC functions (`create_outing_with_secret`, `update_outing_with_secret`, `delete_outing_with_secret`) which allow password-guarded mutations from the anon client.
   - Row Level Security policies that keep reads open to everyone while limiting direct writes to authenticated/service clients.

> **Note:** The script assumes the `pgcrypto` extension is available (it is enabled by default on Supabase). If you disabled it previously, re-enable it first: `create extension if not exists pgcrypto;`.

## 2. Set the outing secret

Run the helper function with the desired chef password (e.g. the value stored in `CORRECT_PASSWORD` inside `docs/js/common.js`).

```sql
-- Replace 'Scout2025!' with your real password; you can call the function
-- multiple times to rotate secrets (only active secrets are accepted).
select public.set_outing_secret('Scout2025!', 'primary');
```

Secrets are stored as BCrypt hashes; you never expose the plain text inside Supabase.

To rotate the password:

```sql
update public.outing_secrets
set active = false
where label = 'primary';

select public.set_outing_secret('NewSecretHere', 'primary');
```

## 3. Optional: Seed sample outings

If you want starter data for local testing, insert into `outings` manually:

```sql
insert into public.outings (
  slug, title, start_at, end_at, location, meeting_point,
  departure_details, return_details, notes, auto_carpool
) values (
  'weekend-groupe',
  'Weekend Groupe',
  '2025-10-18T08:00:00Z',
  '2025-10-19T17:00:00Z',
  'Jambville',
  'Parvis de l''Église',
  'Départ samedi 8h00',
  'Retour dimanche 17h00',
  'Prévoir tenue de pluie',
  true
);
```

## 4. Security considerations

- Outing creation/update/deletion should be done through the provided RPC functions. They validate the shared secret on the server before performing mutations.
- Direct inserts/updates on `carpool_*` and `attendance_records` still require an authenticated Supabase user. The front-end will continue to use the anon key but route privileged actions through server-side Edge Functions or the RPC helpers where necessary.
- Never commit real Supabase keys into the repository. Use `docs/js/supabase-config.js` as a template and keep the actual configuration in an ignored `docs/js/supabase-config.local.js` file or runtime injection.

## 5. Testing Database Persistence

To verify that your database persistence is working correctly, you can use the provided test scripts:

### Quick Test (Recommended)
```bash
npm run test:persistence
```

This test verifies:
- Database connection works
- All schema tables exist and are accessible
- Data can be read from the database
- RLS policies are protecting data correctly

### Full Test (Requires pgcrypto extension)
```bash
npm run test:persistence:full
```

This comprehensive test also verifies:
- Creating outings via RPC functions
- Updating outings
- Creating attendance records
- Data persists across operations
- Deletion and cascading deletes work

**Note:** The full test requires the pgcrypto extension to be enabled in Supabase:
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
SELECT public.set_outing_secret('Scout2025!', 'primary');
```

### Environment Setup
The tests use environment variables from `.env` file. Make sure this file exists with:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_anon_key
```

On Windows, you can also run the convenience script: `test-persistence.bat`

## 6. Next steps for the front-end

After the schema is in place:

1. Load the Supabase client scripts on the relevant pages (`admin.html`, `calendrier.html`, `covoiturage.html`). The registre (appel) is integrated as a tab in `index.html` and not a separate page.
2. Implement `docs/js/outings-service.js` to wrap the RPC functions and standard CRUD queries.
3. Migrate the existing localStorage usage in the covoiturage and registre flows to Supabase-backed reads/writes.

Refer to the main project plan (`sup.plan.md`) for the remaining implementation tasks.


