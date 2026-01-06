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

interface AdminBookingData {
  serviceId: string
  staffId: string
  date: string
  time: string
  clientId?: string
  fullName?: string
  phone?: string
  email?: string
}

export async function createAdminBooking(data: AdminBookingData) {
  const supabaseAdmin = createAdminClient()
  const supabase = await createClient()

  try {
    // Get service details
    const { data: serviceData, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('id, name, duration_minutes, price')
      .eq('id', data.serviceId)
      .single()

    if (serviceError || !serviceData) {
      return { success: false, error: 'Servicio no encontrado' }
    }

    const service = serviceData as { id: string; name: string; duration_minutes: number; price: number | null }

    // Get or create client
    let clientId: string

    if (data.clientId) {
      clientId = data.clientId
    } else if (data.fullName && data.phone) {
      // Check if client exists by phone
      const { data: existingClient } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('phone', data.phone)
        .single()

      if (existingClient) {
        clientId = (existingClient as { id: string }).id
        // Update client info
        await supabaseAdmin
          .from('clients')
          .update({
            full_name: data.fullName,
            email: data.email || null,
          } as never)
          .eq('id', clientId)
      } else {
        // Create new client
        const { data: newClient, error: clientError } = await supabaseAdmin
          .from('clients')
          .insert({
            full_name: data.fullName,
            phone: data.phone,
            email: data.email || null,
          } as never)
          .select('id')
          .single()

        if (clientError || !newClient) {
          return { success: false, error: 'Error al crear el cliente' }
        }
        clientId = (newClient as { id: string }).id
      }
    } else {
      return { success: false, error: 'Se requiere información del cliente' }
    }

    // Calculate end time
    const { parse, addMinutes, format } = await import('date-fns')
    const startTime = parse(data.time, 'HH:mm', new Date())
    const endTime = addMinutes(startTime, service.duration_minutes || 60)
    const endTimeStr = format(endTime, 'HH:mm')

    // Create appointment
    const { data: appointment, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .insert({
        client_id: clientId,
        service_id: data.serviceId,
        staff_id: data.staffId,
        appointment_date: data.date,
        start_time: data.time,
        end_time: endTimeStr,
        status: 'confirmed', // Admin-created appointments are automatically confirmed
        price: service.price,
      } as never)
      .select('id')
      .single()

    if (appointmentError || !appointment) {
      console.error('Appointment error:', appointmentError)
      return { success: false, error: 'Error al crear la cita' }
    }

    // Update client appointment count
    await supabaseAdmin.rpc('increment_client_appointments' as never, { client_id: clientId } as never)

    revalidatePath('/admin/reservas')
    revalidatePath('/admin/calendario')

    return { success: true, appointmentId: (appointment as { id: string }).id }
  } catch (error) {
    console.error('Admin booking error:', error)
    return { success: false, error: 'Error inesperado al crear la reserva' }
  }
}
