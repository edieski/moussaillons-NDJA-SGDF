-- Fix Row Level Security policies for carpool tables
-- This allows operations on carpool_drivers and carpool_passengers tables

-- ========================================
-- Enable RLS (if not already enabled)
-- ========================================
ALTER TABLE public.carpool_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carpool_passengers ENABLE ROW LEVEL SECURITY;

-- ========================================
-- Drop existing policies if they exist
-- ========================================
DROP POLICY IF EXISTS "Allow all operations on carpool_drivers" ON public.carpool_drivers;
DROP POLICY IF EXISTS "Allow all operations on carpool_passengers" ON public.carpool_passengers;

-- ========================================
-- Create permissive policies for carpool_drivers
-- ========================================
CREATE POLICY "Allow all operations on carpool_drivers"
ON public.carpool_drivers
FOR ALL
USING (true)
WITH CHECK (true);

-- ========================================
-- Create permissive policies for carpool_passengers
-- ========================================
CREATE POLICY "Allow all operations on carpool_passengers"
ON public.carpool_passengers
FOR ALL
USING (true)
WITH CHECK (true);

-- ========================================
-- Optional: More granular policies (comment out if using the above)
-- ========================================
-- If you want more security, uncomment these and comment out the "Allow all" policies above:

-- Allow anyone to read drivers
-- CREATE POLICY "Anyone can read carpool_drivers"
-- ON public.carpool_drivers
-- FOR SELECT
-- USING (true);

-- Allow anyone to insert drivers
-- CREATE POLICY "Anyone can insert carpool_drivers"
-- ON public.carpool_drivers
-- FOR INSERT
-- WITH CHECK (true);

-- Allow anyone to update drivers
-- CREATE POLICY "Anyone can update carpool_drivers"
-- ON public.carpool_drivers
-- FOR UPDATE
-- USING (true)
-- WITH CHECK (true);

-- Allow anyone to delete drivers
-- CREATE POLICY "Anyone can delete carpool_drivers"
-- ON public.carpool_drivers
-- FOR DELETE
-- USING (true);

-- Same for passengers
-- CREATE POLICY "Anyone can read carpool_passengers"
-- ON public.carpool_passengers
-- FOR SELECT
-- USING (true);

-- CREATE POLICY "Anyone can insert carpool_passengers"
-- ON public.carpool_passengers
-- FOR INSERT
-- WITH CHECK (true);

-- CREATE POLICY "Anyone can update carpool_passengers"
-- ON public.carpool_passengers
-- FOR UPDATE
-- USING (true)
-- WITH CHECK (true);

-- CREATE POLICY "Anyone can delete carpool_passengers"
-- ON public.carpool_passengers
-- FOR DELETE
-- USING (true);
