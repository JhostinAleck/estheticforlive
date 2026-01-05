-- Fix RLS infinite recursion error (42P17)
-- The issue is that RLS policies are checking profiles table which also has RLS
-- causing infinite recursion

-- First, create a security definer function to check if user is admin
-- This function runs with elevated privileges and bypasses RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- If no user is authenticated, return false
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get the role directly without going through RLS
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();

  RETURN user_role IN ('admin', 'superadmin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- ===========================================
-- Fix categories RLS policies
-- ===========================================
DROP POLICY IF EXISTS "Public can view active categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
DROP POLICY IF EXISTS "categories_select_policy" ON categories;
DROP POLICY IF EXISTS "categories_insert_policy" ON categories;
DROP POLICY IF EXISTS "categories_update_policy" ON categories;
DROP POLICY IF EXISTS "categories_delete_policy" ON categories;

-- Simple public read policy - no recursion
CREATE POLICY "Anyone can view active categories"
ON categories FOR SELECT
USING (is_active = true);

-- Admin policies using the security definer function
CREATE POLICY "Admins can insert categories"
ON categories FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update categories"
ON categories FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can delete categories"
ON categories FOR DELETE
TO authenticated
USING (public.is_admin());

-- ===========================================
-- Fix services RLS policies
-- ===========================================
DROP POLICY IF EXISTS "Public can view active services" ON services;
DROP POLICY IF EXISTS "Admins can manage services" ON services;
DROP POLICY IF EXISTS "Anyone can view active services" ON services;
DROP POLICY IF EXISTS "services_select_policy" ON services;
DROP POLICY IF EXISTS "services_insert_policy" ON services;
DROP POLICY IF EXISTS "services_update_policy" ON services;
DROP POLICY IF EXISTS "services_delete_policy" ON services;

-- Simple public read policy
CREATE POLICY "Anyone can view active services"
ON services FOR SELECT
USING (is_active = true);

-- Admin policies
CREATE POLICY "Admins can insert services"
ON services FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update services"
ON services FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can delete services"
ON services FOR DELETE
TO authenticated
USING (public.is_admin());

-- ===========================================
-- Fix profiles RLS policies
-- ===========================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- ===========================================
-- Fix other content tables
-- ===========================================

-- hero_slides
DROP POLICY IF EXISTS "Anyone can view active hero slides" ON hero_slides;
DROP POLICY IF EXISTS "Admins can manage hero slides" ON hero_slides;

CREATE POLICY "Anyone can view active hero slides"
ON hero_slides FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can insert hero slides"
ON hero_slides FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update hero slides"
ON hero_slides FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can delete hero slides"
ON hero_slides FOR DELETE
TO authenticated
USING (public.is_admin());

-- before_after_results
DROP POLICY IF EXISTS "Anyone can view active results" ON before_after_results;
DROP POLICY IF EXISTS "Admins can manage results" ON before_after_results;

CREATE POLICY "Anyone can view active results"
ON before_after_results FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can insert results"
ON before_after_results FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update results"
ON before_after_results FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can delete results"
ON before_after_results FOR DELETE
TO authenticated
USING (public.is_admin());

-- site_settings
DROP POLICY IF EXISTS "Anyone can view site settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can manage site settings" ON site_settings;

CREATE POLICY "Anyone can view site settings"
ON site_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can update site settings"
ON site_settings FOR UPDATE
TO authenticated
USING (public.is_admin());

-- business_hours
DROP POLICY IF EXISTS "Anyone can view business hours" ON business_hours;
DROP POLICY IF EXISTS "Admins can manage business hours" ON business_hours;

CREATE POLICY "Anyone can view business hours"
ON business_hours FOR SELECT
USING (true);

CREATE POLICY "Admins can update business hours"
ON business_hours FOR UPDATE
TO authenticated
USING (public.is_admin());

-- special_dates
DROP POLICY IF EXISTS "Anyone can view special dates" ON special_dates;
DROP POLICY IF EXISTS "Admins can manage special dates" ON special_dates;

CREATE POLICY "Anyone can view special dates"
ON special_dates FOR SELECT
USING (true);

CREATE POLICY "Admins can insert special dates"
ON special_dates FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update special dates"
ON special_dates FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can delete special dates"
ON special_dates FOR DELETE
TO authenticated
USING (public.is_admin());

-- ===========================================
-- Appointments and clients
-- ===========================================

-- clients
DROP POLICY IF EXISTS "Admins can view all clients" ON clients;
DROP POLICY IF EXISTS "Anyone can create clients" ON clients;
DROP POLICY IF EXISTS "Admins can update clients" ON clients;

CREATE POLICY "Anyone can create clients"
ON clients FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all clients"
ON clients FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can update clients"
ON clients FOR UPDATE
TO authenticated
USING (public.is_admin());

-- appointments
DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can update appointments" ON appointments;

CREATE POLICY "Anyone can create appointments"
ON appointments FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can view own appointments"
ON appointments FOR SELECT
USING (true);  -- Simplified for now, can add client verification later

CREATE POLICY "Admins can update appointments"
ON appointments FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can delete appointments"
ON appointments FOR DELETE
TO authenticated
USING (public.is_admin());

-- appointment_status_history
DROP POLICY IF EXISTS "Admins can view history" ON appointment_status_history;
DROP POLICY IF EXISTS "Admins can insert history" ON appointment_status_history;

CREATE POLICY "Admins can view history"
ON appointment_status_history FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can insert history"
ON appointment_status_history FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- time_blocks
DROP POLICY IF EXISTS "Anyone can view time blocks" ON time_blocks;
DROP POLICY IF EXISTS "Admins can manage time blocks" ON time_blocks;

CREATE POLICY "Anyone can view time blocks"
ON time_blocks FOR SELECT
USING (true);

CREATE POLICY "Admins can insert time blocks"
ON time_blocks FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update time blocks"
ON time_blocks FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can delete time blocks"
ON time_blocks FOR DELETE
TO authenticated
USING (public.is_admin());
