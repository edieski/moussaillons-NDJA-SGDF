-- Supabase schema for unified outing management
-- Run within the `public` schema of your Supabase project.
-- Requires extensions: uuid-ossp (or pgcrypto for gen_random_uuid), pgcrypto.

-- ========================================
-- Extensions (idempotent enables)
-- ========================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ========================================
-- Core Outings Table
-- ========================================
create table if not exists public.outings (
    id uuid primary key default gen_random_uuid(),
    slug text unique not null,
    title text not null,
    start_at timestamptz not null,
    end_at timestamptz,
    location text,
    meeting_point text,
    departure_details text,
    return_details text,
    notes text,
    auto_carpool boolean default false,
    created_by uuid,
    created_at timestamptz default timezone('utc', now()),
    updated_at timestamptz default timezone('utc', now())
);

create index if not exists outings_start_idx on public.outings (start_at);
create index if not exists outings_slug_idx on public.outings (slug);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

drop trigger if exists trg_outings_updated_at on public.outings;
create trigger trg_outings_updated_at
before update on public.outings
for each row
execute procedure public.set_updated_at();

-- ========================================
-- Carpool Tables
-- ========================================
create table if not exists public.carpool_drivers (
    id uuid primary key default gen_random_uuid(),
    outing_id uuid not null references public.outings(id) on delete cascade,
    name text not null,
    phone text,
    seats_available int not null default 4 check (seats_available >= 0),
    departure_location text,
    notes text,
    supports_outbound boolean not null default false,
    supports_return boolean not null default false,
    is_round_trip boolean generated always as (supports_outbound and supports_return) stored,
    outbound_time text,
    return_time text,
    created_at timestamptz default timezone('utc', now())
);

create index if not exists carpool_drivers_outing_idx on public.carpool_drivers (outing_id);

create table if not exists public.carpool_passengers (
    id uuid primary key default gen_random_uuid(),
    outing_id uuid not null references public.outings(id) on delete cascade,
    driver_id uuid references public.carpool_drivers(id) on delete set null,
    child_id uuid references public.children(id) on delete set null,
    child_name text not null,
    guardian_name text,
    guardian_phone text,
    notes text,
    direction text check (direction in ('outbound','return','round-trip')),
    created_at timestamptz default timezone('utc', now())
);

create index if not exists carpool_passengers_outing_idx on public.carpool_passengers (outing_id);
create index if not exists carpool_passengers_driver_idx on public.carpool_passengers (driver_id);
create index if not exists carpool_passengers_child_idx on public.carpool_passengers (child_id);

-- ========================================
-- Attendance Table
-- ========================================
create table if not exists public.attendance_records (
    id uuid primary key default gen_random_uuid(),
    outing_id uuid not null references public.outings(id) on delete cascade,
    child_id uuid references public.children(id) on delete set null,
    scout_name text not null,
    scout_team text,
    status text not null check (status in ('present','absent','late','excused')),
    notes text,
    marked_at timestamptz default timezone('utc', now()),
    marked_by text,
    parent_confirmed boolean not null default false,
    leader_validated boolean not null default false,
    parent_confirmed_at timestamptz,
    leader_validated_at timestamptz,
    constraint attendance_unique_participant unique (outing_id, scout_name)
);

create index if not exists attendance_outing_idx on public.attendance_records (outing_id);
create index if not exists attendance_scout_idx on public.attendance_records (scout_name);
create index if not exists attendance_child_idx on public.attendance_records (child_id);

-- ========================================
-- Outing Secret Store (hashed shared password)
-- ========================================
create table if not exists public.outing_secrets (
    id uuid primary key default gen_random_uuid(),
    label text not null default 'default',
    secret_hash text not null,
    active boolean not null default true,
    created_at timestamptz default timezone('utc', now())
);

create index if not exists outing_secrets_active_idx on public.outing_secrets (active);

-- ========================================
-- Helper Functions
-- ========================================
create or replace function public.verify_outing_secret(p_secret text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
    return exists (
        select 1
        from public.outing_secrets s
        where s.active
          and s.secret_hash = crypt(p_secret, s.secret_hash)
    );
end;
$$;

grant execute on function public.verify_outing_secret(text) to anon, authenticated;

-- ========================================
-- Children (roster) table
-- ========================================
create table if not exists public.children (
    id uuid primary key default gen_random_uuid(),
    last_name text not null,
    first_name text not null,
    team text,
    active boolean not null default true,
    created_at timestamptz default timezone('utc', now())
);

create index if not exists children_active_idx on public.children (active);
create index if not exists children_name_idx on public.children (last_name, first_name);
-- prevent duplicates by case-insensitive name pairs
do $$
begin
    if not exists (
        select 1 from pg_indexes
        where schemaname = 'public'
          and indexname = 'children_name_unique_idx'
    ) then
        execute 'create unique index children_name_unique_idx on public.children ((lower(last_name)), (lower(first_name)))';
    end if;
end
$$;

alter table public.children enable row level security;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'children'
          and policyname = 'Allow read for all'
    ) then
        execute $sql$
            create policy "Allow read for all"
                on public.children
                for select
                using (true)
        $sql$;
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'children'
          and policyname = 'Service role manage children'
    ) then
        execute $sql$
            create policy "Service role manage children"
                on public.children
                for all
                using (auth.role() = 'service_role')
                with check (auth.role() = 'service_role')
        $sql$;
    end if;
end
$$;

-- Password-guarded RPC to create a child from the anon client
create or replace function public.create_child_with_secret(
    p_secret text,
    p_last_name text,
    p_first_name text,
    p_team text default null,
    p_active boolean default true
)
returns public.children
language plpgsql
security definer
set search_path = public
as $$
declare
    v_child public.children;
begin
    if not public.verify_outing_secret(p_secret) then
        raise exception 'Invalid outing secret';
    end if;

    insert into public.children (
        last_name, first_name, team, active
    ) values (
        p_last_name, p_first_name, p_team, coalesce(p_active, true)
    ) returning * into v_child;

    return v_child;
end;
$$;

grant execute on function public.create_child_with_secret(text, text, text, text, boolean) to anon, authenticated;

-- Upsert RPC: insert or update (by unique name) with password guard
create or replace function public.upsert_child_with_secret(
    p_secret text,
    p_last_name text,
    p_first_name text,
    p_team text default null,
    p_active boolean default true
)
returns public.children
language plpgsql
security definer
set search_path = public
as $$
declare
    v_child public.children;
begin
    if not public.verify_outing_secret(p_secret) then
        raise exception 'Invalid outing secret';
    end if;

    insert into public.children (last_name, first_name, team, active)
    values (p_last_name, p_first_name, p_team, coalesce(p_active, true))
    on conflict ((lower(last_name)), (lower(first_name))) do update set
        team = coalesce(excluded.team, public.children.team),
        active = coalesce(excluded.active, public.children.active)
    returning * into v_child;

    return v_child;
end;
$$;

grant execute on function public.upsert_child_with_secret(text, text, text, text, boolean) to anon, authenticated;

create or replace function public.create_outing_with_secret(
    p_secret text,
    p_slug text,
    p_title text,
    p_start_at timestamptz,
    p_end_at timestamptz,
    p_location text,
    p_meeting_point text,
    p_departure_details text,
    p_return_details text,
    p_notes text,
    p_auto_carpool boolean
)
returns public.outings
language plpgsql
security definer
set search_path = public
as $$
declare
    v_outing public.outings;
begin
    if not public.verify_outing_secret(p_secret) then
        raise exception 'Invalid outing secret';
    end if;

    insert into public.outings (
        slug, title, start_at, end_at, location,
        meeting_point, departure_details, return_details, notes, auto_carpool
    )
    values (
        lower(p_slug), p_title, p_start_at, p_end_at, p_location,
        p_meeting_point, p_departure_details, p_return_details, p_notes, coalesce(p_auto_carpool, false)
    )
    returning * into v_outing;

    return v_outing;
end;
$$;

grant execute on function public.create_outing_with_secret(
    text, text, text, timestamptz, timestamptz, text, text, text, text, text, boolean
) to anon, authenticated;

create or replace function public.update_outing_with_secret(
    p_secret text,
    p_id uuid,
    p_title text,
    p_start_at timestamptz,
    p_end_at timestamptz,
    p_location text,
    p_meeting_point text,
    p_departure_details text,
    p_return_details text,
    p_notes text,
    p_auto_carpool boolean
)
returns public.outings
language plpgsql
security definer
set search_path = public
as $$
declare
    v_outing public.outings;
begin
    if not public.verify_outing_secret(p_secret) then
        raise exception 'Invalid outing secret';
    end if;

    update public.outings
    set title = coalesce(p_title, title),
        start_at = coalesce(p_start_at, start_at),
        end_at = coalesce(p_end_at, end_at),
        location = coalesce(p_location, location),
        meeting_point = coalesce(p_meeting_point, meeting_point),
        departure_details = coalesce(p_departure_details, departure_details),
        return_details = coalesce(p_return_details, return_details),
        notes = coalesce(p_notes, notes),
        auto_carpool = coalesce(p_auto_carpool, auto_carpool),
        updated_at = timezone('utc', now())
    where id = p_id
    returning * into v_outing;

    if not found then
        raise exception 'Outing % not found', p_id;
    end if;

    return v_outing;
end;
$$;

grant execute on function public.update_outing_with_secret(
    text, uuid, text, timestamptz, timestamptz, text, text, text, text, text, boolean
) to anon, authenticated;

create or replace function public.delete_outing_with_secret(
    p_secret text,
    p_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.verify_outing_secret(p_secret) then
        raise exception 'Invalid outing secret';
    end if;

    delete from public.outings where id = p_id;
end;
$$;

grant execute on function public.delete_outing_with_secret(text, uuid) to anon, authenticated;

create or replace function public.upsert_attendance_with_secret(
    p_secret text,
    p_outing_id uuid,
    p_scout_name text,
    p_status text,
    p_notes text,
    p_marked_by text,
    p_scout_team text default null,
    p_child_id uuid default null,
    p_parent_confirmed boolean default null,
    p_leader_validated boolean default null
)
returns public.attendance_records
language plpgsql
security definer
set search_path = public
as $$
declare
    v_record public.attendance_records;
    v_now timestamptz := timezone('utc', now());
    v_parent_confirmed boolean := coalesce(p_parent_confirmed, false);
    v_leader_validated boolean := coalesce(p_leader_validated, false);
    v_parent_confirmed_at timestamptz := case when p_parent_confirmed is true then v_now else null end;
    v_leader_validated_at timestamptz := case when p_leader_validated is true then v_now else null end;
begin
    if not public.verify_outing_secret(p_secret) then
        raise exception 'Invalid outing secret';
    end if;

    insert into public.attendance_records (
        outing_id,
        scout_name,
        status,
        notes,
        marked_by,
        scout_team,
        marked_at,
        child_id,
        parent_confirmed,
        parent_confirmed_at,
        leader_validated,
        leader_validated_at
    )
    values (
        p_outing_id,
        p_scout_name,
        p_status,
        p_notes,
        p_marked_by,
        p_scout_team,
        v_now,
        p_child_id,
        v_parent_confirmed,
        v_parent_confirmed_at,
        v_leader_validated,
        v_leader_validated_at
    )
    on conflict (outing_id, scout_name)
    do update set
        status = excluded.status,
        notes = excluded.notes,
        marked_by = excluded.marked_by,
        scout_team = coalesce(excluded.scout_team, public.attendance_records.scout_team),
        marked_at = excluded.marked_at,
        child_id = coalesce(excluded.child_id, public.attendance_records.child_id),
        parent_confirmed = case
            when p_parent_confirmed is null then public.attendance_records.parent_confirmed
            else excluded.parent_confirmed
        end,
        parent_confirmed_at = case
            when p_parent_confirmed is null then public.attendance_records.parent_confirmed_at
            when excluded.parent_confirmed = false then null
            when public.attendance_records.parent_confirmed = false and excluded.parent_confirmed = true then v_now
            else coalesce(public.attendance_records.parent_confirmed_at, v_now)
        end,
        leader_validated = case
            when p_leader_validated is null then public.attendance_records.leader_validated
            else excluded.leader_validated
        end,
        leader_validated_at = case
            when p_leader_validated is null then public.attendance_records.leader_validated_at
            when excluded.leader_validated = false then null
            when public.attendance_records.leader_validated = false and excluded.leader_validated = true then v_now
            else coalesce(public.attendance_records.leader_validated_at, v_now)
        end
    returning * into v_record;

    return v_record;
end;
$$;

grant execute on function public.upsert_attendance_with_secret(
    text, uuid, text, text, text, text, text, uuid, boolean, boolean
) to anon, authenticated;

create or replace function public.bulk_upsert_attendance_with_secret(
    p_secret text,
    p_outing_id uuid,
    p_records jsonb
)
returns setof public.attendance_records
language plpgsql
security definer
set search_path = public
as $$
declare
    v_record jsonb;
    v_result public.attendance_records;
begin
    if not public.verify_outing_secret(p_secret) then
        raise exception 'Invalid outing secret';
    end if;

    if p_records is null or jsonb_typeof(p_records) <> 'array' then
        raise exception 'p_records must be a JSON array';
    end if;

    for v_record in select * from jsonb_array_elements(p_records)
    loop
        select * into v_result from public.upsert_attendance_with_secret(
            p_secret,
            p_outing_id,
            v_record ->> 'scout_name',
            coalesce(v_record ->> 'status', 'present'),
            v_record ->> 'notes',
            v_record ->> 'marked_by',
            v_record ->> 'scout_team',
            case
                when v_record ? 'child_id' and nullif(v_record ->> 'child_id', '') is not null
                    then (v_record ->> 'child_id')::uuid
                else null
            end,
            case
                when v_record ? 'parent_confirmed' then (v_record ->> 'parent_confirmed')::boolean
                else null
            end,
            case
                when v_record ? 'leader_validated' then (v_record ->> 'leader_validated')::boolean
                else null
            end
        );
        return next v_result;
    end loop;

    return;
end;
$$;

grant execute on function public.bulk_upsert_attendance_with_secret(
    text, uuid, jsonb
) to anon, authenticated;

create or replace function public.normalize_full_name(p_value text)
returns text
language sql
immutable
as $$
    select upper(trim(regexp_replace(coalesce(p_value, ''), '\s+', ' ', 'g')));
$$;

create or replace function public.cleanup_carpool_passengers_for_attendance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_outing_id uuid := case when TG_OP = 'DELETE' then old.outing_id else new.outing_id end;
    v_child_id uuid := case
        when TG_OP = 'DELETE' then old.child_id
        when new.child_id is not null then new.child_id
        else old.child_id
    end;
    v_name text := public.normalize_full_name(
        case when TG_OP = 'DELETE' then old.scout_name else coalesce(new.scout_name, old.scout_name) end
    );
begin
    if TG_OP = 'UPDATE' then
        if coalesce(old.parent_confirmed, false) and not coalesce(new.parent_confirmed, false) then
            delete from public.carpool_passengers
            where outing_id = v_outing_id
              and (
                  (child_id is not null and v_child_id is not null and child_id = v_child_id)
                  or (child_id is null and public.normalize_full_name(child_name) = v_name)
              );
        end if;
    elsif TG_OP = 'DELETE' then
        if coalesce(old.parent_confirmed, false) then
            delete from public.carpool_passengers
            where outing_id = v_outing_id
              and (
                  (child_id is not null and v_child_id is not null and child_id = v_child_id)
                  or (child_id is null and public.normalize_full_name(child_name) = v_name)
              );
        end if;
    end if;

    if TG_OP = 'DELETE' then
        return old;
    end if;
    return new;
end;
$$;

drop trigger if exists trg_attendance_parent_cleanup on public.attendance_records;
create trigger trg_attendance_parent_cleanup
after update of parent_confirmed, child_id, scout_name or delete on public.attendance_records
for each row
execute procedure public.cleanup_carpool_passengers_for_attendance();

create or replace function public.set_parent_confirmation(
    p_outing_id uuid,
    p_child_id uuid,
    p_scout_name text,
    p_confirmed boolean
)
returns public.attendance_records
language plpgsql
security definer
set search_path = public
as $$
declare
    v_now timestamptz := timezone('utc', now());
    v_record public.attendance_records;
begin
    insert into public.attendance_records (
        outing_id,
        scout_name,
        status,
        notes,
        marked_by,
        scout_team,
        marked_at,
        child_id,
        parent_confirmed,
        parent_confirmed_at
    )
    values (
        p_outing_id,
        p_scout_name,
        'present',
        '',
        'parent',
        null,
        v_now,
        p_child_id,
        p_confirmed,
        case when p_confirmed then v_now else null end
    )
    on conflict (outing_id, scout_name)
    do update set
        child_id = coalesce(excluded.child_id, public.attendance_records.child_id),
        parent_confirmed = excluded.parent_confirmed,
        parent_confirmed_at = case
            when excluded.parent_confirmed = false then null
            when public.attendance_records.parent_confirmed = false and excluded.parent_confirmed = true then v_now
            else coalesce(public.attendance_records.parent_confirmed_at, v_now)
        end
    returning * into v_record;

    return v_record;
end;
$$;

grant execute on function public.set_parent_confirmation(uuid, uuid, text, boolean) to anon, authenticated;

create or replace function public.set_parent_confirmation(
    p_outing_id uuid,
    p_scout_name text,
    p_confirmed boolean
)
returns public.attendance_records
language plpgsql
security definer
set search_path = public
as $$
begin
    return public.set_parent_confirmation(
        p_outing_id => p_outing_id,
        p_child_id => null,
        p_scout_name => p_scout_name,
        p_confirmed => p_confirmed
    );
end;
$$;

grant execute on function public.set_parent_confirmation(uuid, text, boolean) to anon, authenticated;

create or replace function public.clear_attendance_with_secret(
    p_secret text,
    p_outing_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.verify_outing_secret(p_secret) then
        raise exception 'Invalid outing secret';
    end if;

    delete from public.attendance_records
    where outing_id = p_outing_id;
end;
$$;

grant execute on function public.clear_attendance_with_secret(text, uuid) to anon, authenticated;

-- ========================================
-- Row Level Security
-- ========================================
alter table public.outings enable row level security;
alter table public.carpool_drivers enable row level security;
alter table public.carpool_passengers enable row level security;
alter table public.attendance_records enable row level security;
alter table public.outing_secrets enable row level security;

do $$
begin
    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'outings'
          and policyname = 'Anon can read outings'
    ) then
        execute $sql$
            create policy "Anon can read outings"
                on public.outings
                for select
                using (true)
        $sql$;
    end if;

    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'carpool_drivers'
          and policyname = 'Anon can read carpool drivers'
    ) then
        execute $sql$
            create policy "Anon can read carpool drivers"
                on public.carpool_drivers
                for select
                using (true)
        $sql$;
    end if;

    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'carpool_passengers'
          and policyname = 'Anon can read carpool passengers'
    ) then
        execute $sql$
            create policy "Anon can read carpool passengers"
                on public.carpool_passengers
                for select
                using (true)
        $sql$;
    end if;

    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'attendance_records'
          and policyname = 'Anon can read attendance'
    ) then
        execute $sql$
            create policy "Anon can read attendance"
                on public.attendance_records
                for select
                using (true)
        $sql$;
    end if;

    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'outings'
          and policyname = 'Authenticated write outings'
    ) then
        execute $sql$
            create policy "Authenticated write outings"
                on public.outings
                for all
                using (auth.role() = 'authenticated' or auth.role() = 'service_role')
                with check (auth.role() = 'authenticated' or auth.role() = 'service_role')
        $sql$;
    end if;

    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'carpool_drivers'
          and policyname = 'Authenticated write carpool drivers'
    ) then
        execute $sql$
            create policy "Authenticated write carpool drivers"
                on public.carpool_drivers
                for all
                using (auth.role() = 'authenticated' or auth.role() = 'service_role')
                with check (auth.role() = 'authenticated' or auth.role() = 'service_role')
        $sql$;
    end if;

    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'carpool_passengers'
          and policyname = 'Authenticated write carpool passengers'
    ) then
        execute $sql$
            create policy "Authenticated write carpool passengers"
                on public.carpool_passengers
                for all
                using (auth.role() = 'authenticated' or auth.role() = 'service_role')
                with check (auth.role() = 'authenticated' or auth.role() = 'service_role')
        $sql$;
    end if;

    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'attendance_records'
          and policyname = 'Authenticated write attendance'
    ) then
        execute $sql$
            create policy "Authenticated write attendance"
                on public.attendance_records
                for all
                using (auth.role() = 'authenticated' or auth.role() = 'service_role')
                with check (auth.role() = 'authenticated' or auth.role() = 'service_role')
        $sql$;
    end if;

    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'outing_secrets'
          and policyname = 'Service role manage outing secrets'
    ) then
        execute $sql$
            create policy "Service role manage outing secrets"
                on public.outing_secrets
                for all
                using (auth.role() = 'service_role')
                with check (auth.role() = 'service_role')
        $sql$;
    end if;
end
$$;

-- Helper function to set the shared secret (run manually with service role).
-- Example: select public.set_outing_secret('Scout2025!');
create or replace function public.set_outing_secret(p_secret text, p_label text default 'default')
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.outing_secrets (label, secret_hash, active)
    values (
        p_label,
        crypt(p_secret, gen_salt('bf')),
        true
    );
end;
$$;

grant execute on function public.set_outing_secret(text, text) to service_role;


