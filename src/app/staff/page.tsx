import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { format, isToday, parseISO, startOfDay, endOfDay, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function StaffDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const adminClient = createAdminClient()

  // Get staff record
  const { data: staffData } = await adminClient
    .from('staff')
    .select('id, name')
    .eq('profile_id', user.id)
    .single()

  if (!staffData) redirect('/admin')

  const staff = staffData as { id: string; name: string }

  // Get today's appointments
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')

  const { data: todayAppointments } = await adminClient
    .from('appointments')
    .select(`
      id,
      appointment_date,
      start_time,
      end_time,
      status,
      client_notes,
      clients!inner(full_name, phone),
      services(name)
    `)
    .eq('staff_id', staff.id)
    .eq('appointment_date', todayStr)
    .order('start_time')

  const appointments = (todayAppointments || []) as Array<{
    id: string
    appointment_date: string
    start_time: string
    end_time: string
    status: string
    client_notes: string | null
    clients: { full_name: string; phone: string }
    services: { name: string } | null
  }>

  // Get upcoming appointments (next 7 days)
  const nextWeek = addDays(today, 7)
  const { data: upcomingAppointments } = await adminClient
    .from('appointments')
    .select(`
      id,
      appointment_date,
      start_time,
      status,
      clients!inner(full_name),
      services(name)
    `)
    .eq('staff_id', staff.id)
    .gt('appointment_date', todayStr)
    .lte('appointment_date', format(nextWeek, 'yyyy-MM-dd'))
    .in('status', ['pending', 'confirmed'])
    .order('appointment_date')
    .order('start_time')
    .limit(5)

  const upcoming = (upcomingAppointments || []) as Array<{
    id: string
    appointment_date: string
    start_time: string
    status: string
    clients: { full_name: string }
    services: { name: string } | null
  }>

  // Stats
  const pendingCount = appointments.filter(a => a.status === 'pending').length
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length
  const completedCount = appointments.filter(a => a.status === 'completed').length

  const getStatusColor = (status: string) => {
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

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-secondary">
          Hola, {staff.name.split(' ')[0]}
        </h1>
        <p className="text-muted">
          {format(today, "EEEE d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary">{pendingCount}</div>
              <div className="text-xs text-muted">Pendientes</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary">{confirmedCount}</div>
              <div className="text-xs text-muted">Confirmadas</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary">{completedCount}</div>
              <div className="text-xs text-muted">Completadas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-2xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-secondary">Citas de Hoy</h2>
          <Link
            href="/staff/citas"
            className="text-sm text-accent hover:underline flex items-center gap-1"
          >
            Ver todas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {appointments.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 text-muted mx-auto mb-3" />
              <p className="text-muted">No tienes citas programadas para hoy</p>
            </div>
          ) : (
            appointments.map((appointment) => (
              <Link
                key={appointment.id}
                href={`/staff/citas/${appointment.id}`}
                className="p-4 flex items-center justify-between hover:bg-surface transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
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
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                  {getStatusLabel(appointment.status)}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="bg-white rounded-2xl border border-border">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-secondary">Proximas Citas</h2>
          </div>
          <div className="divide-y divide-border">
            {upcoming.map((appointment) => (
              <Link
                key={appointment.id}
                href={`/staff/citas/${appointment.id}`}
                className="p-4 flex items-center justify-between hover:bg-surface transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface flex flex-col items-center justify-center">
                    <div className="text-xs font-bold text-secondary">
                      {format(parseISO(appointment.appointment_date), 'd')}
                    </div>
                    <div className="text-[10px] text-muted uppercase">
                      {format(parseISO(appointment.appointment_date), 'MMM', { locale: es })}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-secondary text-sm">
                      {appointment.clients.full_name}
                    </div>
                    <div className="text-xs text-muted">
                      {appointment.start_time.slice(0, 5)} - {appointment.services?.name}
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                  {getStatusLabel(appointment.status)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
