'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

interface ActionResult {
  success: boolean
  error?: string
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

// Verificar si el usuario actual es el staff indicado
async function verifyStaffOrAdmin(staffId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const adminClient = createAdminClient()

  // Check if admin
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile as { role: string } | null)?.role
  if (role === 'admin' || role === 'superadmin') return true

  // Check if this is the staff's own record
  const { data: staff } = await adminClient
    .from('staff')
    .select('id')
    .eq('id', staffId)
    .eq('profile_id', user.id)
    .single()

  return !!staff
}

// ============================================
// STAFF SCHEDULES (Weekly hours)
// ============================================

export interface StaffSchedule {
  id: string
  staff_id: string
  day_of_week: string
  open_time: string
  close_time: string
  is_closed: boolean
}

export async function getStaffSchedules(staffId: string): Promise<StaffSchedule[]> {
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('staff_schedules')
    .select('*')
    .eq('staff_id', staffId)
    .order('day_of_week')

  if (error) {
    console.error('Error fetching staff schedules:', error)
    return []
  }

  return (data || []) as StaffSchedule[]
}

export async function updateStaffSchedule(
  staffId: string,
  dayOfWeek: string,
  data: { open_time?: string; close_time?: string; is_closed?: boolean }
): Promise<ActionResult> {
  const canEdit = await verifyStaffOrAdmin(staffId)
  if (!canEdit) {
    return { success: false, error: 'No autorizado' }
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('staff_schedules')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('staff_id', staffId)
    .eq('day_of_week', dayOfWeek)

  if (error) {
    console.error('Error updating staff schedule:', error)
    return { success: false, error: 'Error al actualizar horario' }
  }

  revalidatePath(`/admin/personal/${staffId}`)
  revalidatePath('/staff/horarios')
  return { success: true }
}

export async function copyFromBusinessHours(staffId: string): Promise<ActionResult> {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  const adminClient = createAdminClient()

  // Get business hours
  const { data: businessHours, error: bhError } = await adminClient
    .from('business_hours')
    .select('*')

  if (bhError || !businessHours) {
    return { success: false, error: 'Error al obtener horarios globales' }
  }

  // Update staff schedules
  for (const bh of businessHours) {
    const { error } = await adminClient
      .from('staff_schedules')
      .update({
        open_time: bh.open_time,
        close_time: bh.close_time,
        is_closed: bh.is_closed,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('staff_id', staffId)
      .eq('day_of_week', bh.day_of_week)

    if (error) {
      console.error('Error copying schedule:', error)
    }
  }

  revalidatePath(`/admin/personal/${staffId}`)
  return { success: true }
}

// ============================================
// STAFF TIME BLOCKS
// ============================================

export interface StaffTimeBlock {
  id: string
  staff_id: string
  start_datetime: string
  end_datetime: string
  reason: string | null
  created_at: string
}

export async function getStaffTimeBlocks(
  staffId: string,
  options?: { from?: Date; to?: Date }
): Promise<StaffTimeBlock[]> {
  const adminClient = createAdminClient()

  let query = adminClient
    .from('staff_time_blocks')
    .select('*')
    .eq('staff_id', staffId)
    .order('start_datetime', { ascending: true })

  if (options?.from) {
    query = query.gte('start_datetime', options.from.toISOString())
  }
  if (options?.to) {
    query = query.lte('end_datetime', options.to.toISOString())
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching staff time blocks:', error)
    return []
  }

  return (data || []) as StaffTimeBlock[]
}

export async function createStaffTimeBlock(
  staffId: string,
  data: { start_datetime: string; end_datetime: string; reason?: string }
): Promise<ActionResult & { id?: string }> {
  const canEdit = await verifyStaffOrAdmin(staffId)
  if (!canEdit) {
    return { success: false, error: 'No autorizado' }
  }

  const adminClient = createAdminClient()

  const { data: newBlock, error } = await adminClient
    .from('staff_time_blocks')
    .insert({
      staff_id: staffId,
      start_datetime: data.start_datetime,
      end_datetime: data.end_datetime,
      reason: data.reason || null,
    } as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating time block:', error)
    return { success: false, error: 'Error al crear bloqueo' }
  }

  revalidatePath(`/admin/personal/${staffId}`)
  revalidatePath('/staff/horarios')
  return { success: true, id: (newBlock as { id: string }).id }
}

export async function deleteStaffTimeBlock(blockId: string): Promise<ActionResult> {
  const adminClient = createAdminClient()

  // Get staff_id first to verify access
  const { data: block } = await adminClient
    .from('staff_time_blocks')
    .select('staff_id')
    .eq('id', blockId)
    .single()

  if (!block) {
    return { success: false, error: 'Bloqueo no encontrado' }
  }

  const staffId = (block as { staff_id: string }).staff_id
  const canEdit = await verifyStaffOrAdmin(staffId)
  if (!canEdit) {
    return { success: false, error: 'No autorizado' }
  }

  const { error } = await adminClient
    .from('staff_time_blocks')
    .delete()
    .eq('id', blockId)

  if (error) {
    console.error('Error deleting time block:', error)
    return { success: false, error: 'Error al eliminar bloqueo' }
  }

  revalidatePath(`/admin/personal/${staffId}`)
  revalidatePath('/staff/horarios')
  return { success: true }
}

// ============================================
// STAFF SPECIAL DATES (Vacations/Holidays)
// ============================================

export interface StaffSpecialDate {
  id: string
  staff_id: string
  date: string
  description: string | null
  is_closed: boolean
  open_time: string | null
  close_time: string | null
  created_at: string
}

export async function getStaffSpecialDates(
  staffId: string,
  options?: { from?: Date; to?: Date }
): Promise<StaffSpecialDate[]> {
  const adminClient = createAdminClient()

  let query = adminClient
    .from('staff_special_dates')
    .select('*')
    .eq('staff_id', staffId)
    .order('date', { ascending: true })

  if (options?.from) {
    query = query.gte('date', options.from.toISOString().split('T')[0])
  }
  if (options?.to) {
    query = query.lte('date', options.to.toISOString().split('T')[0])
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching staff special dates:', error)
    return []
  }

  return (data || []) as StaffSpecialDate[]
}

export async function createStaffSpecialDate(
  staffId: string,
  data: {
    date: string
    description?: string
    is_closed?: boolean
    open_time?: string
    close_time?: string
  }
): Promise<ActionResult & { id?: string }> {
  const canEdit = await verifyStaffOrAdmin(staffId)
  if (!canEdit) {
    return { success: false, error: 'No autorizado' }
  }

  const adminClient = createAdminClient()

  const { data: newDate, error } = await adminClient
    .from('staff_special_dates')
    .insert({
      staff_id: staffId,
      date: data.date,
      description: data.description || null,
      is_closed: data.is_closed ?? true,
      open_time: data.open_time || null,
      close_time: data.close_time || null,
    } as never)
    .select()
    .single()

  if (error) {
    // Check for unique constraint violation
    if (error.code === '23505') {
      return { success: false, error: 'Ya existe una fecha especial para este dia' }
    }
    console.error('Error creating special date:', error)
    return { success: false, error: 'Error al crear fecha especial' }
  }

  revalidatePath(`/admin/personal/${staffId}`)
  revalidatePath('/staff/horarios')
  return { success: true, id: (newDate as { id: string }).id }
}

export async function updateStaffSpecialDate(
  dateId: string,
  data: {
    description?: string
    is_closed?: boolean
    open_time?: string | null
    close_time?: string | null
  }
): Promise<ActionResult> {
  const adminClient = createAdminClient()

  // Get staff_id first to verify access
  const { data: specialDate } = await adminClient
    .from('staff_special_dates')
    .select('staff_id')
    .eq('id', dateId)
    .single()

  if (!specialDate) {
    return { success: false, error: 'Fecha especial no encontrada' }
  }

  const staffId = (specialDate as { staff_id: string }).staff_id
  const canEdit = await verifyStaffOrAdmin(staffId)
  if (!canEdit) {
    return { success: false, error: 'No autorizado' }
  }

  const { error } = await adminClient
    .from('staff_special_dates')
    .update(data as never)
    .eq('id', dateId)

  if (error) {
    console.error('Error updating special date:', error)
    return { success: false, error: 'Error al actualizar fecha especial' }
  }

  revalidatePath(`/admin/personal/${staffId}`)
  revalidatePath('/staff/horarios')
  return { success: true }
}

export async function deleteStaffSpecialDate(dateId: string): Promise<ActionResult> {
  const adminClient = createAdminClient()

  // Get staff_id first to verify access
  const { data: specialDate } = await adminClient
    .from('staff_special_dates')
    .select('staff_id')
    .eq('id', dateId)
    .single()

  if (!specialDate) {
    return { success: false, error: 'Fecha especial no encontrada' }
  }

  const staffId = (specialDate as { staff_id: string }).staff_id
  const canEdit = await verifyStaffOrAdmin(staffId)
  if (!canEdit) {
    return { success: false, error: 'No autorizado' }
  }

  const { error } = await adminClient
    .from('staff_special_dates')
    .delete()
    .eq('id', dateId)

  if (error) {
    console.error('Error deleting special date:', error)
    return { success: false, error: 'Error al eliminar fecha especial' }
  }

  revalidatePath(`/admin/personal/${staffId}`)
  revalidatePath('/staff/horarios')
  return { success: true }
}
