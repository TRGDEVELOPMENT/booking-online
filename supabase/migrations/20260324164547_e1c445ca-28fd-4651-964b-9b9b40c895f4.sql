
-- Add supervisor_id to profiles for default approval chain
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS supervisor_id uuid;
