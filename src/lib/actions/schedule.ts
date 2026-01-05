'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// =============================================
// SPECIAL DATES (full day blocks)
// =============================================

interface SpecialDateData {
  date: string
  description?: string
  is_closed: boolean
  open_time?: string
  close_time?: string
}

export async function getSpecialDates() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('special_dates')
    .select('*')
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching special dates:', error)
    return []
  }

  return data
}

export async function createSpecialDate(data: SpecialDateData) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('special_dates')
    .insert({
      date: data.date,
      description: data.description,
      is_closed: data.is_closed,
      open_time: data.is_closed ? null : data.open_time,
      close_time: data.is_closed ? null : data.close_time,
    } as never)

  if (error) {
    console.error('Error creating special date:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/horarios')
  return { success: true }
}

export async function updateSpecialDate(id: string, data: SpecialDateData) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('special_dates')
    .update({
      date: data.date,
      description: data.description,
      is_closed: data.is_closed,
      open_time: data.is_closed ? null : data.open_time,
      close_time: data.is_closed ? null : data.close_time,
    } as never)
    .eq('id', id)

  if (error) {
    console.error('Error updating special date:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/horarios')
  return { success: true }
}

export async function deleteSpecialDate(id: string) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('special_dates')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting special date:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/horarios')
  return { success: true }
}

// =============================================
// TIME BLOCKS (specific time ranges)
// =============================================

interface TimeBlockData {
  start_datetime: string
  end_datetime: string
  reason?: string
}

export async function getTimeBlocks() {
  const supabase = createAdminClient()

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('time_blocks')
    .select('*')
    .gte('start_datetime', today)
    .order('start_datetime', { ascending: true })

  if (error) {
    console.error('Error fetching time blocks:', error)
    return []
  }

  return data
}

export async function createTimeBlock(data: TimeBlockData) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('time_blocks')
    .insert({
      start_datetime: data.start_datetime,
      end_datetime: data.end_datetime,
      reason: data.reason,
    } as never)

  if (error) {
    console.error('Error creating time block:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/horarios')
  return { success: true }
}

export async function deleteTimeBlock(id: string) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('time_blocks')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting time block:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/horarios')
  return { success: true }
}

// =============================================
// BUSINESS HOURS
// =============================================

interface BusinessHourData {
  open_time: string
  close_time: string
  is_closed: boolean
}

export async function getBusinessHours() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('business_hours')
    .select('*')
    .order('day_of_week')

  if (error) {
    console.error('Error fetching business hours:', error)
    return []
  }

  // Sort by day of week order
  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  interface BusinessHourRecord {
    id: string
    day_of_week: string
    open_time: string
    close_time: string
    is_closed: boolean
  }
  const typedData = data as BusinessHourRecord[]
  return typedData.sort((a, b) => dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week))
}

export async function updateBusinessHours(day: string, data: BusinessHourData) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('business_hours')
    .update({
      open_time: data.open_time,
      close_time: data.close_time,
      is_closed: data.is_closed,
    } as never)
    .eq('day_of_week', day)

  if (error) {
    console.error('Error updating business hours:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/horarios')
  return { success: true }
}
