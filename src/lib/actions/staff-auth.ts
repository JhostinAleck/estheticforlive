'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { sendStaffInvitation } from '@/lib/email/send'

interface ActionResult {
  success: boolean
  error?: string
}

interface StaffPermissions {
  can_view_appointments: boolean
  can_confirm_appointments: boolean
  can_complete_appointments: boolean
  can_cancel_appointments: boolean
  can_reschedule_appointments: boolean
  can_edit_own_schedule: boolean
  can_add_time_blocks: boolean
  can_add_special_dates: boolean
  can_view_client_info: boolean
  can_view_client_history: boolean
  can_view_reports: boolean
  can_export_data: boolean
}

interface StaffRecord {
  id: string
  name: string
  email: string | null
  phone: string | null
  color: string
  specialty: string | null
  profile_id: string | null
  portal_access_enabled: boolean
  invitation_sent_at: string | null
  invitation_accepted_at: string | null
}

// Verificar si el usuario actual es admin
async function verifyAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile as { role: string } | null)?.role
  return role === 'admin' || role === 'superadmin'
}

// Invitar a un staff member al portal
export async function inviteStaffMember(staffId: string): Promise<ActionResult> {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  const adminClient = createAdminClient()

  // Obtener datos del staff
  const { data: staffData, error: staffError } = await adminClient
    .from('staff')
    .select('id, name, email, invitation_token, profile_id')
    .eq('id', staffId)
    .single()

  if (staffError || !staffData) {
    return { success: false, error: 'Staff no encontrado' }
  }

  const staff = staffData as { id: string; name: string; email: string | null; invitation_token: string; profile_id: string | null }

  if (!staff.email) {
    return { success: false, error: 'El staff debe tener un email para recibir la invitación' }
  }

  if (staff.profile_id) {
    return { success: false, error: 'Este staff ya tiene una cuenta vinculada' }
  }

  // Regenerar token de invitación
  const newToken = crypto.randomUUID()

  const { error: updateError } = await adminClient
    .from('staff')
    .update({
      invitation_token: newToken,
      invitation_sent_at: new Date().toISOString(),
      invitation_accepted_at: null,
    } as never)
    .eq('id', staffId)

  if (updateError) {
    console.error('Error updating invitation token:', updateError)
    return { success: false, error: 'Error al generar invitación' }
  }

  // Enviar email de invitación
  try {
    await sendStaffInvitation({
      to: staff.email,
      staffName: staff.name,
      token: newToken,
    })
  } catch (emailError) {
    console.error('Error sending invitation email:', emailError)
    return { success: false, error: 'Error al enviar email de invitación' }
  }

  revalidatePath(`/admin/personal/${staffId}`)
  return { success: true }
}

// Reenviar invitación
export async function resendStaffInvitation(staffId: string): Promise<ActionResult> {
  return inviteStaffMember(staffId)
}

// Verificar token de invitación
export async function verifyInvitationToken(token: string): Promise<{
  valid: boolean
  staff?: { id: string; name: string; email: string }
  error?: string
}> {
  const adminClient = createAdminClient()

  const { data: staffData, error } = await adminClient
    .from('staff')
    .select('id, name, email, invitation_accepted_at')
    .eq('invitation_token', token)
    .single()

  if (error || !staffData) {
    return { valid: false, error: 'Token inválido o expirado' }
  }

  const staff = staffData as { id: string; name: string; email: string | null; invitation_accepted_at: string | null }

  if (staff.invitation_accepted_at) {
    return { valid: false, error: 'Esta invitación ya fue utilizada' }
  }

  if (!staff.email) {
    return { valid: false, error: 'El staff no tiene email configurado' }
  }

  return {
    valid: true,
    staff: {
      id: staff.id,
      name: staff.name,
      email: staff.email,
    },
  }
}

// Aceptar invitación y crear cuenta
export async function acceptStaffInvitation(
  token: string,
  password: string
): Promise<ActionResult & { redirectTo?: string }> {
  // Verificar token
  const verification = await verifyInvitationToken(token)
  if (!verification.valid || !verification.staff) {
    return { success: false, error: verification.error || 'Token inválido' }
  }

  const { staff } = verification
  const adminClient = createAdminClient()

  // Crear usuario en Supabase Auth usando Admin API
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: staff.email,
    password: password,
    email_confirm: true, // Auto-confirmar el email
    user_metadata: {
      full_name: staff.name,
    },
  })

  if (authError) {
    // Si el usuario ya existe, intentar actualizar la contraseña
    if (authError.message.includes('already been registered')) {
      // Buscar usuario existente
      const { data: existingUsers } = await adminClient.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find(u => u.email === staff.email)

      if (existingUser) {
        // Actualizar contraseña
        const { error: updateError } = await adminClient.auth.admin.updateUserById(
          existingUser.id,
          { password: password }
        )

        if (updateError) {
          console.error('Error updating password:', updateError)
          return { success: false, error: 'Error al configurar la cuenta' }
        }

        // Actualizar profile role
        await adminClient
          .from('profiles')
          .update({ role: 'staff' } as never)
          .eq('id', existingUser.id)

        // Vincular staff con profile
        await adminClient
          .from('staff')
          .update({
            profile_id: existingUser.id,
            portal_access_enabled: true,
            invitation_accepted_at: new Date().toISOString(),
          } as never)
          .eq('id', staff.id)

        return { success: true, redirectTo: '/staff' }
      }
    }

    console.error('Error creating auth user:', authError)
    return { success: false, error: 'Error al crear la cuenta: ' + authError.message }
  }

  if (!authData.user) {
    return { success: false, error: 'Error al crear usuario' }
  }

  // Actualizar profile con rol staff
  await adminClient
    .from('profiles')
    .update({ role: 'staff' } as never)
    .eq('id', authData.user.id)

  // Vincular staff con el profile creado
  const { error: linkError } = await adminClient
    .from('staff')
    .update({
      profile_id: authData.user.id,
      portal_access_enabled: true,
      invitation_accepted_at: new Date().toISOString(),
    } as never)
    .eq('id', staff.id)

  if (linkError) {
    console.error('Error linking staff to profile:', linkError)
    return { success: false, error: 'Error al vincular cuenta' }
  }

  return { success: true, redirectTo: '/staff' }
}

// Revocar acceso de un staff
export async function revokeStaffAccess(staffId: string): Promise<ActionResult> {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('staff')
    .update({ portal_access_enabled: false } as never)
    .eq('id', staffId)

  if (error) {
    console.error('Error revoking access:', error)
    return { success: false, error: 'Error al revocar acceso' }
  }

  revalidatePath(`/admin/personal/${staffId}`)
  return { success: true }
}

// Reactivar acceso de un staff
export async function enableStaffAccess(staffId: string): Promise<ActionResult> {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  const adminClient = createAdminClient()

  // Verificar que el staff tiene profile_id (ha aceptado la invitación)
  const { data: staffData } = await adminClient
    .from('staff')
    .select('profile_id')
    .eq('id', staffId)
    .single()

  const staff = staffData as { profile_id: string | null } | null

  if (!staff?.profile_id) {
    return { success: false, error: 'El staff no ha aceptado la invitación aún' }
  }

  const { error } = await adminClient
    .from('staff')
    .update({ portal_access_enabled: true } as never)
    .eq('id', staffId)

  if (error) {
    console.error('Error enabling access:', error)
    return { success: false, error: 'Error al reactivar acceso' }
  }

  revalidatePath(`/admin/personal/${staffId}`)
  return { success: true }
}

// Obtener permisos de un staff
export async function getStaffPermissions(staffId: string): Promise<StaffPermissions | null> {
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('staff_permissions')
    .select('*')
    .eq('staff_id', staffId)
    .single()

  if (error || !data) {
    return null
  }

  return data as StaffPermissions
}

// Actualizar permisos de un staff
export async function updateStaffPermissions(
  staffId: string,
  permissions: Partial<StaffPermissions>
): Promise<ActionResult> {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('staff_permissions')
    .update({
      ...permissions,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('staff_id', staffId)

  if (error) {
    console.error('Error updating permissions:', error)
    return { success: false, error: 'Error al actualizar permisos' }
  }

  revalidatePath(`/admin/personal/${staffId}`)
  return { success: true }
}

// Obtener el staff record del usuario actual
export async function getCurrentStaffRecord(): Promise<StaffRecord | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('staff')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  if (error || !data) return null

  return data as StaffRecord
}

// Obtener permisos del usuario staff actual
export async function getCurrentStaffPermissions(): Promise<StaffPermissions | null> {
  const staff = await getCurrentStaffRecord()
  if (!staff) return null

  return getStaffPermissions(staff.id)
}

// Verificar si el usuario actual es staff con acceso activo
export async function isActiveStaff(): Promise<boolean> {
  const staff = await getCurrentStaffRecord()
  return staff !== null && staff.portal_access_enabled === true
}

// Obtener estado de acceso del staff (para mostrar en admin)
export async function getStaffAccessStatus(staffId: string): Promise<{
  hasEmail: boolean
  hasAccount: boolean
  invitationPending: boolean
  accessEnabled: boolean
  invitationSentAt: string | null
  invitationAcceptedAt: string | null
} | null> {
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('staff')
    .select('email, profile_id, portal_access_enabled, invitation_sent_at, invitation_accepted_at')
    .eq('id', staffId)
    .single()

  if (error || !data) return null

  const staff = data as {
    email: string | null
    profile_id: string | null
    portal_access_enabled: boolean
    invitation_sent_at: string | null
    invitation_accepted_at: string | null
  }

  return {
    hasEmail: !!staff.email,
    hasAccount: !!staff.profile_id,
    invitationPending: !!staff.invitation_sent_at && !staff.invitation_accepted_at,
    accessEnabled: staff.portal_access_enabled,
    invitationSentAt: staff.invitation_sent_at,
    invitationAcceptedAt: staff.invitation_accepted_at,
  }
}

// Vincular cuenta existente a un staff record (para admins que quieren ser staff también)
export async function linkCurrentUserToStaff(staffId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No hay sesión activa' }
  }

  const adminClient = createAdminClient()

  // Verificar que el usuario actual es admin
  const { data: profileData } = await adminClient
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .single()

  const profile = profileData as { role: string; email: string } | null

  if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
    return { success: false, error: 'Solo los admins pueden vincular su cuenta directamente' }
  }

  // Verificar que el staff no tiene ya una cuenta vinculada
  const { data: staffData, error: staffError } = await adminClient
    .from('staff')
    .select('id, profile_id, email')
    .eq('id', staffId)
    .single()

  if (staffError || !staffData) {
    return { success: false, error: 'Staff no encontrado' }
  }

  const staff = staffData as { id: string; profile_id: string | null; email: string | null }

  if (staff.profile_id) {
    return { success: false, error: 'Este staff ya tiene una cuenta vinculada' }
  }

  // Verificar que ningún otro staff tiene el profile_id del admin
  const { data: existingStaff } = await adminClient
    .from('staff')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (existingStaff) {
    return { success: false, error: 'Tu cuenta ya está vinculada a otro colaborador' }
  }

  // Vincular staff con el profile del admin
  const { error: linkError } = await adminClient
    .from('staff')
    .update({
      profile_id: user.id,
      portal_access_enabled: true,
      email: staff.email || profile.email, // Asegurar que tenga email
      invitation_accepted_at: new Date().toISOString(),
    } as never)
    .eq('id', staffId)

  if (linkError) {
    console.error('Error linking admin to staff:', linkError)
    return { success: false, error: 'Error al vincular cuenta' }
  }

  revalidatePath(`/admin/personal/${staffId}`)
  return { success: true }
}

// Desvincular cuenta de un staff (admin puede desvincularse)
export async function unlinkStaffAccount(staffId: string): Promise<ActionResult> {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  const adminClient = createAdminClient()

  // Verificar que el staff tiene cuenta vinculada
  const { data: staffData } = await adminClient
    .from('staff')
    .select('profile_id')
    .eq('id', staffId)
    .single()

  const staff = staffData as { profile_id: string | null } | null

  if (!staff?.profile_id) {
    return { success: false, error: 'Este staff no tiene cuenta vinculada' }
  }

  // Verificar que el profile vinculado es admin (no degradar staff normales)
  const { data: profileData } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', staff.profile_id)
    .single()

  const profile = profileData as { role: string } | null

  // Desvincular
  const { error } = await adminClient
    .from('staff')
    .update({
      profile_id: null,
      portal_access_enabled: false,
      invitation_token: crypto.randomUUID(), // Nuevo token por si quiere re-invitarse
      invitation_sent_at: null,
      invitation_accepted_at: null,
    } as never)
    .eq('id', staffId)

  if (error) {
    console.error('Error unlinking staff:', error)
    return { success: false, error: 'Error al desvincular cuenta' }
  }

  // Si era un staff normal (no admin), cambiar su rol de vuelta a client
  if (profile && profile.role === 'staff') {
    await adminClient
      .from('profiles')
      .update({ role: 'client' } as never)
      .eq('id', staff.profile_id)
  }

  revalidatePath(`/admin/personal/${staffId}`)
  return { success: true }
}

// Buscar perfil de admin/user por email (para vincular cuenta existente)
export async function findUserByEmail(email: string): Promise<{
  found: boolean
  user?: {
    id: string
    email: string
    fullName: string | null
    role: string
  }
  alreadyLinked?: boolean
}> {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return { found: false }
  }

  const adminClient = createAdminClient()

  const { data: profileData, error } = await adminClient
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('email', email)
    .single()

  if (error || !profileData) {
    return { found: false }
  }

  const profile = profileData as { id: string; email: string; full_name: string | null; role: string }

  // Verificar si ya está vinculado a algún staff
  const { data: linkedStaff } = await adminClient
    .from('staff')
    .select('id')
    .eq('profile_id', profile.id)
    .single()

  return {
    found: true,
    user: {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
    },
    alreadyLinked: !!linkedStaff,
  }
}

// Restablecer contrasena de un staff (admin only)
export async function resetStaffPassword(staffId: string, newPassword: string): Promise<ActionResult> {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  if (newPassword.length < 8) {
    return { success: false, error: 'La contrasena debe tener al menos 8 caracteres' }
  }

  const adminClient = createAdminClient()

  // Obtener el staff y su profile_id
  const { data: staffData, error: staffError } = await adminClient
    .from('staff')
    .select('profile_id, name')
    .eq('id', staffId)
    .single()

  if (staffError || !staffData) {
    return { success: false, error: 'Staff no encontrado' }
  }

  const staff = staffData as { profile_id: string | null; name: string }

  if (!staff.profile_id) {
    return { success: false, error: 'Este staff no tiene cuenta vinculada' }
  }

  // Actualizar la contrasena usando Admin API
  const { error: updateError } = await adminClient.auth.admin.updateUserById(
    staff.profile_id,
    { password: newPassword }
  )

  if (updateError) {
    console.error('Error resetting password:', updateError)
    return { success: false, error: 'Error al restablecer contrasena: ' + updateError.message }
  }

  return { success: true }
}

// Enviar email de restablecimiento de contrasena al staff
export async function sendStaffPasswordReset(staffId: string): Promise<ActionResult> {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  const adminClient = createAdminClient()

  // Obtener el staff y su email
  const { data: staffData, error: staffError } = await adminClient
    .from('staff')
    .select('email, profile_id')
    .eq('id', staffId)
    .single()

  if (staffError || !staffData) {
    return { success: false, error: 'Staff no encontrado' }
  }

  const staff = staffData as { email: string | null; profile_id: string | null }

  if (!staff.email) {
    return { success: false, error: 'El staff no tiene email configurado' }
  }

  if (!staff.profile_id) {
    return { success: false, error: 'El staff no tiene cuenta vinculada' }
  }

  // Generar link de restablecimiento usando Supabase Admin
  const { error: resetError } = await adminClient.auth.admin.generateLink({
    type: 'recovery',
    email: staff.email,
  })

  if (resetError) {
    console.error('Error generating reset link:', resetError)
    return { success: false, error: 'Error al enviar email de restablecimiento' }
  }

  return { success: true }
}

// Vincular un usuario existente a un staff record (por email)
export async function linkExistingUserToStaff(staffId: string, userId: string): Promise<ActionResult> {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  const adminClient = createAdminClient()

  // Verificar que el staff no tiene ya cuenta vinculada
  const { data: staffData } = await adminClient
    .from('staff')
    .select('profile_id')
    .eq('id', staffId)
    .single()

  const staff = staffData as { profile_id: string | null } | null

  if (staff?.profile_id) {
    return { success: false, error: 'Este staff ya tiene cuenta vinculada' }
  }

  // Verificar que el user existe y no está vinculado a otro staff
  const { data: existingLink } = await adminClient
    .from('staff')
    .select('id')
    .eq('profile_id', userId)
    .single()

  if (existingLink) {
    return { success: false, error: 'Este usuario ya está vinculado a otro colaborador' }
  }

  // Obtener datos del profile
  const { data: profileData } = await adminClient
    .from('profiles')
    .select('role, email')
    .eq('id', userId)
    .single()

  const profile = profileData as { role: string; email: string } | null

  if (!profile) {
    return { success: false, error: 'Usuario no encontrado' }
  }

  // Vincular
  const { error: linkError } = await adminClient
    .from('staff')
    .update({
      profile_id: userId,
      portal_access_enabled: true,
      email: profile.email,
      invitation_accepted_at: new Date().toISOString(),
    } as never)
    .eq('id', staffId)

  if (linkError) {
    console.error('Error linking user to staff:', linkError)
    return { success: false, error: 'Error al vincular cuenta' }
  }

  // Si el usuario no es admin, cambiar su rol a staff
  if (!['admin', 'superadmin'].includes(profile.role)) {
    await adminClient
      .from('profiles')
      .update({ role: 'staff' } as never)
      .eq('id', userId)
  }

  revalidatePath(`/admin/personal/${staffId}`)
  return { success: true }
}
