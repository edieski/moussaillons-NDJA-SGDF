-- Migration to add is_adult column to carpool_passengers table
-- This allows tracking adult participants (chefs, parents, etc.) in the same table as children

-- ========================================
-- Add is_adult column
-- ========================================
ALTER TABLE public.carpool_passengers
ADD COLUMN IF NOT EXISTS is_adult boolean NOT NULL DEFAULT false;

-- ========================================
-- Add comment
-- ========================================
COMMENT ON COLUMN public.carpool_passengers.is_adult IS 'True for adult participants (chefs, parents), false for children. When true, child_id should be NULL and child_name contains the adult name.';

-- ========================================
-- Create index for filtering adults
-- ========================================
CREATE INDEX IF NOT EXISTS carpool_passengers_is_adult_idx ON public.carpool_passengers (is_adult);

