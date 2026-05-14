
-- ============ PROFILES: restrict to authenticated ============
DROP POLICY IF EXISTS "Admin can update company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view company profiles" ON public.profiles;
DROP POLICY IF EXISTS "IT can delete any profile" ON public.profiles;
DROP POLICY IF EXISTS "IT can insert any profile" ON public.profiles;
DROP POLICY IF EXISTS "IT can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "IT can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin can view company profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'user_admin'::app_role) OR has_role(auth.uid(), 'it'::app_role)));
CREATE POLICY "Admin can update company profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'user_admin'::app_role) OR has_role(auth.uid(), 'it'::app_role)))
  WITH CHECK (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'user_admin'::app_role) OR has_role(auth.uid(), 'it'::app_role)));
CREATE POLICY "IT can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'it'::app_role));
CREATE POLICY "IT can insert any profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'it'::app_role));
CREATE POLICY "IT can update any profile" ON public.profiles
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'it'::app_role)) WITH CHECK (has_role(auth.uid(), 'it'::app_role));
CREATE POLICY "IT can delete any profile" ON public.profiles
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'it'::app_role));

-- ============ RESERVATIONS: restrict to authenticated ============
DROP POLICY IF EXISTS "IT can manage all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can create reservations for their company" ON public.reservations;
DROP POLICY IF EXISTS "Users can delete reservations from their company" ON public.reservations;
DROP POLICY IF EXISTS "Users can update reservations from their company" ON public.reservations;
DROP POLICY IF EXISTS "Users can view reservations from their company" ON public.reservations;

CREATE POLICY "Users can view reservations from their company" ON public.reservations
  FOR SELECT TO authenticated USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Users can create reservations for their company" ON public.reservations
  FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Users can update reservations from their company" ON public.reservations
  FOR UPDATE TO authenticated USING (company_id = get_user_company_id(auth.uid()))
  WITH CHECK (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Users can delete reservations from their company" ON public.reservations
  FOR DELETE TO authenticated USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "IT can manage all reservations" ON public.reservations
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'it'::app_role)) WITH CHECK (has_role(auth.uid(), 'it'::app_role));

-- ============ SURNAMES: harden write access ============
DROP POLICY IF EXISTS "Authenticated users can create surnames" ON public.surnames;
DROP POLICY IF EXISTS "Authenticated users can delete surnames" ON public.surnames;
DROP POLICY IF EXISTS "Authenticated users can update surnames" ON public.surnames;
DROP POLICY IF EXISTS "Authenticated users can view all surnames" ON public.surnames;

CREATE POLICY "Authenticated users can view all surnames" ON public.surnames
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create surnames" ON public.surnames
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can update surnames" ON public.surnames
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'user_admin'::app_role) OR has_role(auth.uid(), 'it'::app_role))
  WITH CHECK (has_role(auth.uid(), 'user_admin'::app_role) OR has_role(auth.uid(), 'it'::app_role));
CREATE POLICY "Admins can delete surnames" ON public.surnames
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'user_admin'::app_role) OR has_role(auth.uid(), 'it'::app_role));
