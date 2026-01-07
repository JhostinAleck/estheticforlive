'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Grid3X3,
  Clock,
  User,
  Phone,
  Eye,
  CalendarOff,
} from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { APPOINTMENT_STATUS } from '@/lib/constants'

interface Appointment {
  id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: string
  services: { name: string } | null
  clients: { full_name: string; phone: string } | null
}

interface SpecialDate {
  id: string
  date: string
  description: string | null
  is_closed: boolean
}

export default function StaffCalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [calendarView, setCalendarView] = useState<'month' | 'list'>('month')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [staffId, setStaffId] = useState<string | null>(null)

  const loadStaffId = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: staffData } = await supabase
      .from('staff')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (staffData) {
      setStaffId((staffData as { id: string }).id)
    }
  }, [])

  const loadAppointments = useCallback(async () => {
    if (!staffId) return

    setIsLoading(true)
    const supabase = createClient()

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)

    const { data } = await supabase
      .from('appointments')
      .select('id, appointment_date, start_time, end_time, status, services(name), clients(full_name, phone)')
      .eq('staff_id', staffId)
      .gte('appointment_date', format(monthStart, 'yyyy-MM-dd'))
      .lte('appointment_date', format(monthEnd, 'yyyy-MM-dd'))
      .order('appointment_date')
      .order('start_time')

    setAppointments((data || []) as Appointment[])
    setIsLoading(false)
  }, [currentDate, staffId])

  const loadSpecialDates = useCallback(async () => {
    if (!staffId) return

    const supabase = createClient()
    const { data } = await supabase
      .from('staff_special_dates')
      .select('id, date, description, is_closed')
      .eq('staff_id', staffId)

    setSpecialDates((data || []) as SpecialDate[])
  }, [staffId])

  useEffect(() => {
    loadStaffId()
  }, [loadStaffId])

  useEffect(() => {
    if (staffId) {
      loadAppointments()
      loadSpecialDates()
    }
  }, [staffId, loadAppointments, loadSpecialDates])

  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  // Generate calendar days
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter((apt) =>
      isSameDay(parseISO(apt.appointment_date), day)
    )
  }

  // Check if a day is blocked
  const isDayBlocked = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    return specialDates.some(sd => sd.date === dateStr && sd.is_closed)
  }

  const selectedDayAppointments = selectedDate
    ? getAppointmentsForDay(selectedDate)
    : []

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Mi Calendario</h1>
          <p className="text-sm md:text-base text-gray-500">
            Vista de tus citas del mes
          </p>
        </div>

        {/* Calendar Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 min-w-[180px] text-center capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoy
            </Button>

            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setCalendarView('month')}
                className={`p-2 ${calendarView === 'month' ? 'bg-accent text-white' : 'hover:bg-gray-100'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCalendarView('list')}
                className={`p-2 ${calendarView === 'list' ? 'bg-accent text-white' : 'hover:bg-gray-100'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-gray-500">Cargando calendario...</div>
        </div>
      ) : calendarView === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Days header */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
              {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map((day) => (
                <div
                  key={day}
                  className="px-2 py-3 text-center text-xs font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                const dayAppointments = getAppointmentsForDay(day)
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const hasAppointments = dayAppointments.length > 0
                const isBlocked = isDayBlocked(day)

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      min-h-[80px] md:min-h-[100px] p-1 md:p-2 border-b border-r border-gray-200 text-left transition-colors
                      ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : 'hover:bg-gray-50'}
                      ${isSelected ? 'bg-accent/10 ring-2 ring-accent ring-inset' : ''}
                      ${isToday(day) ? 'bg-accent/5' : ''}
                      ${isBlocked ? 'bg-red-50' : ''}
                    `}
                  >
                    <div className="flex items-center gap-1">
                      <span
                        className={`
                          inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full text-xs md:text-sm font-medium
                          ${isToday(day) ? 'bg-accent text-white' : ''}
                        `}
                      >
                        {format(day, 'd')}
                      </span>
                      {isBlocked && (
                        <CalendarOff className="w-3 h-3 text-red-500" />
                      )}
                    </div>

                    {hasAppointments && (
                      <div className="mt-1 space-y-0.5">
                        {dayAppointments.slice(0, 3).map((apt) => {
                          const status = APPOINTMENT_STATUS[apt.status as keyof typeof APPOINTMENT_STATUS]
                          return (
                            <div
                              key={apt.id}
                              className="text-[10px] md:text-xs px-1 py-0.5 rounded truncate"
                              style={{
                                backgroundColor: status?.color?.split(' ')[0] || '#f3f4f6',
                              }}
                            >
                              <span className="hidden md:inline">{apt.start_time.slice(0, 5)} </span>
                              {apt.clients?.full_name?.split(' ')[0] || 'Cliente'}
                            </div>
                          )
                        })}
                        {dayAppointments.length > 3 && (
                          <div className="text-[10px] text-gray-500 px-1">
                            +{dayAppointments.length - 3} mas
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Day details panel */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {selectedDate
                ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es })
                : 'Selecciona un dia'}
            </h3>

            {selectedDate ? (
              <>
                {isDayBlocked(selectedDate) && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <CalendarOff className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-700">Este dia esta bloqueado</span>
                  </div>
                )}
                {selectedDayAppointments.length > 0 ? (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {selectedDayAppointments.map((apt) => {
                      const status = APPOINTMENT_STATUS[apt.status as keyof typeof APPOINTMENT_STATUS]

                      return (
                        <div
                          key={apt.id}
                          className="p-3 rounded-xl border border-gray-200 hover:border-accent/30 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                              <Clock className="w-4 h-4 text-gray-500" />
                              {apt.start_time.slice(0, 5)} - {apt.end_time.slice(0, 5)}
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${status?.color || 'bg-gray-100'}`}>
                              {status?.label || apt.status}
                            </span>
                          </div>

                          <p className="font-medium text-gray-900 mb-1">
                            {apt.services?.name || 'Servicio'}
                          </p>

                          <div className="text-sm text-gray-500 space-y-1">
                            <p className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {apt.clients?.full_name || 'Cliente'}
                            </p>
                            {apt.clients?.phone && (
                              <p className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <a href={`tel:${apt.clients.phone}`} className="hover:text-accent">
                                  {apt.clients.phone}
                                </a>
                              </p>
                            )}
                          </div>

                          <div className="mt-3">
                            <Link
                              href={`/staff/citas/${apt.id}`}
                              className="flex items-center justify-center gap-1 text-xs text-center py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              Ver detalles
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-8">
                    No tienes citas para este dia
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">
                Selecciona un dia para ver tus citas
              </p>
            )}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {appointments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No tienes citas este mes
              </div>
            ) : (
              appointments.map((apt) => {
                const status = APPOINTMENT_STATUS[apt.status as keyof typeof APPOINTMENT_STATUS]

                return (
                  <div
                    key={apt.id}
                    className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="flex-shrink-0 text-center sm:text-left sm:w-24">
                      <p className="text-sm font-medium text-gray-900">
                        {format(parseISO(apt.appointment_date), 'd MMM', { locale: es })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {apt.start_time.slice(0, 5)}
                      </p>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {apt.services?.name || 'Servicio'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {apt.clients?.full_name || 'Cliente'} {apt.clients?.phone && `• ${apt.clients.phone}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${status?.color || 'bg-gray-100'}`}>
                        {status?.label || apt.status}
                      </span>
                      <Link
                        href={`/staff/citas/${apt.id}`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Estados</h4>
        <div className="flex flex-wrap gap-3">
          {Object.entries(APPOINTMENT_STATUS).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${value.color.split(' ')[0]}`} />
              <span className="text-xs text-gray-500">{value.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <CalendarOff className="w-3 h-3 text-red-500" />
            <span className="text-xs text-gray-500">Dia bloqueado</span>
          </div>
        </div>
      </div>
    </div>
  )
}
