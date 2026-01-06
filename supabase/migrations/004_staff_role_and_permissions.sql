-- =============================================
-- Migration: 004_staff_role_and_permissions
-- Description: Add staff role, portal access, and granular permissions system
-- =============================================

-- 1. Agregar rol 'staff' al enum user_role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'staff';

-- 2. Crear tabla de permisos de staff
CREATE TABLE IF NOT EXISTS public.staff_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,

  -- Permisos de citas
  can_view_appointments BOOLEAN DEFAULT true,
  can_confirm_appointments BOOLEAN DEFAULT true,
  can_complete_appointments BOOLEAN DEFAULT true,
  can_cancel_appointments BOOLEAN DEFAULT true,
  can_reschedule_appointments BOOLEAN DEFAULT false,

  -- Permisos de horarios
  can_edit_own_schedule BOOLEAN DEFAULT true,
  can_add_time_blocks BOOLEAN DEFAULT true,
  can_add_special_dates BOOLEAN DEFAULT true,

  -- Permisos de clientes
  can_view_client_info BOOLEAN DEFAULT true,
  can_view_client_history BOOLEAN DEFAULT false,

  -- Otros permisos
  can_view_reports BOOLEAN DEFAULT false,
  can_export_data BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(staff_id)
);

-- 3. Agregar campos de invitación y acceso a staff
ALTER TABLE public.staff
ADD COLUMN IF NOT EXISTS invitation_token UUID DEFAULT uuid_generate_v4(),
ADD COLUMN IF NOT EXISTS invitation_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS invitation_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS portal_access_enabled BOOLEAN DEFAULT false;

-- 4. Crear índices
CREATE INDEX IF NOT EXISTS idx_staff_invitation_token ON public.staff(invitation_token);
CREATE INDEX IF NOT EXISTS idx_staff_portal_access ON public.staff(portal_access_enabled);
CREATE INDEX IF NOT EXISTS idx_staff_permissions_staff ON public.staff_permissions(staff_id);

-- 5. Trigger para actualizar updated_at en staff_permissions
CREATE TRIGGER update_staff_permissions_updated_at
  BEFORE UPDATE ON public.staff_permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Trigger para crear permisos default al crear staff
CREATE OR REPLACE FUNCTION public.create_default_staff_permissions()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO staff_permissions (staff_id)
  VALUES (NEW.id)
  ON CONFLICT (staff_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_staff_permissions_on_insert
  AFTER INSERT ON public.staff
  FOR EACH ROW EXECUTE FUNCTION create_default_staff_permissions();

-- 7. Crear permisos para staff existentes
INSERT INTO staff_permissions (staff_id)
SELECT id FROM staff
ON CONFLICT (staff_id) DO NOTHING;

-- 8. Habilitar RLS en staff_permissions
ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;

-- 9. Políticas RLS para staff_permissions
CREATE POLICY "Admins can manage staff permissions" ON public.staff_permissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Staff can view own permissions" ON public.staff_permissions
  FOR SELECT USING (
    staff_id IN (SELECT id FROM staff WHERE profile_id = auth.uid())
  );

-- 10. Staff puede ver sus propias citas (nueva política)
CREATE POLICY "Staff can view own appointments" ON public.appointments
  FOR SELECT USING (
    staff_id IN (SELECT id FROM staff WHERE profile_id = auth.uid())
  );

-- 11. Staff puede actualizar estado de sus citas
CREATE POLICY "Staff can update own appointments status" ON public.appointments
  FOR UPDATE USING (
    staff_id IN (SELECT id FROM staff WHERE profile_id = auth.uid())
  )
  WITH CHECK (
    staff_id IN (SELECT id FROM staff WHERE profile_id = auth.uid())
  );

-- 12. Staff puede gestionar sus propios horarios
CREATE POLICY "Staff can manage own schedules via profile" ON public.staff_schedules
  FOR ALL USING (
    staff_id IN (SELECT id FROM staff WHERE profile_id = auth.uid())
  );

CREATE POLICY "Staff can manage own time_blocks via profile" ON public.staff_time_blocks
  FOR ALL USING (
    staff_id IN (SELECT id FROM staff WHERE profile_id = auth.uid())
  );

CREATE POLICY "Staff can manage own special_dates via profile" ON public.staff_special_dates
  FOR ALL USING (
    staff_id IN (SELECT id FROM staff WHERE profile_id = auth.uid())
  );

-- 13. Staff puede ver clientes de sus citas
CREATE POLICY "Staff can view clients of own appointments" ON public.clients
  FOR SELECT USING (
    id IN (
      SELECT client_id FROM appointments
      WHERE staff_id IN (SELECT id FROM staff WHERE profile_id = auth.uid())
    )
  );

-- 14. Función helper para verificar si usuario es staff con acceso activo
CREATE OR REPLACE FUNCTION public.is_active_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM staff
    WHERE profile_id = auth.uid()
    AND portal_access_enabled = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Función para obtener staff_id del usuario actual
CREATE OR REPLACE FUNCTION public.get_current_staff_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM staff
    WHERE profile_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Función para regenerar token de invitación
CREATE OR REPLACE FUNCTION public.regenerate_staff_invitation_token(p_staff_id UUID)
RETURNS UUID AS $$
DECLARE
  new_token UUID;
BEGIN
  new_token := uuid_generate_v4();

  UPDATE staff
  SET invitation_token = new_token,
      invitation_sent_at = NULL,
      invitation_accepted_at = NULL
  WHERE id = p_staff_id;

  RETURN new_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
