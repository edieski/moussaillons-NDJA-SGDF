-- Additional RPC functions for carpool management
-- These allow password-protected carpool operations similar to attendance
-- Run this in your Supabase SQL editor after applying schema.sql

-- ========================================
-- Carpool Driver Functions
-- ========================================

create or replace function public.add_driver_with_secret(
    p_secret text,
    p_outing_id uuid,
    p_name text,
    p_phone text,
    p_seats_available int,
    p_departure_location text,
    p_notes text,
    p_is_round_trip boolean,
    p_outbound_time text,
    p_return_time text
)
returns public.carpool_drivers
language plpgsql
security definer
set search_path = public
as $$
declare
    v_driver public.carpool_drivers;
begin
    if not public.verify_outing_secret(p_secret) then
        raise exception 'Invalid outing secret';
    end if;

    insert into public.carpool_drivers (
        outing_id,
        name,
        phone,
        seats_available,
        departure_location,
        notes,
        is_round_trip,
        outbound_time,
        return_time
    )
    values (
        p_outing_id,
        p_name,
        p_phone,
        coalesce(p_seats_available, 4),
        p_departure_location,
        p_notes,
        coalesce(p_is_round_trip, true),
        p_outbound_time,
        p_return_time
    )
    returning * into v_driver;

    return v_driver;
end;
$$;

grant execute on function public.add_driver_with_secret(
    text, uuid, text, text, int, text, text, boolean, text, text
) to anon, authenticated;

create or replace function public.update_driver_with_secret(
    p_secret text,
    p_driver_id uuid,
    p_name text,
    p_phone text,
    p_seats_available int,
    p_departure_location text,
    p_notes text,
    p_is_round_trip boolean,
    p_outbound_time text,
    p_return_time text
)
returns public.carpool_drivers
language plpgsql
security definer
set search_path = public
as $$
declare
    v_driver public.carpool_drivers;
begin
    if not public.verify_outing_secret(p_secret) then
        raise exception 'Invalid outing secret';
    end if;

    update public.carpool_drivers
    set name = coalesce(p_name, name),
        phone = coalesce(p_phone, phone),
        seats_available = coalesce(p_seats_available, seats_available),
        departure_location = coalesce(p_departure_location, departure_location),
        notes = coalesce(p_notes, notes),
        is_round_trip = coalesce(p_is_round_trip, is_round_trip),
        outbound_time = coalesce(p_outbound_time, outbound_time),
        return_time = coalesce(p_return_time, return_time)
    where id = p_driver_id
    returning * into v_driver;

    if not found then
        raise exception 'Driver % not found', p_driver_id;
    end if;

    return v_driver;
end;
$$;

grant execute on function public.update_driver_with_secret(
    text, uuid, text, text, int, text, text, boolean, text, text
) to anon, authenticated;

create or replace function public.delete_driver_with_secret(
    p_secret text,
    p_driver_id uuid
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

    delete from public.carpool_drivers where id = p_driver_id;
end;
$$;

grant execute on function public.delete_driver_with_secret(text, uuid) to anon, authenticated;

-- ========================================
-- Carpool Passenger Functions
-- ========================================

create or replace function public.add_passenger_with_secret(
    p_secret text,
    p_outing_id uuid,
    p_driver_id uuid,
    p_child_name text,
    p_guardian_name text,
    p_guardian_phone text,
    p_notes text,
    p_direction text
)
returns public.carpool_passengers
language plpgsql
security definer
set search_path = public
as $$
declare
    v_passenger public.carpool_passengers;
begin
    if not public.verify_outing_secret(p_secret) then
        raise exception 'Invalid outing secret';
    end if;

    insert into public.carpool_passengers (
        outing_id,
        driver_id,
        child_name,
        guardian_name,
        guardian_phone,
        notes,
        direction
    )
    values (
        p_outing_id,
        p_driver_id,
        p_child_name,
        p_guardian_name,
        p_guardian_phone,
        p_notes,
        p_direction
    )
    returning * into v_passenger;

    return v_passenger;
end;
$$;

grant execute on function public.add_passenger_with_secret(
    text, uuid, uuid, text, text, text, text, text
) to anon, authenticated;

create or replace function public.update_passenger_with_secret(
    p_secret text,
    p_passenger_id uuid,
    p_driver_id uuid,
    p_child_name text,
    p_guardian_name text,
    p_guardian_phone text,
    p_notes text,
    p_direction text
)
returns public.carpool_passengers
language plpgsql
security definer
set search_path = public
as $$
declare
    v_passenger public.carpool_passengers;
begin
    if not public.verify_outing_secret(p_secret) then
        raise exception 'Invalid outing secret';
    end if;

    update public.carpool_passengers
    set driver_id = coalesce(p_driver_id, driver_id),
        child_name = coalesce(p_child_name, child_name),
        guardian_name = coalesce(p_guardian_name, guardian_name),
        guardian_phone = coalesce(p_guardian_phone, guardian_phone),
        notes = coalesce(p_notes, notes),
        direction = coalesce(p_direction, direction)
    where id = p_passenger_id
    returning * into v_passenger;

    if not found then
        raise exception 'Passenger % not found', p_passenger_id;
    end if;

    return v_passenger;
end;
$$;

grant execute on function public.update_passenger_with_secret(
    text, uuid, uuid, text, text, text, text, text
) to anon, authenticated;

create or replace function public.delete_passenger_with_secret(
    p_secret text,
    p_passenger_id uuid
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

    delete from public.carpool_passengers where id = p_passenger_id;
end;
$$;

grant execute on function public.delete_passenger_with_secret(text, uuid) to anon, authenticated;
