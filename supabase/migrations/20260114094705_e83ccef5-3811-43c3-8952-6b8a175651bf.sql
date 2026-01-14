-- Remove company_id constraint from surnames table
-- First, drop existing RLS policies
DROP POLICY IF EXISTS "Users can view surnames from their company" ON public.surnames;
DROP POLICY IF EXISTS "Users can create surnames for their company" ON public.surnames;
DROP POLICY IF EXISTS "Users can update surnames from their company" ON public.surnames;
DROP POLICY IF EXISTS "Users can delete surnames from their company" ON public.surnames;

-- Remove company_id column
ALTER TABLE public.surnames DROP COLUMN company_id;

-- Create new RLS policies for all authenticated users
CREATE POLICY "Authenticated users can view all surnames" 
ON public.surnames 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create surnames" 
ON public.surnames 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update surnames" 
ON public.surnames 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete surnames" 
ON public.surnames 
FOR DELETE 
TO authenticated
USING (true);