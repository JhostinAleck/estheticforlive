import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

interface PageProps {
  searchParams: Promise<{ week?: string }>
}

export default async function StaffCitasPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const adminClient = createAdminClient()

  // Get staff record
  const { data: staffData } = await adminClient
    .from('staff')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!staffData) redirect('/admin')

  const staff = staffData as { id: string }

  // Calculate week range
  const baseDate = params.week ? parseISO(params.week) : new Date()
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(baseDate, { weekStartsOn: 1 })
  const prevWeek = format(subWeeks(weekStart, 1), 'yyyy-MM-dd')
  const nextWeek = format(addWeeks(weekStart, 1), 'yyyy-MM-dd')
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Get appointments for the week
  const { data: appointmentsData } = await adminClient
    .from('appointments')
    .select(`
      id,
      appointment_date,
      start_time,
      end_time,
      status,
      clients!inner(full_name, phone),
      services(name)
    `)
    .eq('staff_id', staff.id)
    .gte('appointment_date', format(weekStart, 'yyyy-MM-dd'))
    .lte('appointment_date', format(weekEnd, 'yyyy-MM-dd'))
    .order('appointment_date')
    .order('start_time')

  const appointments = (appointmentsData || []) as Array<{
    id: string
    appointment_date: string
    start_time: string
    end_time: string
    status: string
    clients: { full_name: string; phone: string }
    services: { name: string } | null
  }>

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'border-l-yellow-500 bg-yellow-50'
      case 'confirmed': return 'border-l-blue-500 bg-blue-50'
      case 'completed': return 'border-l-green-500 bg-green-50'
      case 'cancelled': return 'border-l-red-500 bg-red-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'confirmed': return 'bg-blue-100 text-blue-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'confirmed': return 'Confirmada'
      case 'completed': return 'Completada'
      case 'cancelled': return 'Cancelada'
      default: return status
    }
  }

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(a =>
      isSameDay(parseISO(a.appointment_date), date)
    )
  }

  const today = new Date()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Mis Citas</h1>
          <p className="text-muted">
            Semana del {format(weekStart, "d 'de' MMMM", { locale: es })} al {format(weekEnd, "d 'de' MMMM", { locale: es })}
          </p>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center gap-2">
          <Link
            href={`/staff/citas?week=${prevWeek}`}
            className="p-2 rounded-lg border border-border hover:bg-surface transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <Link
            href="/staff/citas"
            className="px-4 py-2 rounded-lg border border-border hover:bg-surface transition-colors text-sm font-medium"
          >
            Hoy
          </Link>
          <Link
            href={`/staff/citas?week=${nextWeek}`}
            className="p-2 rounded-lg border border-border hover:bg-surface transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Week View */}
      <div className="space-y-4">
        {daysOfWeek.map((day) => {
          const dayAppointments = getAppointmentsForDay(day)
          const isToday = isSameDay(day, today)

          return (
            <div key={day.toISOString()} className="bg-white rounded-xl border border-border overflow-hidden">
              <div className={`px-4 py-3 border-b border-border ${isToday ? 'bg-accent/10' : 'bg-surface'}`}>
                <div className="flex items-center gap-2">
                  {isToday && (
                    <span className="w-2 h-2 rounded-full bg-accent" />
                  )}
                  <span className={`font-medium ${isToday ? 'text-accent' : 'text-secondary'}`}>
                    {format(day, "EEEE d 'de' MMMM", { locale: es })}
                  </span>
                  <span className="text-sm text-muted">
                    ({dayAppointments.length} citas)
                  </span>
                </div>
              </div>

              {dayAppointments.length === 0 ? (
                <div className="p-6 text-center text-muted text-sm">
                  Sin citas programadas
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {dayAppointments.map((appointment) => (
                    <Link
                      key={appointment.id}
                      href={`/staff/citas/${appointment.id}`}
                      className={`block p-4 border-l-4 hover:bg-surface/50 transition-colors ${getStatusColor(appointment.status)}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4">
                          <div className="text-center min-w-[60px]">
                            <div className="text-lg font-bold text-secondary">
                              {appointment.start_time.slice(0, 5)}
                            </div>
                            <div className="text-xs text-muted">
                              {appointment.end_time.slice(0, 5)}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-secondary">
                              {appointment.clients.full_name}
                            </div>
                            <div className="text-sm text-muted">
                              {appointment.services?.name || 'Servicio no especificado'}
                            </div>
                            <div className="text-xs text-muted mt-1">
                              {appointment.clients.phone}
                            </div>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(appointment.status)}`}>
                          {getStatusLabel(appointment.status)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
