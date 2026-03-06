-- Migration to add is_logistics flag to carpool_drivers table
-- This marks cars that are reserved for material / logistics only.

alter table public.carpool_drivers
add column if not exists is_logistics boolean not null default false;

comment on column public.carpool_drivers.is_logistics is 'True when the car is reserved for material/logistics only (no children or adult passengers).';

