-- Migration: Add direction flags to carpool drivers
-- Run this against the Supabase `public` schema.

alter table public.carpool_drivers
    add column if not exists supports_outbound boolean not null default false;

alter table public.carpool_drivers
    add column if not exists supports_return boolean not null default false;

update public.carpool_drivers
set supports_outbound = true,
    supports_return = true
where is_round_trip is true;

do $$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'carpool_drivers'
          and column_name = 'is_round_trip'
          and is_generated = 'NEVER'
    ) then
        execute 'alter table public.carpool_drivers alter column is_round_trip drop default';
        execute 'alter table public.carpool_drivers alter column is_round_trip add generated always as (supports_outbound and supports_return) stored';
    end if;
end
$$;

