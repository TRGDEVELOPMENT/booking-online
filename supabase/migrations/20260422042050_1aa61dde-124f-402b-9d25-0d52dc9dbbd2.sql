
-- ============================================================
-- IT Admin: Cross-company access (RLS bypass via additional policies)
-- IT role can SELECT/INSERT/UPDATE/DELETE on all tables across all companies.
-- ============================================================

-- Helper: stable check for IT role (already exists as has_role, but we add an alias for clarity)
-- We rely on existing public.has_role(_user_id, _role) function.

-- ----- profiles -----
CREATE POLICY "IT can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role));

CREATE POLICY "IT can insert any profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'it'::app_role));

CREATE POLICY "IT can update any profile"
ON public.profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'it'::app_role));

CREATE POLICY "IT can delete any profile"
ON public.profiles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role));

-- ----- user_roles -----
CREATE POLICY "IT can manage all user_roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'it'::app_role));

-- ----- reservations -----
CREATE POLICY "IT can manage all reservations"
ON public.reservations FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'it'::app_role));

-- ----- reservation_assignments -----
CREATE POLICY "IT can manage all reservation_assignments"
ON public.reservation_assignments FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'it'::app_role));

-- ----- reservation_attachments -----
CREATE POLICY "IT can manage all reservation_attachments"
ON public.reservation_attachments FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'it'::app_role));

-- ----- reservation_activity_logs -----
CREATE POLICY "IT can view all activity logs"
ON public.reservation_activity_logs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role));

CREATE POLICY "IT can insert any activity log"
ON public.reservation_activity_logs FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'it'::app_role));

-- ----- branches -----
CREATE POLICY "IT can manage all branches"
ON public.branches FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'it'::app_role));

-- ----- customers -----
CREATE POLICY "IT can manage all customers"
ON public.customers FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'it'::app_role));

-- ----- models -----
CREATE POLICY "IT can manage all models"
ON public.models FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'it'::app_role));

-- ----- sub_models -----
CREATE POLICY "IT can manage all sub_models"
ON public.sub_models FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'it'::app_role));

-- ----- colors -----
CREATE POLICY "IT can manage all colors"
ON public.colors FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'it'::app_role));

-- ----- vehicle_types -----
CREATE POLICY "IT can manage all vehicle_types"
ON public.vehicle_types FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'it'::app_role));

-- ----- engine_sizes -----
CREATE POLICY "IT can manage all engine_sizes"
ON public.engine_sizes FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'it'::app_role));

-- ----- standard_prices -----
CREATE POLICY "IT can manage all standard_prices"
ON public.standard_prices FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'it'::app_role));

-- ----- accessories -----
CREATE POLICY "IT can manage all accessories"
ON public.accessories FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'it'::app_role));

-- ----- benefits -----
CREATE POLICY "IT can manage all benefits"
ON public.benefits FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'it'::app_role));

-- ----- freebies -----
CREATE POLICY "IT can manage all freebies"
ON public.freebies FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'it'::app_role));

-- ----- installment_periods -----
CREATE POLICY "IT can manage all installment_periods"
ON public.installment_periods FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'it'::app_role));

-- ----- sales_teams -----
CREATE POLICY "IT can manage all sales_teams"
ON public.sales_teams FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'it'::app_role));

-- ----- sales_team_members -----
CREATE POLICY "IT can manage all sales_team_members"
ON public.sales_team_members FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'it'::app_role));

-- ----- team_approval_templates -----
CREATE POLICY "IT can manage all team_approval_templates"
ON public.team_approval_templates FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'it'::app_role));

-- ----- team_cancel_approval_templates -----
CREATE POLICY "IT can manage all team_cancel_approval_templates"
ON public.team_cancel_approval_templates FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'it'::app_role));

-- ----- user_groups -----
CREATE POLICY "IT can manage all user_groups"
ON public.user_groups FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'it'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'it'::app_role));
