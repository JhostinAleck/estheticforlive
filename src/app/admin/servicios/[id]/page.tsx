'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react'
import { updateService, deleteService } from '@/lib/actions/services'
import { createClient } from '@/lib/supabase/client'
import { ImageUpload } from '@/components/admin/ImageUpload'

interface Category {
  id: string
  name: string
}

interface Service {
  id: string
  name: string
  slug: string
  category_id: string | null
  description: string
  short_description: string | null
  price: number | null
  price_note: string | null
  duration_minutes: number
  fa_icon: string
  image_url: string | null
  display_order: number
  is_active: boolean
  is_featured: boolean
}

export default function EditarServicioPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    short_description: '',
    price: '',
    price_note: '',
    duration_minutes: '60',
    fa_icon: 'fa-solid fa-spa',
    image_url: '',
    display_order: '0',
    is_active: true,
    is_featured: false,
  })

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      const [{ data: service }, { data: cats }] = await Promise.all([
        supabase.from('services').select('*').eq('id', id).single(),
        supabase.from('categories').select('id, name').order('display_order'),
      ])

      if (!service) {
        setNotFound(true)
        return
      }

      const svc = service as {
        name: string
        category_id: string | null
        description: string
        short_description: string | null
        price: number | null
        price_note: string | null
        duration_minutes: number
        fa_icon: string
        image_url: string | null
        display_order: number
        is_active: boolean
        is_featured: boolean
      }

      setCategories(cats || [])
      setFormData({
        name: svc.name,
        category_id: svc.category_id || '',
        description: svc.description,
        short_description: svc.short_description || '',
        price: svc.price?.toString() || '',
        price_note: svc.price_note || '',
        duration_minutes: svc.duration_minutes?.toString() || '60',
        fa_icon: svc.fa_icon || 'fa-solid fa-spa',
        image_url: svc.image_url || '',
        display_order: svc.display_order?.toString() || '0',
        is_active: svc.is_active,
        is_featured: svc.is_featured,
      })
    }
    loadData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await updateService(id, {
      name: formData.name,
      category_id: formData.category_id || null,
      description: formData.description,
      short_description: formData.short_description || undefined,
      price: formData.price ? parseFloat(formData.price) : null,
      price_note: formData.price_note || undefined,
      duration_minutes: parseInt(formData.duration_minutes) || 60,
      fa_icon: formData.fa_icon,
      image_url: formData.image_url || undefined,
      display_order: parseInt(formData.display_order) || 0,
      is_active: formData.is_active,
      is_featured: formData.is_featured,
    })

    if (result.success) {
      router.push('/admin/servicios')
    } else {
      setError(result.error || 'Error al actualizar el servicio')
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    const result = await deleteService(id)

    if (result.success) {
      router.push('/admin/servicios')
    } else {
      setError(result.error || 'Error al eliminar el servicio')
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-secondary mb-4">Servicio no encontrado</h1>
        <Link href="/admin/servicios" className="text-accent hover:underline">
          Volver a servicios
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/servicios"
            className="p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-secondary">Editar Servicio</h1>
            <p className="text-muted">{formData.name || 'Cargando...'}</p>
          </div>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Eliminar servicio"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-secondary">Información Básica</h2>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Nombre del servicio *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Categoría
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Descripción corta
            </label>
            <input
              type="text"
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
              maxLength={255}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Descripción completa *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 min-h-[120px]"
              required
            />
          </div>
        </div>

        {/* Pricing and Duration */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-secondary">Precio y Duración</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                Precio (COP)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                Nota de precio
              </label>
              <input
                type="text"
                value={formData.price_note}
                onChange={(e) => setFormData({ ...formData, price_note: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                Duración (minutos)
              </label>
              <select
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">1 hora</option>
                <option value="90">1 hora 30 min</option>
                <option value="120">2 horas</option>
                <option value="150">2 horas 30 min</option>
                <option value="180">3 horas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                Orden de visualización
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-secondary">Apariencia</h2>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Imagen del servicio
            </label>
            <ImageUpload
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
              folder="services"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Icono (FontAwesome)
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={formData.fa_icon}
                onChange={(e) => setFormData({ ...formData, fa_icon: e.target.value })}
                className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center">
                <i className={`${formData.fa_icon} text-accent text-lg`} />
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-secondary">Estado</h2>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-border text-accent focus:ring-accent"
              />
              <span className="text-secondary">Servicio activo (visible en el sitio)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-5 h-5 rounded border-border text-accent focus:ring-accent"
              />
              <span className="text-secondary">Servicio destacado</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/servicios"
            className="px-6 py-2 border border-border rounded-lg text-secondary hover:bg-surface transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-secondary mb-2">Eliminar servicio</h3>
            <p className="text-muted mb-6">
              ¿Estás seguro de que deseas eliminar <strong>{formData.name}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-border rounded-lg text-secondary hover:bg-surface transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
