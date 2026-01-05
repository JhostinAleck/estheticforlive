import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search, Phone, Mail, Calendar, Eye } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Clientes | Admin - Esthetic For Live',
  description: 'Gestión de clientes',
}

interface SearchParams {
  search?: string
  page?: string
}

interface Client {
  id: string
  full_name: string
  phone: string
  email: string | null
  total_appointments: number
  last_appointment_at: string | null
  created_at: string
}

async function getClients(searchParams: SearchParams) {
  const supabase = await createClient()
  const page = parseInt(searchParams.page || '1')
  const pageSize = 20
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('clients')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (searchParams.search) {
    query = query.or(`full_name.ilike.%${searchParams.search}%,phone.ilike.%${searchParams.search}%,email.ilike.%${searchParams.search}%`)
  }

  const { data, count } = await query

  return {
    clients: (data || []) as Client[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { clients, total, page, totalPages } = await getClients(params)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Clientes</h1>
          <p className="text-muted">{total} clientes registrados</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-border p-4">
        <form className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              name="search"
              placeholder="Buscar por nombre, teléfono o email..."
              defaultValue={params.search || ''}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            Buscar
          </button>
          {params.search && (
            <Link
              href="/admin/clientes"
              className="px-4 py-2 text-muted hover:text-secondary text-sm flex items-center"
            >
              Limpiar
            </Link>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary">
                  Cliente
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary">
                  Contacto
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary">
                  Citas
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary">
                  Última cita
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary">
                  Registro
                </th>
                <th className="text-right px-6 py-4 text-sm font-medium text-secondary">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted">
                    No se encontraron clientes
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center text-accent font-semibold">
                          {client.full_name.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-medium text-secondary">{client.full_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-secondary flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-muted" />
                          {client.phone}
                        </p>
                        {client.email && (
                          <p className="text-sm text-muted flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {client.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted" />
                        <span className="text-secondary font-medium">
                          {client.total_appointments}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-secondary">
                      {client.last_appointment_at
                        ? format(parseISO(client.last_appointment_at), "d MMM yyyy", { locale: es })
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 text-muted text-sm">
                      {format(parseISO(client.created_at), "d MMM yyyy", { locale: es })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/clientes/${client.id}`}
                        className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/clientes?page=${page - 1}${params.search ? `&search=${params.search}` : ''}`}
                  className="px-3 py-1 text-sm bg-surface rounded-lg hover:bg-border transition-colors"
                >
                  Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/clientes?page=${page + 1}${params.search ? `&search=${params.search}` : ''}`}
                  className="px-3 py-1 text-sm bg-surface rounded-lg hover:bg-border transition-colors"
                >
                  Siguiente
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
