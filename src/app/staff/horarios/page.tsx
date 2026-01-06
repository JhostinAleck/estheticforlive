import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { StaffWeeklySchedule } from '@/components/admin/staff/StaffWeeklySchedule'
import { StaffTimeBlocks } from '@/components/admin/staff/StaffTimeBlocks'
import { StaffSpecialDates } from '@/components/admin/staff/StaffSpecialDates'

export default async function StaffHorariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const adminClient = createAdminClient()

  // Get staff record
  const { data: staffData } = await adminClient
    .from('staff')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!staffData) redirect('/admin')

  const staff = staffData as { id: string }

  // Get permissions
  const { data: permissionsData } = await adminClient
    .from('staff_permissions')
    .select('can_edit_own_schedule, can_add_time_blocks, can_add_special_dates')
    .eq('staff_id', staff.id)
    .single()

  const defaultPermissions = {
    can_edit_own_schedule: true,
    can_add_time_blocks: true,
    can_add_special_dates: true,
  }

  const permissions = permissionsData ? (permissionsData as typeof defaultPermissions) : defaultPermissions

  // Check if user has any schedule permissions
  const hasAnyPermission = permissions.can_edit_own_schedule ||
    permissions.can_add_time_blocks ||
    permissions.can_add_special_dates

  if (!hasAnyPermission) {
    redirect('/staff')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary">Mis Horarios</h1>
        <p className="text-muted">Gestiona tu disponibilidad y bloqueos</p>
      </div>

      {/* Weekly Schedule */}
      {permissions.can_edit_own_schedule && (
        <div className="bg-white rounded-2xl border border-border p-4 md:p-6">
          <h2 className="text-lg font-semibold text-secondary mb-4">Horario Semanal</h2>
          <p className="text-sm text-muted mb-4">
            Define tus horas de trabajo para cada dia de la semana.
          </p>
          <StaffWeeklySchedule staffId={staff.id} isAdmin={false} />
        </div>
      )}

      {/* Time Blocks */}
      {permissions.can_add_time_blocks && (
        <div className="bg-white rounded-2xl border border-border p-4 md:p-6">
          <h2 className="text-lg font-semibold text-secondary mb-4">Bloqueos de Tiempo</h2>
          <StaffTimeBlocks staffId={staff.id} />
        </div>
      )}

      {/* Special Dates */}
      {permissions.can_add_special_dates && (
        <div className="bg-white rounded-2xl border border-border p-4 md:p-6">
          <h2 className="text-lg font-semibold text-secondary mb-4">Fechas Especiales</h2>
          <StaffSpecialDates staffId={staff.id} />
        </div>
      )}
    </div>
  )
}
