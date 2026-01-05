'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { BeforeAfterResult } from '@/types/database.types'

interface CreateResultData {
  title: string
  description?: string
  before_image_url: string
  after_image_url: string
  service_id?: string
  category_id?: string
  display_order?: number
  is_active?: boolean
}

interface UpdateResultData {
  title?: string
  description?: string
  before_image_url?: string
  after_image_url?: string
  service_id?: string | null
  category_id?: string | null
  display_order?: number
  is_active?: boolean
}

interface ResultWithRelations extends BeforeAfterResult {
  services: { id: string; name: string } | null
  categories: { id: string; name: string } | null
}

export async function getResults(): Promise<ResultWithRelations[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('before_after_results')
    .select('*, services(id, name), categories(id, name)')
    .order('display_order')

  if (error) {
    console.error('Error fetching results:', error)
    return []
  }

  return (data || []) as ResultWithRelations[]
}

export async function getResultById(id: string): Promise<BeforeAfterResult | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('before_after_results')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching result:', error)
    return null
  }

  return data as BeforeAfterResult
}

export async function createResult(data: CreateResultData) {
  try {
    const supabase = await createClient()

    const { data: result, error } = await supabase
      .from('before_after_results')
      .insert({
        title: data.title,
        description: data.description || null,
        before_image_url: data.before_image_url,
        after_image_url: data.after_image_url,
        service_id: data.service_id || null,
        category_id: data.category_id || null,
        display_order: data.display_order || 0,
        is_active: data.is_active ?? true,
      } as never)
      .select()
      .single()

    if (error) {
      console.error('Create result error:', error)
      return { success: false, error: 'Error al crear el resultado' }
    }

    revalidatePath('/admin/resultados')
    revalidatePath('/')
    return { success: true, data: result as BeforeAfterResult }
  } catch (error) {
    console.error('Create result error:', error)
    return { success: false, error: 'Error inesperado' }
  }
}

export async function updateResult(id: string, data: UpdateResultData) {
  try {
    const supabase = await createClient()

    const { data: result, error } = await supabase
      .from('before_after_results')
      .update(data as never)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update result error:', error)
      return { success: false, error: 'Error al actualizar el resultado' }
    }

    revalidatePath('/admin/resultados')
    revalidatePath('/')
    return { success: true, data: result as BeforeAfterResult }
  } catch (error) {
    console.error('Update result error:', error)
    return { success: false, error: 'Error inesperado' }
  }
}

export async function deleteResult(id: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('before_after_results')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete result error:', error)
      return { success: false, error: 'Error al eliminar el resultado' }
    }

    revalidatePath('/admin/resultados')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Delete result error:', error)
    return { success: false, error: 'Error inesperado' }
  }
}

export async function toggleResultActive(id: string, is_active: boolean) {
  return updateResult(id, { is_active })
}
