-- =============================================
-- FIX BOOKING SETUP - Ejecutar en Supabase SQL Editor
-- =============================================
-- Este script verifica y corrige la configuración para que las reservas funcionen

-- 1. Verificar que la tabla staff existe, si no, crearla
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  color VARCHAR(7) DEFAULT '#E91E63',
  avatar_url TEXT,
  specialty VARCHAR(200),
  is_active BOOLEAN DEFAULT true,
  can_receive_appointments BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Verificar que staff_services existe
CREATE TABLE IF NOT EXISTS public.staff_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_id, service_id)
);

-- 3. Verificar que staff_schedules existe
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

-- 4. Verificar que staff_time_blocks existe
CREATE TABLE IF NOT EXISTS public.staff_time_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_datetime > start_datetime)
);

-- 5. Verificar que staff_special_dates existe
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

-- 6. Agregar columna staff_id a appointments si no existe
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL;

-- 7. Crear indices
CREATE INDEX IF NOT EXISTS idx_staff_active ON public.staff(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_services_staff ON public.staff_services(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_services_service ON public.staff_services(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_staff ON public.appointments(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_staff ON public.staff_schedules(staff_id);

-- 8. Habilitar RLS en las nuevas tablas
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_time_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_special_dates ENABLE ROW LEVEL SECURITY;

-- 9. Eliminar politicas existentes para evitar duplicados
DROP POLICY IF EXISTS "Public can read active staff" ON public.staff;
DROP POLICY IF EXISTS "Admins can do everything on staff" ON public.staff;
DROP POLICY IF EXISTS "Public can read staff_services" ON public.staff_services;
DROP POLICY IF EXISTS "Admins can do everything on staff_services" ON public.staff_services;
DROP POLICY IF EXISTS "Public can read staff_schedules" ON public.staff_schedules;
DROP POLICY IF EXISTS "Admins can do everything on staff_schedules" ON public.staff_schedules;
DROP POLICY IF EXISTS "Staff can manage own schedules" ON public.staff_schedules;
DROP POLICY IF EXISTS "Public can read staff_time_blocks" ON public.staff_time_blocks;
DROP POLICY IF EXISTS "Admins can do everything on staff_time_blocks" ON public.staff_time_blocks;
DROP POLICY IF EXISTS "Staff can manage own time_blocks" ON public.staff_time_blocks;
DROP POLICY IF EXISTS "Public can read staff_special_dates" ON public.staff_special_dates;
DROP POLICY IF EXISTS "Admins can do everything on staff_special_dates" ON public.staff_special_dates;
DROP POLICY IF EXISTS "Staff can manage own special_dates" ON public.staff_special_dates;

-- 10. Crear politicas RLS
CREATE POLICY "Public can read active staff" ON public.staff
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can do everything on staff" ON public.staff
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Public can read staff_services" ON public.staff_services
  FOR SELECT USING (true);

CREATE POLICY "Admins can do everything on staff_services" ON public.staff_services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Public can read staff_schedules" ON public.staff_schedules
  FOR SELECT USING (true);

CREATE POLICY "Admins can do everything on staff_schedules" ON public.staff_schedules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Public can read staff_time_blocks" ON public.staff_time_blocks
  FOR SELECT USING (true);

CREATE POLICY "Admins can do everything on staff_time_blocks" ON public.staff_time_blocks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Public can read staff_special_dates" ON public.staff_special_dates
  FOR SELECT USING (true);

CREATE POLICY "Admins can do everything on staff_special_dates" ON public.staff_special_dates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

-- 11. Crear un staff por defecto si no existe ninguno
INSERT INTO public.staff (name, specialty, color, is_active, can_receive_appointments)
SELECT 'Esthetic For Live', 'Especialista en Estética', '#E91E63', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.staff LIMIT 1);

-- 12. Asignar el staff a todos los servicios activos
INSERT INTO public.staff_services (staff_id, service_id)
SELECT s.id, srv.id
FROM public.staff s
CROSS JOIN public.services srv
WHERE srv.is_active = true
ON CONFLICT (staff_id, service_id) DO NOTHING;

-- 13. Crear horarios para el staff si no existen
INSERT INTO staff_schedules (staff_id, day_of_week, open_time, close_time, is_closed)
SELECT
  s.id,
  bh.day_of_week::varchar,
  bh.open_time,
  bh.close_time,
  bh.is_closed
FROM staff s
CROSS JOIN business_hours bh
ON CONFLICT (staff_id, day_of_week) DO NOTHING;

-- 14. Verificar el resultado
SELECT 'STAFF CREADOS:' as info, COUNT(*) as count FROM staff;
SELECT 'SERVICIOS CON STAFF:' as info, COUNT(DISTINCT service_id) as count FROM staff_services;
SELECT 'HORARIOS STAFF:' as info, COUNT(*) as count FROM staff_schedules;

-- Si ves que STAFF CREADOS > 0 y SERVICIOS CON STAFF > 0, las reservas deberían funcionar
SELECT 'SETUP COMPLETADO!' as resultado;
