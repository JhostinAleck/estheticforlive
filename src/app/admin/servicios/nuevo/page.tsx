'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { createService } from '@/lib/actions/services'
import { createClient } from '@/lib/supabase/client'
import { ImageUpload } from '@/components/admin/ImageUpload'

interface Category {
  id: string
  name: string
}

export default function NuevoServicioPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState('')

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
    is_active: true,
    is_featured: false,
  })

  useEffect(() => {
    async function loadCategories() {
      const supabase = createClient()
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('display_order')
      setCategories(data || [])
    }
    loadCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await createService({
      name: formData.name,
      category_id: formData.category_id || null,
      description: formData.description,
      short_description: formData.short_description || undefined,
      price: formData.price ? parseFloat(formData.price) : null,
      price_note: formData.price_note || undefined,
      duration_minutes: parseInt(formData.duration_minutes) || 60,
      fa_icon: formData.fa_icon,
      image_url: formData.image_url || undefined,
      is_active: formData.is_active,
      is_featured: formData.is_featured,
    })

    if (result.success) {
      router.push('/admin/servicios')
    } else {
      setError(result.error || 'Error al crear el servicio')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/servicios"
          className="p-2 hover:bg-surface rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary">Nuevo Servicio</h1>
          <p className="text-muted">Crear un nuevo servicio</p>
        </div>
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
              placeholder="Ej: Limpieza Facial Profunda"
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
              placeholder="Breve descripción para tarjetas"
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
              placeholder="Descripción detallada del servicio..."
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
                placeholder="150000"
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
                placeholder="Ej: Desde, Por sesión"
              />
            </div>
          </div>

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
                placeholder="fa-solid fa-spa"
              />
              <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center">
                <i className={`${formData.fa_icon} text-accent text-lg`} />
              </div>
            </div>
            <p className="text-xs text-muted mt-1">
              Encuentra iconos en{' '}
              <a
                href="https://fontawesome.com/search?o=r&m=free"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                fontawesome.com
              </a>
            </p>
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
                Crear Servicio
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
