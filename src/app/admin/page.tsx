import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { format, startOfToday, endOfToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { APPOINTMENT_STATUS } from '@/lib/constants'

interface Appointment {
  id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: string
  created_at: string
  services: { name: string; fa_icon: string } | null
  clients: { full_name: string; phone: string } | null
}

export const metadata: Metadata = {
  title: 'Dashboard | Admin - Esthetic For Live',
  description: 'Panel de administración',
}

async function getDashboardData() {
  const supabase = await createClient()
  const today = startOfToday()
  const todayEnd = endOfToday()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)

  // Today's appointments
  const { data: todayAppointments, count: todayCount } = await supabase
    .from('appointments')
    .select('*, services(name, fa_icon), clients(full_name, phone)', { count: 'exact' })
    .eq('appointment_date', format(today, 'yyyy-MM-dd'))
    .in('status', ['pending', 'confirmed'])
    .order('start_time')

  // This week stats
  const { count: weekCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('appointment_date', format(weekStart, 'yyyy-MM-dd'))
    .lte('appointment_date', format(weekEnd, 'yyyy-MM-dd'))

  // This month stats
  const { count: monthCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('appointment_date', format(monthStart, 'yyyy-MM-dd'))
    .lte('appointment_date', format(monthEnd, 'yyyy-MM-dd'))

  // Pending confirmations
  const { count: pendingCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Total clients
  const { count: clientCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })

  // Recent appointments
  const { data: recentAppointments } = await supabase
    .from('appointments')
    .select('*, services(name), clients(full_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    todayAppointments: (todayAppointments || []) as Appointment[],
    todayCount: todayCount || 0,
    weekCount: weekCount || 0,
    monthCount: monthCount || 0,
    pendingCount: pendingCount || 0,
    clientCount: clientCount || 0,
    recentAppointments: (recentAppointments || []) as Appointment[],
  }
}

export default async function AdminDashboard() {
  const {
    todayAppointments,
    todayCount,
    weekCount,
    monthCount,
    pendingCount,
    clientCount,
    recentAppointments,
  } = await getDashboardData()

  const stats = [
    {
      label: 'Citas Hoy',
      value: todayCount,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-blue-500',
    },
    {
      label: 'Esta Semana',
      value: weekCount,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-green-500',
    },
    {
      label: 'Pendientes',
      value: pendingCount,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-amber-500',
    },
    {
      label: 'Clientes',
      value: clientCount,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary">Dashboard</h1>
        <p className="text-muted">
          {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-6 border border-border"
          >
            <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4`}>
              {stat.icon}
            </div>
            <p className="text-3xl font-bold text-secondary">{stat.value}</p>
            <p className="text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-2xl border border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-secondary">Citas de Hoy</h2>
            <Link
              href="/admin/reservas"
              className="text-sm text-accent hover:underline flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {todayAppointments.length === 0 ? (
              <div className="p-8 text-center text-muted">
                No hay citas programadas para hoy
              </div>
            ) : (
              todayAppointments.map((apt) => {
                const service = apt.services as { name: string; fa_icon: string } | null
                const client = apt.clients as { full_name: string; phone: string } | null
                const status = APPOINTMENT_STATUS[apt.status as keyof typeof APPOINTMENT_STATUS]

                return (
                  <Link
                    key={apt.id}
                    href={`/admin/reservas/${apt.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-surface transition-colors"
                  >
                    <div className="bg-accent-light w-12 h-12 rounded-xl flex items-center justify-center text-accent shrink-0">
                      <i className={`${service?.fa_icon || 'fa-solid fa-spa'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-secondary truncate">
                        {client?.full_name}
                      </p>
                      <p className="text-sm text-muted truncate">
                        {service?.name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-medium text-secondary">
                        {apt.start_time.slice(0, 5)}
                      </p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${status?.color || 'bg-gray-100 text-gray-600'}`}
                      >
                        {status?.label || apt.status}
                      </span>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="font-semibold text-secondary">Actividad Reciente</h2>
          </div>
          <div className="divide-y divide-border">
            {recentAppointments.length === 0 ? (
              <div className="p-8 text-center text-muted">
                No hay actividad reciente
              </div>
            ) : (
              recentAppointments.map((apt) => {
                const service = apt.services as { name: string } | null
                const client = apt.clients as { full_name: string } | null

                return (
                  <div key={apt.id} className="flex items-center gap-4 p-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      apt.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                      apt.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {apt.status === 'confirmed' ? <CheckCircle className="w-5 h-5" /> :
                       apt.status === 'cancelled' ? <XCircle className="w-5 h-5" /> :
                       <Clock className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-secondary">
                        <span className="font-medium">{client?.full_name}</span>
                        {' - '}
                        {service?.name}
                      </p>
                      <p className="text-xs text-muted">
                        {format(new Date(apt.created_at), "d MMM, HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
