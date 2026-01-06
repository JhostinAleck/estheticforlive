import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { StaffSidebar } from '@/components/staff/StaffSidebar'

interface StaffPermissions {
  can_view_appointments: boolean
  can_edit_own_schedule: boolean
  can_add_time_blocks: boolean
  can_add_special_dates: boolean
}

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/staff')
  }

  const adminClient = createAdminClient()

  // Get staff record for current user
  const { data: staffData, error: staffError } = await adminClient
    .from('staff')
    .select('id, name, color, portal_access_enabled')
    .eq('profile_id', user.id)
    .single()

  if (staffError || !staffData) {
    // User is admin without staff record - redirect to admin
    redirect('/admin')
  }

  const staff = staffData as { id: string; name: string; color: string; portal_access_enabled: boolean }

  if (!staff.portal_access_enabled) {
    redirect('/acceso-revocado')
  }

  // Get permissions
  const { data: permissionsData } = await adminClient
    .from('staff_permissions')
    .select('can_view_appointments, can_edit_own_schedule, can_add_time_blocks, can_add_special_dates')
    .eq('staff_id', staff.id)
    .single()

  const defaultPermissions: StaffPermissions = {
    can_view_appointments: true,
    can_edit_own_schedule: true,
    can_add_time_blocks: true,
    can_add_special_dates: true,
  }

  const permissions: StaffPermissions = permissionsData ? (permissionsData as StaffPermissions) : defaultPermissions

  return (
    <div className="min-h-screen bg-surface">
      <StaffSidebar
        staffName={staff.name}
        staffColor={staff.color}
        permissions={permissions}
      />

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
