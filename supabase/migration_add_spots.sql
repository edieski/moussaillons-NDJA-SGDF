-- Migration to add adult_spots and kid_spots to carpool_drivers table

-- Add new columns
ALTER TABLE public.carpool_drivers
ADD COLUMN IF NOT EXISTS adult_spots int DEFAULT 0 CHECK (adult_spots >= 0),
ADD COLUMN IF NOT EXISTS kid_spots int DEFAULT 4 CHECK (kid_spots >= 0);

-- Update existing records to use kid_spots instead of seats_available
UPDATE public.carpool_drivers
SET kid_spots = seats_available
WHERE kid_spots = 0;

-- Keep seats_available for backward compatibility but it will be calculated as adult_spots + kid_spots
-- Or we can add a computed column/view later

COMMENT ON COLUMN public.carpool_drivers.adult_spots IS 'Number of spots available for adults';
COMMENT ON COLUMN public.carpool_drivers.kid_spots IS 'Number of spots available for kids';
