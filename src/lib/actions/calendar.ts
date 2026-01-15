'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { format, startOfMonth, endOfMonth } from 'date-fns'

interface Appointment {
  id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: string
  staff_id: string | null
  services: { name: string; fa_icon: string } | null
  clients: { full_name: string; phone: string } | null
  staff: { id: string; name: string; color: string } | null
}

interface Staff {
  id: string
  name: string
  color: string
}

export async function getCalendarAppointments(currentDate: Date) {
  const supabase = createAdminClient()

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)

  const { data, error } = await supabase
    .from('appointments')
    .select('*, services(name, fa_icon), clients(full_name, phone), staff(id, name, color)')
    .gte('appointment_date', format(monthStart, 'yyyy-MM-dd'))
    .lte('appointment_date', format(monthEnd, 'yyyy-MM-dd'))
    .order('appointment_date')
    .order('start_time')

  if (error) {
    console.error('Error loading calendar appointments:', error)
    return []
  }

  return (data || []) as Appointment[]
}

export async function getCalendarStaff() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('staff')
    .select('id, name, color')
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Error loading staff:', error)
    return []
  }

  return (data || []) as Staff[]
}
