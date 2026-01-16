'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { Staff } from '@/types/database.types'

interface CreateStaffData {
  name: string
  email?: string
  phone?: string
  color?: string
  specialty?: string
  is_active?: boolean
  can_receive_appointments?: boolean
  display_order?: number
}

interface UpdateStaffData {
  name?: string
  email?: string | null
  phone?: string | null
  color?: string
  specialty?: string | null
  is_active?: boolean
  can_receive_appointments?: boolean
  display_order?: number
}

interface StaffWithServices extends Staff {
  staff_services: { service_id: string; services: { id: string; name: string } }[]
}

export async function getStaffList(): Promise<StaffWithServices[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('staff')
    .select('*, staff_services(service_id, services(id, name))')
    .order('display_order')
    .order('name')

  if (error) {
    console.error('Error fetching staff:', error)
    return []
  }

  return (data || []) as StaffWithServices[]
}

export async function getActiveStaff(): Promise<Staff[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('is_active', true)
    .eq('can_receive_appointments', true)
    .order('display_order')
    .order('name')

  if (error) {
    console.error('Error fetching active staff:', error)
    return []
  }

  return (data || []) as Staff[]
}

export async function getStaffById(id: string): Promise<StaffWithServices | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('staff')
    .select('*, staff_services(service_id, services(id, name))')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching staff:', error)
    return null
  }

  return data as StaffWithServices
}

export async function createStaff(staffData: CreateStaffData, serviceIds?: string[]) {
  try {
    const supabase = createAdminClient()

    // Create staff member
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .insert({
        name: staffData.name,
        email: staffData.email || null,
        phone: staffData.phone || null,
        color: staffData.color || '#E91E63',
        specialty: staffData.specialty || null,
        is_active: staffData.is_active ?? true,
        can_receive_appointments: staffData.can_receive_appointments ?? true,
        display_order: staffData.display_order || 0,
      } as never)
      .select()
      .single()

    if (staffError) {
      console.error('Create staff error:', staffError)
      return { success: false, error: 'Error al crear el personal' }
    }

    // Add service associations if provided
    if (serviceIds && serviceIds.length > 0) {
      const staffServices = serviceIds.map(serviceId => ({
        staff_id: (staff as Staff).id,
        service_id: serviceId,
      }))

      const { error: servicesError } = await supabase
        .from('staff_services')
        .insert(staffServices as never)

      if (servicesError) {
        console.error('Create staff services error:', servicesError)
        // Staff was created, but services failed - not critical
      }
    }

    revalidatePath('/admin/personal')
    return { success: true, data: staff as Staff }
  } catch (error) {
    console.error('Create staff error:', error)
    return { success: false, error: 'Error inesperado' }
  }
}

export async function updateStaff(id: string, staffData: UpdateStaffData, serviceIds?: string[]) {
  try {
    const supabase = createAdminClient()

    // Update staff member
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .update(staffData as never)
      .eq('id', id)
      .select()
      .single()

    if (staffError) {
      console.error('Update staff error:', staffError)
      return { success: false, error: 'Error al actualizar el personal' }
    }

    // Update service associations if provided
    if (serviceIds !== undefined) {
      // Delete existing associations
      await supabase
        .from('staff_services')
        .delete()
        .eq('staff_id', id)

      // Add new associations
      if (serviceIds.length > 0) {
        const staffServices = serviceIds.map(serviceId => ({
          staff_id: id,
          service_id: serviceId,
        }))

        await supabase
          .from('staff_services')
          .insert(staffServices as never)
      }
    }

    revalidatePath('/admin/personal')
    return { success: true, data: staff as Staff }
  } catch (error) {
    console.error('Update staff error:', error)
    return { success: false, error: 'Error inesperado' }
  }
}

export async function deleteStaff(id: string) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete staff error:', error)
      return { success: false, error: 'Error al eliminar el personal' }
    }

    revalidatePath('/admin/personal')
    return { success: true }
  } catch (error) {
    console.error('Delete staff error:', error)
    return { success: false, error: 'Error inesperado' }
  }
}

export async function toggleStaffActive(id: string, is_active: boolean) {
  return updateStaff(id, { is_active })
}

export async function getAllServices() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('services')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Error fetching services:', error)
    return []
  }

  return data || []
}

export async function getStaffForService(serviceId: string): Promise<Staff[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('staff_services')
    .select('staff(*)')
    .eq('service_id', serviceId)

  if (error) {
    console.error('Error fetching staff for service:', error)
    return []
  }

  // Extract staff from the nested structure
  const staffList = (data || [])
    .map(item => (item as { staff: Staff }).staff)
    .filter(staff => staff && staff.is_active && staff.can_receive_appointments)

  return staffList
}
