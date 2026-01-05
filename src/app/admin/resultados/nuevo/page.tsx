'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createResult } from '@/lib/actions/results'
import { uploadImage } from '@/lib/actions/upload'

export default function NuevoResultadoPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
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
      toast.error('Debes subir ambas imágenes (antes y después)')
      return
    }

    setIsSubmitting(true)

    const result = await createResult(formData)

    if (result.success) {
      toast.success('Resultado creado exitosamente')
      router.push('/admin/resultados')
    } else {
      toast.error(result.error || 'Error al crear el resultado')
    }

    setIsSubmitting(false)
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
        <h1 className="text-2xl font-bold text-secondary">Nuevo Resultado</h1>
        <p className="text-muted">Agrega una nueva transformación antes/después</p>
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
                    {uploadingBefore ? 'Subiendo...' : 'Seleccionar imagen'}
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
                    {uploadingAfter ? 'Subiendo...' : 'Seleccionar imagen'}
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
            {isSubmitting ? 'Guardando...' : 'Guardar Resultado'}
          </Button>
        </div>
      </form>
    </div>
  )
}
