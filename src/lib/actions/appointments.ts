'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export async function updateAppointmentStatus(
  appointmentId: string,
  newStatus: AppointmentStatus,
  adminNotes?: string
) {
  const supabaseAdmin = createAdminClient()
  const supabase = await createClient()

  try {
    // Get current user (admin)
    const { data: { user } } = await supabase.auth.getUser()

    // Get current appointment status
    const { data: appointment } = await supabaseAdmin
      .from('appointments')
      .select('status')
      .eq('id', appointmentId)
      .single()

    if (!appointment) {
      return { success: false, error: 'Cita no encontrada' }
    }

    const apt = appointment as { status: AppointmentStatus }
    const previousStatus = apt.status

    // Update appointment
    const updateData: Record<string, unknown> = {
      status: newStatus,
      status_changed_at: new Date().toISOString(),
      status_changed_by: user?.id || null,
      updated_at: new Date().toISOString(),
    }

    if (adminNotes !== undefined) {
      updateData.admin_notes = adminNotes
    }

    const { error: updateError } = await supabaseAdmin
      .from('appointments')
      .update(updateData as never)
      .eq('id', appointmentId)

    if (updateError) {
      console.error('Update appointment error:', updateError)
      return { success: false, error: 'Error al actualizar la cita' }
    }

    // Record status change in history
    await supabaseAdmin
      .from('appointment_status_history')
      .insert({
        appointment_id: appointmentId,
        previous_status: previousStatus,
        new_status: newStatus,
        changed_by: user?.id || null,
        notes: adminNotes || null,
      } as never)

    revalidatePath('/admin/reservas')
    revalidatePath(`/admin/reservas/${appointmentId}`)

    return { success: true }
  } catch (error) {
    console.error('Update appointment status error:', error)
    return { success: false, error: 'Error inesperado' }
  }
}

export async function updateAppointmentNotes(
  appointmentId: string,
  adminNotes: string
) {
  const supabaseAdmin = createAdminClient()

  try {
    const { error } = await supabaseAdmin
      .from('appointments')
      .update({
        admin_notes: adminNotes,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', appointmentId)

    if (error) {
      console.error('Update notes error:', error)
      return { success: false, error: 'Error al actualizar las notas' }
    }

    revalidatePath(`/admin/reservas/${appointmentId}`)
    return { success: true }
  } catch (error) {
    console.error('Update notes error:', error)
    return { success: false, error: 'Error inesperado' }
  }
}

export async function deleteAppointment(appointmentId: string) {
  const supabaseAdmin = createAdminClient()

  try {
    const { error } = await supabaseAdmin
      .from('appointments')
      .delete()
      .eq('id', appointmentId)

    if (error) {
      console.error('Delete appointment error:', error)
      return { success: false, error: 'Error al eliminar la cita' }
    }

    revalidatePath('/admin/reservas')
    return { success: true }
  } catch (error) {
    console.error('Delete appointment error:', error)
    return { success: false, error: 'Error inesperado' }
  }
}

export async function getAppointmentHistory(appointmentId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('appointment_status_history')
    .select(`
      *,
      profiles:changed_by (
        full_name,
        email
      )
    `)
    .eq('appointment_id', appointmentId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Get history error:', error)
    return []
  }

  return data || []
}
