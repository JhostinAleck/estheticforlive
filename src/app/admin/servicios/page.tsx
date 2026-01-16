import { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Servicios | Admin - Esthetic For Live',
  description: 'Gestión de servicios',
}

interface Category {
  id: string
  name: string
  slug: string
  fa_icon: string
  is_active: boolean
}

interface Service {
  id: string
  name: string
  slug: string
  fa_icon: string
  price: number | null
  duration_minutes: number
  is_active: boolean
  categories: { name: string } | null
}

async function getServices() {
  const supabase = createAdminClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order')

  const { data: services } = await supabase
    .from('services')
    .select('*, categories(name)')
    .order('display_order')

  return {
    categories: (categories || []) as Category[],
    services: (services || []) as Service[]
  }
}

export default async function ServiciosPage() {
  const { categories, services } = await getServices()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Servicios</h1>
          <p className="text-muted">{services.length} servicios, {categories.length} categorías</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/servicios/nueva-categoria"
            className="px-4 py-2 bg-surface border border-border rounded-lg text-sm font-medium hover:bg-border transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Categoría
          </Link>
          <Link
            href="/admin/servicios/nuevo"
            className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Servicio
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-2xl border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="font-semibold text-secondary">Categorías</h2>
        </div>
        <div className="divide-y divide-border">
          {categories.length === 0 ? (
            <div className="p-8 text-center text-muted">
              No hay categorías creadas
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 hover:bg-surface/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${category.is_active ? 'bg-accent text-white' : 'bg-surface text-muted'}`}>
                    <i className={`${category.fa_icon} text-sm`} />
                  </div>
                  <div>
                    <p className="font-medium text-secondary">{category.name}</p>
                    <p className="text-sm text-muted">{category.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${category.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {category.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/servicios/categoria/${category.id}`}
                      className="p-2 text-muted hover:text-accent transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="font-semibold text-secondary">Todos los Servicios</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary">
                  Servicio
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary">
                  Categoría
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary">
                  Precio
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary">
                  Duración
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary">
                  Estado
                </th>
                <th className="text-right px-6 py-4 text-sm font-medium text-secondary">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted">
                    No hay servicios creados
                  </td>
                </tr>
              ) : (
                services.map((service) => {
                  const category = service.categories as { name: string } | null

                  return (
                    <tr key={service.id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${service.is_active ? 'bg-accent-light text-accent' : 'bg-surface text-muted'}`}>
                            <i className={`${service.fa_icon} text-sm`} />
                          </div>
                          <div>
                            <p className="font-medium text-secondary">{service.name}</p>
                            <p className="text-xs text-muted">{service.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-secondary">
                        {category?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-secondary font-medium">
                        {service.price ? formatPrice(service.price) : '-'}
                      </td>
                      <td className="px-6 py-4 text-secondary">
                        {service.duration_minutes ? `${service.duration_minutes} min` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {service.is_active ? (
                            <Eye className="w-4 h-4 text-green-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-muted" />
                          )}
                          <span className={`text-xs ${service.is_active ? 'text-green-600' : 'text-muted'}`}>
                            {service.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/servicios/${service.id}`}
                          className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
