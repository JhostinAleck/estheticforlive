'use server'

import { createAdminClient } from '@/lib/supabase/admin'

type UploadResult =
  | { success: true; url: string; path: string }
  | { success: false; error: string; url?: undefined; path?: undefined }

// Upload from File directly (for client components)
export async function uploadImage(file: File, folder: string = 'general'): Promise<UploadResult> {
  if (!file) {
    return { success: false, error: 'No se proporcionó archivo' }
  }

  return uploadImageInternal(file, folder)
}

// Upload from FormData (for server actions in forms)
export async function uploadImageFromForm(formData: FormData): Promise<UploadResult> {
  const file = formData.get('file') as File
  const folder = formData.get('folder') as string || 'general'

  return uploadImageInternal(file, folder)
}

async function uploadImageInternal(file: File, folder: string): Promise<UploadResult> {
  if (!file) {
    return { success: false, error: 'No se proporcionó archivo' }
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Tipo de archivo no permitido. Use JPG, PNG, WebP o GIF.' }
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return { success: false, error: 'El archivo es muy grande. Máximo 5MB.' }
  }

  try {
    const supabase = createAdminClient()

    // Generate unique filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

    // Convert File to ArrayBuffer then to Buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return { success: false, error: 'Error al subir la imagen' }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(data.path)

    return {
      success: true,
      url: publicUrl,
      path: data.path,
    }
  } catch (error) {
    console.error('Upload error:', error)
    return { success: false, error: 'Error inesperado al subir la imagen' }
  }
}

export async function deleteImage(path: string) {
  if (!path) {
    return { success: false, error: 'No se proporcionó la ruta del archivo' }
  }

  try {
    const supabase = createAdminClient()

    const { error } = await supabase.storage
      .from('images')
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      return { success: false, error: 'Error al eliminar la imagen' }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return { success: false, error: 'Error inesperado' }
  }
}
