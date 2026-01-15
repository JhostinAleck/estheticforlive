import { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { format, startOfToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CalendarDays,
  Scissors,
  UserPlus,
  Star,
} from 'lucide-react'
import { APPOINTMENT_STATUS } from '@/lib/constants'

interface Appointment {
  id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: string
  created_at: string
  price: number | null
  services: { name: string; fa_icon: string; price: number | null } | null
  clients: { full_name: string; phone: string } | null
}

interface ServiceStats {
  name: string
  count: number
}

interface TopServiceData {
  service_id: string
  services: { name: string } | null
}

interface MonthAppointment {
  status: string
  price: number | null
  services: { price: number | null } | null
}

export const metadata: Metadata = {
  title: 'Dashboard | Admin - Esthetic For Live',
  description: 'Panel de administración',
}

async function getDashboardData() {
  const supabase = createAdminClient()
  const today = startOfToday()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const lastMonthStart = startOfMonth(subMonths(today, 1))
  const lastMonthEnd = endOfMonth(subMonths(today, 1))

  // Today's appointments
  const { data: todayAppointments, count: todayCount } = await supabase
    .from('appointments')
    .select('*, services(name, fa_icon, price), clients(full_name, phone)', { count: 'exact' })
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
  const { data: monthAppointments, count: monthCount } = await supabase
    .from('appointments')
    .select('*, services(price)')
    .gte('appointment_date', format(monthStart, 'yyyy-MM-dd'))
    .lte('appointment_date', format(monthEnd, 'yyyy-MM-dd'))

  // Last month for comparison
  const { count: lastMonthCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('appointment_date', format(lastMonthStart, 'yyyy-MM-dd'))
    .lte('appointment_date', format(lastMonthEnd, 'yyyy-MM-dd'))

  // Completed this month
  const { count: completedCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('appointment_date', format(monthStart, 'yyyy-MM-dd'))
    .lte('appointment_date', format(monthEnd, 'yyyy-MM-dd'))
    .eq('status', 'completed')

  // Cancelled this month
  const { count: cancelledCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('appointment_date', format(monthStart, 'yyyy-MM-dd'))
    .lte('appointment_date', format(monthEnd, 'yyyy-MM-dd'))
    .eq('status', 'cancelled')

  // Pending confirmations
  const { count: pendingCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Total clients
  const { count: clientCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })

  // New clients this month
  const { count: newClientsCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', format(monthStart, 'yyyy-MM-dd'))

  // Recent appointments
  const { data: recentAppointments } = await supabase
    .from('appointments')
    .select('*, services(name), clients(full_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  // Top services this month
  const { data: topServicesData } = await supabase
    .from('appointments')
    .select('service_id, services(name)')
    .gte('appointment_date', format(monthStart, 'yyyy-MM-dd'))
    .lte('appointment_date', format(monthEnd, 'yyyy-MM-dd'))
    .not('service_id', 'is', null)

  // Calculate top services
  const serviceCountMap: Record<string, { name: string; count: number }> = {}
  const typedTopServices = (topServicesData || []) as TopServiceData[]
  typedTopServices.forEach((apt) => {
    const service = apt.services
    if (service?.name) {
      if (!serviceCountMap[service.name]) {
        serviceCountMap[service.name] = { name: service.name, count: 0 }
      }
      serviceCountMap[service.name].count++
    }
  })
  const topServices = Object.values(serviceCountMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Calculate estimated revenue
  const typedMonthAppointments = (monthAppointments || []) as MonthAppointment[]
  const estimatedRevenue = typedMonthAppointments.reduce((sum, apt) => {
    const price = apt.price || apt.services?.price || 0
    return apt.status !== 'cancelled' ? sum + price : sum
  }, 0)

  // Growth percentage
  const growthPercentage = lastMonthCount && lastMonthCount > 0
    ? Math.round(((monthCount || 0) - lastMonthCount) / lastMonthCount * 100)
    : 0

  return {
    todayAppointments: (todayAppointments || []) as Appointment[],
    todayCount: todayCount || 0,
    weekCount: weekCount || 0,
    monthCount: monthCount || 0,
    completedCount: completedCount || 0,
    cancelledCount: cancelledCount || 0,
    pendingCount: pendingCount || 0,
    clientCount: clientCount || 0,
    newClientsCount: newClientsCount || 0,
    recentAppointments: (recentAppointments || []) as Appointment[],
    topServices,
    estimatedRevenue,
    growthPercentage,
  }
}

export default async function AdminDashboard() {
  const {
    todayAppointments,
    todayCount,
    weekCount,
    monthCount,
    completedCount,
    cancelledCount,
    pendingCount,
    clientCount,
    newClientsCount,
    recentAppointments,
    topServices,
    estimatedRevenue,
    growthPercentage,
  } = await getDashboardData()

  const stats = [
    {
      label: 'Citas Hoy',
      value: todayCount,
      icon: <Calendar className="w-5 h-5" />,
      color: 'bg-blue-500',
      href: '/admin/calendario',
    },
    {
      label: 'Esta Semana',
      value: weekCount,
      icon: <CalendarDays className="w-5 h-5" />,
      color: 'bg-indigo-500',
      href: '/admin/reservas',
    },
    {
      label: 'Pendientes',
      value: pendingCount,
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-amber-500',
      href: '/admin/reservas?status=pending',
    },
    {
      label: 'Total Clientes',
      value: clientCount,
      icon: <Users className="w-5 h-5" />,
      color: 'bg-purple-500',
      href: '/admin/clientes',
    },
  ]

  const quickActions = [
    { label: 'Ver Calendario', href: '/admin/calendario', icon: <CalendarDays className="w-5 h-5" /> },
    { label: 'Gestionar Servicios', href: '/admin/servicios', icon: <Scissors className="w-5 h-5" /> },
    { label: 'Ver Clientes', href: '/admin/clientes', icon: <Users className="w-5 h-5" /> },
    { label: 'Agregar Personal', href: '/admin/personal/nuevo', icon: <UserPlus className="w-5 h-5" /> },
  ]

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-secondary">Dashboard</h1>
          <p className="text-sm md:text-base text-muted capitalize">
            {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/calendario"
            className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            Ver Calendario
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-2xl p-4 md:p-6 border border-border hover:border-accent/30 transition-colors"
          >
            <div className={`${stat.color} w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white mb-3 md:mb-4`}>
              {stat.icon}
            </div>
            <p className="text-2xl md:text-3xl font-bold text-secondary">{stat.value}</p>
            <p className="text-xs md:text-sm text-muted">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Month Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-accent to-pink-600 rounded-2xl p-5 md:p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium opacity-90">Este Mes</h3>
            <div className={`flex items-center gap-1 text-sm ${growthPercentage >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              {growthPercentage >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {growthPercentage > 0 ? '+' : ''}{growthPercentage}%
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-bold mb-1">{monthCount}</p>
          <p className="text-sm opacity-80">citas totales</p>
        </div>

        <div className="bg-white rounded-2xl p-5 md:p-6 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 w-10 h-10 rounded-xl flex items-center justify-center text-green-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">{completedCount}</p>
              <p className="text-xs text-muted">Completadas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 w-10 h-10 rounded-xl flex items-center justify-center text-red-600">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">{cancelledCount}</p>
              <p className="text-xs text-muted">Canceladas</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 md:p-6 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 w-10 h-10 rounded-xl flex items-center justify-center text-purple-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">{newClientsCount}</p>
              <p className="text-xs text-muted">Nuevos clientes</p>
            </div>
          </div>
          {estimatedRevenue > 0 && (
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 w-10 h-10 rounded-xl flex items-center justify-center text-emerald-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary">
                  ${estimatedRevenue.toLocaleString('es-CO')}
                </p>
                <p className="text-xs text-muted">Ingresos estimados</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border">
          <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
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
              todayAppointments.slice(0, 6).map((apt) => {
                const service = apt.services as { name: string; fa_icon: string } | null
                const client = apt.clients as { full_name: string; phone: string } | null
                const status = APPOINTMENT_STATUS[apt.status as keyof typeof APPOINTMENT_STATUS]

                return (
                  <Link
                    key={apt.id}
                    href={`/admin/reservas/${apt.id}`}
                    className="flex items-center gap-3 md:gap-4 p-3 md:p-4 hover:bg-surface transition-colors"
                  >
                    <div className="bg-accent-light w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-accent shrink-0">
                      <i className={`${service?.fa_icon || 'fa-solid fa-spa'} text-sm md:text-base`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-secondary truncate text-sm md:text-base">
                        {client?.full_name}
                      </p>
                      <p className="text-xs md:text-sm text-muted truncate">
                        {service?.name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-medium text-secondary text-sm md:text-base">
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Services */}
          <div className="bg-white rounded-2xl border border-border">
            <div className="p-4 md:p-6 border-b border-border">
              <h2 className="font-semibold text-secondary flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Servicios Populares
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {topServices.length === 0 ? (
                <p className="text-sm text-muted text-center py-4">Sin datos este mes</p>
              ) : (
                topServices.map((service, idx) => (
                  <div key={service.name} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-amber-100 text-amber-600' :
                      idx === 1 ? 'bg-gray-100 text-gray-600' :
                      idx === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-surface text-muted'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-secondary truncate">{service.name}</p>
                    </div>
                    <span className="text-sm font-medium text-muted">{service.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-border">
            <div className="p-4 md:p-6 border-b border-border">
              <h2 className="font-semibold text-secondary">Acciones Rápidas</h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-surface transition-colors text-center"
                >
                  <div className="w-10 h-10 bg-accent-light rounded-xl flex items-center justify-center text-accent">
                    {action.icon}
                  </div>
                  <span className="text-xs text-secondary">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-border">
        <div className="p-4 md:p-6 border-b border-border">
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
                <div key={apt.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 ${
                    apt.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                    apt.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                    apt.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>
                    {apt.status === 'confirmed' || apt.status === 'completed' ? <CheckCircle className="w-4 h-4 md:w-5 md:h-5" /> :
                     apt.status === 'cancelled' ? <XCircle className="w-4 h-4 md:w-5 md:h-5" /> :
                     <Clock className="w-4 h-4 md:w-5 md:h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-secondary">
                      <span className="font-medium">{client?.full_name}</span>
                      {' - '}
                      <span className="text-muted">{service?.name}</span>
                    </p>
                    <p className="text-xs text-muted">
                      {format(new Date(apt.created_at), "d MMM, HH:mm", { locale: es })}
                    </p>
                  </div>
                  <Link
                    href={`/admin/reservas/${apt.id}`}
                    className="text-xs text-accent hover:underline shrink-0"
                  >
                    Ver
                  </Link>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
