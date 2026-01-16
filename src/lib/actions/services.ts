'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// Helper to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// ==================== GET FUNCTIONS ====================

export async function getCategories() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order')

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

export async function getServiceById(serviceId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('services')
    .select('*, categories(id, name)')
    .eq('id', serviceId)
    .single()

  if (error) {
    console.error('Error fetching service:', error)
    return null
  }

  return data
}

export async function getCategoryById(categoryId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .single()

  if (error) {
    console.error('Error fetching category:', error)
    return null
  }

  return data
}

export async function getCategoryWithServiceCount(categoryId: string) {
  const supabase = createAdminClient()

  const [{ data: category }, { count }] = await Promise.all([
    supabase.from('categories').select('*').eq('id', categoryId).single(),
    supabase.from('services').select('*', { count: 'exact', head: true }).eq('category_id', categoryId),
  ])

  if (!category) {
    return { category: null, serviceCount: 0 }
  }

  return { category, serviceCount: count || 0 }
}

// ==================== SERVICES ====================

interface ServiceData {
  name: string
  category_id?: string | null
  description: string
  short_description?: string
  price?: number | null
  price_note?: string
  duration_minutes?: number
  fa_icon?: string
  image_url?: string
  display_order?: number
  is_active?: boolean
  is_featured?: boolean
}

export async function createService(data: ServiceData) {
  const supabase = createAdminClient()

  try {
    const slug = generateSlug(data.name)

    // Check if slug exists
    const { data: existing } = await supabase
      .from('services')
      .select('id')
      .eq('slug', slug)
      .single()

    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const { data: service, error } = await supabase
      .from('services')
      .insert({
        name: data.name,
        slug: finalSlug,
        category_id: data.category_id || null,
        description: data.description,
        short_description: data.short_description || null,
        price: data.price || null,
        price_note: data.price_note || null,
        duration_minutes: data.duration_minutes || 60,
        fa_icon: data.fa_icon || 'fa-solid fa-spa',
        image_url: data.image_url || null,
        display_order: data.display_order || 0,
        is_active: data.is_active ?? true,
        is_featured: data.is_featured ?? false,
      } as never)
      .select()
      .single()

    if (error) {
      console.error('Create service error:', error)
      return { success: false, error: 'Error al crear el servicio' }
    }

    revalidatePath('/admin/servicios')
    revalidatePath('/servicios')
    revalidatePath('/')

    return { success: true, data: service }
  } catch (error) {
    console.error('Create service error:', error)
    return { success: false, error: 'Error inesperado' }
  }
}

export async function updateService(id: string, data: Partial<ServiceData>) {
  const supabase = createAdminClient()

  try {
    const updateData: Record<string, unknown> = { ...data, updated_at: new Date().toISOString() }

    // If name changed, update slug
    if (data.name) {
      const slug = generateSlug(data.name)
      const { data: existing } = await supabase
        .from('services')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single()

      updateData.slug = existing ? `${slug}-${Date.now()}` : slug
    }

    const { data: service, error } = await supabase
      .from('services')
      .update(updateData as never)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update service error:', error)
      return { success: false, error: 'Error al actualizar el servicio' }
    }

    revalidatePath('/admin/servicios')
    revalidatePath(`/admin/servicios/${id}`)
    revalidatePath('/servicios')
    revalidatePath('/')

    return { success: true, data: service }
  } catch (error) {
    console.error('Update service error:', error)
    return { success: false, error: 'Error inesperado' }
  }
}

export async function deleteService(id: string) {
  const supabase = createAdminClient()

  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete service error:', error)
      return { success: false, error: 'Error al eliminar el servicio' }
    }

    revalidatePath('/admin/servicios')
    revalidatePath('/servicios')
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('Delete service error:', error)
    return { success: false, error: 'Error inesperado' }
  }
}

export async function toggleServiceActive(id: string, is_active: boolean) {
  return updateService(id, { is_active })
}

export async function toggleServiceFeatured(id: string, is_featured: boolean) {
  return updateService(id, { is_featured })
}

// ==================== CATEGORIES ====================

interface CategoryData {
  name: string
  description?: string
  fa_icon?: string
  image_url?: string
  display_order?: number
  is_active?: boolean
}

export async function createCategory(data: CategoryData) {
  const supabase = createAdminClient()

  try {
    const slug = generateSlug(data.name)

    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single()

    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        name: data.name,
        slug: finalSlug,
        description: data.description || null,
        fa_icon: data.fa_icon || 'fa-solid fa-spa',
        image_url: data.image_url || null,
        display_order: data.display_order || 0,
        is_active: data.is_active ?? true,
      } as never)
      .select()
      .single()

    if (error) {
      console.error('Create category error:', error)
      return { success: false, error: 'Error al crear la categoría' }
    }

    revalidatePath('/admin/servicios')
    revalidatePath('/servicios')
    revalidatePath('/')

    return { success: true, data: category }
  } catch (error) {
    console.error('Create category error:', error)
    return { success: false, error: 'Error inesperado' }
  }
}

export async function updateCategory(id: string, data: Partial<CategoryData>) {
  const supabase = createAdminClient()

  try {
    const updateData: Record<string, unknown> = { ...data, updated_at: new Date().toISOString() }

    if (data.name) {
      const slug = generateSlug(data.name)
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single()

      updateData.slug = existing ? `${slug}-${Date.now()}` : slug
    }

    const { data: category, error } = await supabase
      .from('categories')
      .update(updateData as never)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update category error:', error)
      return { success: false, error: 'Error al actualizar la categoría' }
    }

    revalidatePath('/admin/servicios')
    revalidatePath(`/admin/servicios/categoria/${id}`)
    revalidatePath('/servicios')
    revalidatePath('/')

    return { success: true, data: category }
  } catch (error) {
    console.error('Update category error:', error)
    return { success: false, error: 'Error inesperado' }
  }
}

export async function deleteCategory(id: string) {
  const supabase = createAdminClient()

  try {
    // Check if category has services
    const { data: services } = await supabase
      .from('services')
      .select('id')
      .eq('category_id', id)
      .limit(1)

    if (services && services.length > 0) {
      return { success: false, error: 'No se puede eliminar una categoría con servicios. Mueve o elimina los servicios primero.' }
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete category error:', error)
      return { success: false, error: 'Error al eliminar la categoría' }
    }

    revalidatePath('/admin/servicios')
    revalidatePath('/servicios')
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('Delete category error:', error)
    return { success: false, error: 'Error inesperado' }
  }
}

export async function toggleCategoryActive(id: string, is_active: boolean) {
  return updateCategory(id, { is_active })
}
