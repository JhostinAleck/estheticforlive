import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Search, Filter, Eye, Phone } from 'lucide-react'
import { APPOINTMENT_STATUS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Reservas | Admin - Esthetic For Live',
  description: 'Gestión de reservas',
}

interface SearchParams {
  status?: string
  date?: string
  search?: string
  page?: string
}

interface Appointment {
  id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: string
  services: { name: string; fa_icon: string } | null
  clients: { full_name: string; phone: string; email: string | null } | null
}

async function getAppointments(searchParams: SearchParams) {
  const supabase = await createClient()
  const page = parseInt(searchParams.page || '1')
  const pageSize = 20
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('appointments')
    .select('*, services(name, fa_icon), clients(full_name, phone, email)', { count: 'exact' })
    .order('appointment_date', { ascending: false })
    .order('start_time', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status)
  }

  if (searchParams.date) {
    query = query.eq('appointment_date', searchParams.date)
  }

  const { data, count } = await query

  return {
    appointments: (data || []) as Appointment[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

export default async function ReservasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { appointments, total, page, totalPages } = await getAppointments(params)

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'confirmed', label: 'Confirmadas' },
    { value: 'completed', label: 'Completadas' },
    { value: 'cancelled', label: 'Canceladas' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Reservas</h1>
          <p className="text-muted">{total} reservas en total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-border p-4">
        <form className="flex flex-wrap gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted" />
            <select
              name="status"
              defaultValue={params.status || 'all'}
              className="px-3 py-2 rounded-lg border border-border text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted" />
            <input
              type="date"
              name="date"
              defaultValue={params.date || ''}
              className="px-3 py-2 rounded-lg border border-border text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            Filtrar
          </button>

          {(params.status || params.date) && (
            <Link
              href="/admin/reservas"
              className="px-4 py-2 text-muted hover:text-secondary text-sm"
            >
              Limpiar filtros
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
                  Servicio
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary">
                  Fecha
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary">
                  Hora
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
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted">
                    No se encontraron reservas
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => {
                  const service = apt.services as { name: string; fa_icon: string } | null
                  const client = apt.clients as { full_name: string; phone: string; email: string | null } | null
                  const status = APPOINTMENT_STATUS[apt.status as keyof typeof APPOINTMENT_STATUS]

                  return (
                    <tr key={apt.id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-secondary">
                            {client?.full_name}
                          </p>
                          <p className="text-sm text-muted flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {client?.phone}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-accent-light w-8 h-8 rounded-lg flex items-center justify-center text-accent">
                            <i className={`${service?.fa_icon || 'fa-solid fa-spa'} text-sm`} />
                          </div>
                          <span className="text-secondary">{service?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-secondary">
                        {format(parseISO(apt.appointment_date), "d MMM yyyy", { locale: es })}
                      </td>
                      <td className="px-6 py-4 text-secondary font-medium">
                        {apt.start_time.slice(0, 5)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${status?.color || 'bg-gray-100 text-gray-600'}`}
                        >
                          {status?.label || apt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/reservas/${apt.id}`}
                          className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </Link>
                      </td>
                    </tr>
                  )
                })
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
                  href={`/admin/reservas?page=${page - 1}${params.status ? `&status=${params.status}` : ''}${params.date ? `&date=${params.date}` : ''}`}
                  className="px-3 py-1 text-sm bg-surface rounded-lg hover:bg-border transition-colors"
                >
                  Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/reservas?page=${page + 1}${params.status ? `&status=${params.status}` : ''}${params.date ? `&date=${params.date}` : ''}`}
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
