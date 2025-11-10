# Carpool & Attendance Persistence Setup

This document explains how carpool drivers, passengers, and attendance records persist in your Supabase database.

## Database Tables

Your database has the following tables for carpool and attendance:

### 1. `carpool_drivers`
Stores driver information for outings:
- Driver name and contact info
- Available seats
- Departure location
- Round trip information
- Linked to an outing via `outing_id` (foreign key)

### 2. `carpool_passengers`
Stores passenger/child information:
- Child name
- Guardian name and phone
- Assigned driver (optional)
- Direction (outbound/return/round-trip)
- Linked to an outing via `outing_id` (foreign key)
- Optionally linked to a driver via `driver_id` (foreign key)

### 3. `attendance_records`
Stores scout attendance:
- Scout name and team
- Attendance status (present/absent/late/excused)
- Notes and who marked it
- Linked to an outing via `outing_id` (foreign key)

## Data Persistence Features

### ✓ All data persists permanently
Once you add drivers, passengers, or attendance records, they are stored in the Supabase PostgreSQL database and will persist:
- Across browser sessions
- Even if localStorage is cleared
- Accessible from any device
- Backed up by Supabase

### ✓ Foreign key relationships
All carpool and attendance data is properly linked to outings:
- When you delete an outing, all associated drivers, passengers, and attendance are automatically deleted (CASCADE)
- You can query all data for a specific outing efficiently
- Referential integrity is enforced by the database

### ✓ Row Level Security (RLS)
Data is protected by RLS policies:
- **Anyone can read** carpool and attendance data (public read)
- **Only authenticated users** can write directly
- **Password-protected RPC functions** allow controlled writes with the shared secret

## Setup Instructions

### Step 1: Enable pgcrypto Extension
In your Supabase SQL Editor, run:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

This extension is required for password hashing.

### Step 2: Set the Shared Secret
In your Supabase SQL Editor, run:

```sql
SELECT public.set_outing_secret('Scout2025!', 'primary');
```

This creates a hashed password that protects write operations.

### Step 3: Apply Carpool RPC Functions (Recommended)
To enable password-protected carpool operations, run the contents of:

```
supabase/carpool-rpc-functions.sql
```

This adds RPC functions for:
- `add_driver_with_secret()` - Add a driver
- `update_driver_with_secret()` - Update driver info
- `delete_driver_with_secret()` - Remove a driver
- `add_passenger_with_secret()` - Add a passenger
- `update_passenger_with_secret()` - Update passenger info
- `delete_passenger_with_secret()` - Remove a passenger

## Testing Persistence

### Quick Test (No setup required)
Tests that tables exist and can be read:

```bash
npm run test:carpool
```

This verifies:
- All tables are accessible
- Existing data can be queried
- RLS policies are active
- Relationships work

### Full Test (Requires setup)
Tests complete CRUD operations:

```bash
npm run test:carpool:full
```

**Prerequisites:**
1. pgcrypto extension enabled
2. Shared secret set
3. Carpool RPC functions applied

This comprehensive test:
- Creates a test outing
- Adds a driver and verifies it persists
- Adds a passenger and verifies it persists
- Adds attendance and verifies it persists
- Tests all foreign key relationships
- Verifies cascading deletes
- Cleans up test data

## Using in Your Application

### Reading Data (Always Works)

```javascript
// Get all drivers for an outing
const { data: drivers } = await supabase
  .from('carpool_drivers')
  .select('*')
  .eq('outing_id', outingId);

// Get all passengers with their driver info
const { data: passengers } = await supabase
  .from('carpool_passengers')
  .select('*, carpool_drivers(name, phone)')
  .eq('outing_id', outingId);

// Get attendance records
const { data: attendance } = await supabase
  .from('attendance_records')
  .select('*')
  .eq('outing_id', outingId);
```

### Writing Data (Requires Password)

#### Add a Driver
```javascript
const { data: driver, error } = await supabase
  .rpc('add_driver_with_secret', {
    p_secret: 'Scout2025!',
    p_outing_id: outingId,
    p_name: 'Jean Dupont',
    p_phone: '06 12 34 56 78',
    p_seats_available: 4,
    p_departure_location: 'Paris',
    p_notes: 'Voiture 7 places',
    p_is_round_trip: true,
    p_outbound_time: '08:00',
    p_return_time: '17:00'
  });
```

#### Add a Passenger
```javascript
const { data: passenger, error } = await supabase
  .rpc('add_passenger_with_secret', {
    p_secret: 'Scout2025!',
    p_outing_id: outingId,
    p_driver_id: driverId, // or null if not assigned yet
    p_child_name: 'Pierre Martin',
    p_guardian_name: 'Marie Martin',
    p_guardian_phone: '06 98 76 54 32',
    p_notes: '',
    p_direction: 'round-trip'
  });
```

#### Add Attendance
```javascript
const { data: record, error } = await supabase
  .rpc('upsert_attendance_with_secret', {
    p_secret: 'Scout2025!',
    p_outing_id: outingId,
    p_scout_name: 'Pierre Martin',
    p_status: 'present',
    p_notes: '',
    p_marked_by: 'Chef',
    p_scout_team: 'Moussaillons'
  });
```

## Summary

**Yes, all carpool and attendance data persists!**

- ✓ Drivers persist in `carpool_drivers` table
- ✓ Passengers persist in `carpool_passengers` table
- ✓ Attendance persists in `attendance_records` table
- ✓ All linked to outings via foreign keys
- ✓ Cascade deletes when outing is removed
- ✓ Protected by Row Level Security
- ✓ Accessible from anywhere with proper credentials

Your data is safely stored in Supabase PostgreSQL and will remain there permanently until explicitly deleted.
