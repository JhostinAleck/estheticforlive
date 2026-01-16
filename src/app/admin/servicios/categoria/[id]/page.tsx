'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react'
import { updateCategory, deleteCategory, getCategoryWithServiceCount } from '@/lib/actions/services'

export default function EditarCategoriaPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [serviceCount, setServiceCount] = useState(0)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fa_icon: 'fa-solid fa-spa',
    display_order: '0',
    is_active: true,
  })

  useEffect(() => {
    async function loadData() {
      const { category, serviceCount } = await getCategoryWithServiceCount(id)

      if (!category) {
        setNotFound(true)
        return
      }

      const cat = category as {
        name: string
        description: string | null
        fa_icon: string
        display_order: number
        is_active: boolean
      }

      setServiceCount(serviceCount)
      setFormData({
        name: cat.name,
        description: cat.description || '',
        fa_icon: cat.fa_icon || 'fa-solid fa-spa',
        display_order: cat.display_order?.toString() || '0',
        is_active: cat.is_active,
      })
    }
    loadData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await updateCategory(id, {
      name: formData.name,
      description: formData.description || undefined,
      fa_icon: formData.fa_icon,
      display_order: parseInt(formData.display_order) || 0,
      is_active: formData.is_active,
    })

    if (result.success) {
      router.push('/admin/servicios')
    } else {
      setError(result.error || 'Error al actualizar la categoría')
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    const result = await deleteCategory(id)

    if (result.success) {
      router.push('/admin/servicios')
    } else {
      setError(result.error || 'Error al eliminar la categoría')
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-secondary mb-4">Categoría no encontrada</h1>
        <Link href="/admin/servicios" className="text-accent hover:underline">
          Volver a servicios
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
            <h1 className="text-2xl font-bold text-secondary">Editar Categoría</h1>
            <p className="text-muted">{formData.name || 'Cargando...'} · {serviceCount} servicios</p>
          </div>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Eliminar categoría"
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
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Nombre de la categoría *
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
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                  <i className={`${formData.fa_icon} text-white text-sm`} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                Orden
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

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 rounded border-border text-accent focus:ring-accent"
            />
            <span className="text-secondary">Categoría activa</span>
          </label>
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
            <h3 className="text-lg font-semibold text-secondary mb-2">Eliminar categoría</h3>
            <p className="text-muted mb-6">
              ¿Estás seguro de que deseas eliminar <strong>{formData.name}</strong>?
              {serviceCount > 0 && (
                <span className="block mt-2 text-amber-600">
                  Esta categoría tiene {serviceCount} servicio(s). Debes moverlos o eliminarlos primero.
                </span>
              )}
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
                disabled={deleting || serviceCount > 0}
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
