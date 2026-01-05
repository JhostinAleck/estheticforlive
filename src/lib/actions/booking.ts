'use server'

import { createClient } from '@/lib/supabase/server'
import { format, parse, addMinutes } from 'date-fns'
import { revalidatePath } from 'next/cache'

interface BookingData {
  serviceId: string
  date: string // ISO date string
  time: string // HH:mm format
  fullName: string
  phone: string
  email?: string
  notes?: string
}

interface BookingResult {
  success: boolean
  appointmentId?: string
  error?: string
}

interface BusinessHoursData {
  is_closed: boolean
  open_time: string
  close_time: string
}

interface SpecialDateData {
  is_closed: boolean
  open_time: string | null
  close_time: string | null
}

interface ServiceData {
  duration_minutes: number
}

interface AppointmentSlot {
  start_time: string
  end_time: string
}

interface TimeBlockData {
  start_datetime: string
  end_datetime: string
}

interface ServiceDetailsData {
  id: string
  name: string
  duration_minutes: number
  price: number | null
}

interface ClientIdData {
  id: string
}

interface AppointmentIdData {
  id: string
}

// Get available time slots for a specific date and service
export async function getAvailableSlots(serviceId: string, date: string) {
  const supabase = await createClient()
  const selectedDate = new Date(date)
  const dayOfWeek = format(selectedDate, 'EEEE').toLowerCase() as
    | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

  // Get business hours for this day
  const { data: businessHoursData } = await supabase
    .from('business_hours')
    .select('*')
    .eq('day_of_week', dayOfWeek)
    .single()

  const businessHours = businessHoursData as BusinessHoursData | null

  if (!businessHours || businessHours.is_closed) {
    return { slots: [], error: null }
  }

  // Check for special dates
  const { data: specialDateData } = await supabase
    .from('special_dates')
    .select('*')
    .eq('date', date)
    .single()

  const specialDate = specialDateData as SpecialDateData | null

  if (specialDate?.is_closed) {
    return { slots: [], error: null }
  }

  // Get service duration
  const { data: serviceData } = await supabase
    .from('services')
    .select('duration_minutes')
    .eq('id', serviceId)
    .single()

  const service = serviceData as ServiceData | null
  const serviceDuration = service?.duration_minutes || 60

  // Get existing appointments for this date
  const { data: appointmentsData } = await supabase
    .from('appointments')
    .select('start_time, end_time')
    .eq('appointment_date', date)
    .in('status', ['pending', 'confirmed'])

  const appointments = (appointmentsData || []) as AppointmentSlot[]

  // Get time blocks for this date
  const dateStart = new Date(date)
  dateStart.setHours(0, 0, 0, 0)
  const dateEnd = new Date(date)
  dateEnd.setHours(23, 59, 59, 999)

  const { data: timeBlocksData } = await supabase
    .from('time_blocks')
    .select('start_datetime, end_datetime')
    .gte('start_datetime', dateStart.toISOString())
    .lte('end_datetime', dateEnd.toISOString())

  const timeBlocks = (timeBlocksData || []) as TimeBlockData[]

  // Generate time slots
  const openTime = specialDate?.open_time || businessHours.open_time
  const closeTime = specialDate?.close_time || businessHours.close_time

  const slots: { time: string; available: boolean }[] = []
  const slotInterval = 30 // minutes between slots

  let currentTime = parse(openTime, 'HH:mm:ss', new Date())
  const endTime = parse(closeTime, 'HH:mm:ss', new Date())

  while (currentTime < endTime) {
    const timeStr = format(currentTime, 'HH:mm')
    const slotEnd = addMinutes(currentTime, serviceDuration)

    // Check if slot end would exceed business hours
    if (slotEnd > endTime) {
      break
    }

    // Check if slot conflicts with existing appointments
    const hasConflict = appointments.some(apt => {
      const aptStart = parse(apt.start_time, 'HH:mm:ss', new Date())
      const aptEnd = parse(apt.end_time, 'HH:mm:ss', new Date())
      return currentTime < aptEnd && slotEnd > aptStart
    })

    // Check if slot conflicts with time blocks
    const hasBlockConflict = (timeBlocks || []).some(block => {
      const blockStart = new Date(block.start_datetime)
      const blockEnd = new Date(block.end_datetime)
      const slotStartFull = new Date(date)
      slotStartFull.setHours(currentTime.getHours(), currentTime.getMinutes())
      const slotEndFull = new Date(date)
      slotEndFull.setHours(slotEnd.getHours(), slotEnd.getMinutes())
      return slotStartFull < blockEnd && slotEndFull > blockStart
    })

    slots.push({
      time: timeStr,
      available: !hasConflict && !hasBlockConflict,
    })

    currentTime = addMinutes(currentTime, slotInterval)
  }

  return { slots, error: null }
}

// Create a new booking
export async function createBooking(data: BookingData): Promise<BookingResult> {
  const supabase = await createClient()

  try {
    // Get service details
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('id, name, duration_minutes, price')
      .eq('id', data.serviceId)
      .single()

    const service = serviceData as ServiceDetailsData | null

    if (serviceError || !service) {
      return { success: false, error: 'Servicio no encontrado' }
    }

    // Check slot availability again
    const { slots } = await getAvailableSlots(data.serviceId, data.date)
    const selectedSlot = slots.find(s => s.time === data.time)

    if (!selectedSlot?.available) {
      return { success: false, error: 'El horario seleccionado ya no está disponible' }
    }

    // Find or create client
    let clientId: string

    // First try to find existing client by phone
    const { data: existingClientData } = await supabase
      .from('clients')
      .select('id')
      .eq('phone', data.phone)
      .single()

    const existingClient = existingClientData as ClientIdData | null

    if (existingClient) {
      clientId = existingClient.id
      // Update client info
      await supabase
        .from('clients')
        .update({
          full_name: data.fullName,
          email: data.email || null,
        } as never)
        .eq('id', clientId)
    } else {
      // Create new client
      const { data: newClientData, error: clientError } = await supabase
        .from('clients')
        .insert({
          full_name: data.fullName,
          phone: data.phone,
          email: data.email || null,
        } as never)
        .select('id')
        .single()

      const newClient = newClientData as ClientIdData | null

      if (clientError || !newClient) {
        return { success: false, error: 'Error al crear el cliente' }
      }
      clientId = newClient.id
    }

    // Calculate end time
    const startTime = parse(data.time, 'HH:mm', new Date())
    const endTime = addMinutes(startTime, service.duration_minutes || 60)
    const endTimeStr = format(endTime, 'HH:mm')

    // Create appointment
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        client_id: clientId,
        service_id: data.serviceId,
        appointment_date: data.date,
        start_time: data.time,
        end_time: endTimeStr,
        status: 'pending',
        client_notes: data.notes || null,
        price: service.price,
      } as never)
      .select('id')
      .single()

    const appointment = appointmentData as AppointmentIdData | null

    if (appointmentError || !appointment) {
      console.error('Appointment error:', appointmentError)
      return { success: false, error: 'Error al crear la cita' }
    }

    // Update client appointment count
    await supabase.rpc('increment_client_appointments' as never, { client_id: clientId } as never)

    revalidatePath('/admin/reservas')

    return { success: true, appointmentId: appointment.id }
  } catch (error) {
    console.error('Booking error:', error)
    return { success: false, error: 'Error inesperado al crear la reserva' }
  }
}

interface ClosedDayData {
  day_of_week: string
  is_closed: boolean
}

interface SpecialDateClosedData {
  date: string
  is_closed: boolean
}

// Get closed days of week (for calendar)
export async function getClosedDays() {
  const supabase = await createClient()

  const { data: businessHoursData } = await supabase
    .from('business_hours')
    .select('day_of_week, is_closed')
    .eq('is_closed', true)

  const businessHours = (businessHoursData || []) as ClosedDayData[]

  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  }

  return businessHours.map(h => dayMap[h.day_of_week])
}

// Get special closed dates (for calendar)
export async function getSpecialDates() {
  const supabase = await createClient()

  const today = format(new Date(), 'yyyy-MM-dd')

  const { data: specialDatesData } = await supabase
    .from('special_dates')
    .select('date, is_closed')
    .gte('date', today)
    .eq('is_closed', true)

  const specialDates = (specialDatesData || []) as SpecialDateClosedData[]

  return specialDates.map(d => new Date(d.date))
}
