-- =============================================
-- Migration: 003_staff_availability
-- Description: Add per-staff availability and time blocks
-- =============================================

-- 1. Create staff_schedules table (per-staff business hours)
CREATE TABLE IF NOT EXISTS public.staff_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  open_time TIME NOT NULL DEFAULT '09:00:00',
  close_time TIME NOT NULL DEFAULT '18:00:00',
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_id, day_of_week)
);

-- 2. Create staff_time_blocks table (per-staff blocked times)
CREATE TABLE IF NOT EXISTS public.staff_time_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_datetime > start_datetime)
);

-- 3. Create staff_special_dates table (per-staff holidays/vacations)
CREATE TABLE IF NOT EXISTS public.staff_special_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description VARCHAR(255),
  is_closed BOOLEAN DEFAULT true,
  open_time TIME,
  close_time TIME,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_id, date)
);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_staff_schedules_staff ON public.staff_schedules(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_day ON public.staff_schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_staff_time_blocks_staff ON public.staff_time_blocks(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_time_blocks_datetime ON public.staff_time_blocks(start_datetime, end_datetime);
CREATE INDEX IF NOT EXISTS idx_staff_special_dates_staff ON public.staff_special_dates(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_special_dates_date ON public.staff_special_dates(date);

-- 5. Create triggers for updated_at
CREATE TRIGGER update_staff_schedules_updated_at
  BEFORE UPDATE ON public.staff_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Enable RLS
ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_time_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_special_dates ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for staff_schedules
CREATE POLICY "Public can read staff_schedules" ON public.staff_schedules
  FOR SELECT USING (true);

CREATE POLICY "Admins can do everything on staff_schedules" ON public.staff_schedules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Staff can manage own schedules" ON public.staff_schedules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM staff WHERE profile_id = auth.uid() AND id = staff_id)
  );

-- 8. Create RLS policies for staff_time_blocks
CREATE POLICY "Public can read staff_time_blocks" ON public.staff_time_blocks
  FOR SELECT USING (true);

CREATE POLICY "Admins can do everything on staff_time_blocks" ON public.staff_time_blocks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Staff can manage own time_blocks" ON public.staff_time_blocks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM staff WHERE profile_id = auth.uid() AND id = staff_id)
  );

-- 9. Create RLS policies for staff_special_dates
CREATE POLICY "Public can read staff_special_dates" ON public.staff_special_dates
  FOR SELECT USING (true);

CREATE POLICY "Admins can do everything on staff_special_dates" ON public.staff_special_dates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Staff can manage own special_dates" ON public.staff_special_dates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM staff WHERE profile_id = auth.uid() AND id = staff_id)
  );

-- 10. Function to initialize staff schedules when a new staff member is created
CREATE OR REPLACE FUNCTION public.initialize_staff_schedules()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default schedules for each day based on global business_hours
  INSERT INTO staff_schedules (staff_id, day_of_week, open_time, close_time, is_closed)
  SELECT
    NEW.id,
    bh.day_of_week,
    bh.open_time,
    bh.close_time,
    bh.is_closed
  FROM business_hours bh
  ON CONFLICT (staff_id, day_of_week) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Trigger to auto-create schedules for new staff
CREATE TRIGGER create_staff_schedules_on_insert
  AFTER INSERT ON public.staff
  FOR EACH ROW EXECUTE FUNCTION initialize_staff_schedules();

-- 12. Initialize schedules for existing staff members
INSERT INTO staff_schedules (staff_id, day_of_week, open_time, close_time, is_closed)
SELECT
  s.id,
  bh.day_of_week,
  bh.open_time,
  bh.close_time,
  bh.is_closed
FROM staff s
CROSS JOIN business_hours bh
ON CONFLICT (staff_id, day_of_week) DO NOTHING;
