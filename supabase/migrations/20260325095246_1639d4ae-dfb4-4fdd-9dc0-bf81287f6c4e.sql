
-- Add username and email columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Create unique index on username per company
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_company_unique 
  ON public.profiles(username, company_id) WHERE username IS NOT NULL;

-- Update handle_new_user to store username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, company_id, branch_id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_id', 'BPK'),
    NEW.raw_user_meta_data->>'branch_id',
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'contact_email'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'sale')
  );
  
  RETURN NEW;
END;
$$;
