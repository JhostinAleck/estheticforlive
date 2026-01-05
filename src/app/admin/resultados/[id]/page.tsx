'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getResultById, updateResult, deleteResult } from '@/lib/actions/results'
import { uploadImage } from '@/lib/actions/upload'

export default function EditarResultadoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [uploadingBefore, setUploadingBefore] = useState(false)
  const [uploadingAfter, setUploadingAfter] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    before_image_url: '',
    after_image_url: '',
    display_order: 0,
    is_active: true,
  })

  useEffect(() => {
    async function loadResult() {
      const result = await getResultById(id)
      if (result) {
        setFormData({
          title: result.title,
          description: result.description || '',
          before_image_url: result.before_image_url,
          after_image_url: result.after_image_url,
          display_order: result.display_order,
          is_active: result.is_active,
        })
      } else {
        toast.error('Resultado no encontrado')
        router.push('/admin/resultados')
      }
      setIsLoading(false)
    }
    loadResult()
  }, [id, router])

  const handleImageUpload = async (file: File, type: 'before' | 'after') => {
    if (type === 'before') setUploadingBefore(true)
    else setUploadingAfter(true)

    try {
      const result = await uploadImage(file, 'results')
      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          [type === 'before' ? 'before_image_url' : 'after_image_url']: result.url,
        }))
        toast.success('Imagen subida correctamente')
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Error al subir la imagen')
    } finally {
      if (type === 'before') setUploadingBefore(false)
      else setUploadingAfter(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('El título es requerido')
      return
    }

    if (!formData.before_image_url || !formData.after_image_url) {
      toast.error('Debes tener ambas imágenes (antes y después)')
      return
    }

    setIsSubmitting(true)

    const result = await updateResult(id, formData)

    if (result.success) {
      toast.success('Resultado actualizado exitosamente')
      router.push('/admin/resultados')
    } else {
      toast.error(result.error || 'Error al actualizar el resultado')
    }

    setIsSubmitting(false)
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este resultado? Esta acción no se puede deshacer.')) {
      return
    }

    setIsDeleting(true)

    const result = await deleteResult(id)

    if (result.success) {
      toast.success('Resultado eliminado')
      router.push('/admin/resultados')
    } else {
      toast.error(result.error || 'Error al eliminar')
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-muted">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/resultados"
          className="inline-flex items-center text-sm text-muted hover:text-accent transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver a resultados
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary">Editar Resultado</h1>
            <p className="text-muted">Modifica la transformación antes/después</p>
          </div>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Título *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Limpieza facial profunda"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción opcional del tratamiento..."
              rows={3}
              className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            />
          </div>

          {/* Images */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Before Image */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                Imagen Antes *
              </label>
              <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
                {formData.before_image_url ? (
                  <div className="relative aspect-square mb-2">
                    <img
                      src={formData.before_image_url}
                      alt="Antes"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="aspect-square flex items-center justify-center bg-surface rounded-lg mb-2">
                    <Upload className="w-8 h-8 text-muted" />
                  </div>
                )}
                <label className="cursor-pointer">
                  <span className="text-sm text-accent hover:underline">
                    {uploadingBefore ? 'Subiendo...' : 'Cambiar imagen'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, 'before')
                    }}
                    disabled={uploadingBefore}
                  />
                </label>
              </div>
            </div>

            {/* After Image */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                Imagen Después *
              </label>
              <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
                {formData.after_image_url ? (
                  <div className="relative aspect-square mb-2">
                    <img
                      src={formData.after_image_url}
                      alt="Después"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="aspect-square flex items-center justify-center bg-surface rounded-lg mb-2">
                    <Upload className="w-8 h-8 text-muted" />
                  </div>
                )}
                <label className="cursor-pointer">
                  <span className="text-sm text-accent hover:underline">
                    {uploadingAfter ? 'Subiendo...' : 'Cambiar imagen'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, 'after')
                    }}
                    disabled={uploadingAfter}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Order */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                Orden de visualización
              </label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) =>
                  setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                }
                min={0}
              />
              <p className="text-xs text-muted mt-1">Menor número = aparece primero</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Estado</label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-accent focus:ring-accent"
                />
                <span className="text-sm text-secondary">Visible en el sitio</span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/admin/resultados" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting || uploadingBefore || uploadingAfter}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </div>
  )
}
