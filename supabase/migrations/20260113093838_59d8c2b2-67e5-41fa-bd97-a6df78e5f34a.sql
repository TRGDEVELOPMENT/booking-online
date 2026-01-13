-- Add status column to vehicle_types table
ALTER TABLE public.vehicle_types 
ADD COLUMN status text NOT NULL DEFAULT 'active' 
CHECK (status IN ('active', 'inactive'));

-- Update existing records to have 'active' status
UPDATE public.vehicle_types SET status = 'active' WHERE status IS NULL;