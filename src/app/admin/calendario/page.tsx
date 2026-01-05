'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Download,
  List,
  Grid3X3,
  Clock,
  User,
  Phone,
  Eye,
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
  staff_id: string | null
  services: { name: string; fa_icon: string } | null
  clients: { full_name: string; phone: string } | null
  staff: { name: string; color: string } | null
}

type ViewMode = 'month' | 'week' | 'list'

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const loadAppointments = useCallback(async () => {
    setIsLoading(true)
    const supabase = createClient()

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)

    const { data } = await supabase
      .from('appointments')
      .select('*, services(name, fa_icon), clients(full_name, phone), staff(name, color)')
      .gte('appointment_date', format(monthStart, 'yyyy-MM-dd'))
      .lte('appointment_date', format(monthEnd, 'yyyy-MM-dd'))
      .order('appointment_date')
      .order('start_time')

    setAppointments((data || []) as Appointment[])
    setIsLoading(false)
  }, [currentDate])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

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

  const selectedDayAppointments = selectedDate
    ? getAppointmentsForDay(selectedDate)
    : []

  // Export to iCal
  const exportToIcal = () => {
    let icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Esthetic For Live//Calendario//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ]

    appointments.forEach((apt) => {
      const service = apt.services as { name: string } | null
      const client = apt.clients as { full_name: string; phone: string } | null
      const startDate = apt.appointment_date.replace(/-/g, '')
      const startTime = apt.start_time.replace(/:/g, '').slice(0, 4) + '00'
      const endTime = apt.end_time.replace(/:/g, '').slice(0, 4) + '00'

      icalContent.push(
        'BEGIN:VEVENT',
        `UID:${apt.id}@estheticforlive.com`,
        `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss")}`,
        `DTSTART:${startDate}T${startTime}`,
        `DTEND:${startDate}T${endTime}`,
        `SUMMARY:${service?.name || 'Cita'} - ${client?.full_name || 'Cliente'}`,
        `DESCRIPTION:Cliente: ${client?.full_name || 'N/A'}\\nTeléfono: ${client?.phone || 'N/A'}`,
        'END:VEVENT'
      )
    })

    icalContent.push('END:VCALENDAR')

    const blob = new Blob([icalContent.join('\r\n')], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `citas-${format(currentDate, 'yyyy-MM')}.ics`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Export to Google Calendar URL
  const getGoogleCalendarUrl = (apt: Appointment) => {
    const service = apt.services as { name: string } | null
    const client = apt.clients as { full_name: string; phone: string } | null
    const startDate = apt.appointment_date.replace(/-/g, '')
    const startTime = apt.start_time.replace(/:/g, '').slice(0, 4) + '00'
    const endTime = apt.end_time.replace(/:/g, '').slice(0, 4) + '00'

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${service?.name || 'Cita'} - ${client?.full_name || 'Cliente'}`,
      dates: `${startDate}T${startTime}/${startDate}T${endTime}`,
      details: `Cliente: ${client?.full_name || 'N/A'}\nTeléfono: ${client?.phone || 'N/A'}`,
      location: 'Esthetic For Live, La Plata, Huila',
    })

    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-secondary">Calendario</h1>
            <p className="text-sm md:text-base text-muted">
              Vista de citas del mes
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={exportToIcal}>
              <Download className="w-4 h-4 mr-2" />
              Exportar iCal
            </Button>
            <Link href="/admin/reservas">
              <Button variant="outline" size="sm">
                <List className="w-4 h-4 mr-2" />
                Ver Lista
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl border border-border p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-surface rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-secondary min-w-[180px] text-center capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-surface rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoy
            </Button>
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('month')}
                className={`p-2 ${viewMode === 'month' ? 'bg-accent text-white' : 'hover:bg-surface'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-accent text-white' : 'hover:bg-surface'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-muted">Cargando calendario...</div>
        </div>
      ) : viewMode === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-border overflow-hidden">
            {/* Days header */}
            <div className="grid grid-cols-7 bg-surface border-b border-border">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                <div
                  key={day}
                  className="px-2 py-3 text-center text-xs font-medium text-muted"
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

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      min-h-[80px] md:min-h-[100px] p-1 md:p-2 border-b border-r border-border text-left transition-colors
                      ${!isCurrentMonth ? 'bg-surface/50 text-muted' : 'hover:bg-surface/50'}
                      ${isSelected ? 'bg-accent/10 ring-2 ring-accent ring-inset' : ''}
                      ${isToday(day) ? 'bg-accent/5' : ''}
                    `}
                  >
                    <span
                      className={`
                        inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full text-xs md:text-sm font-medium
                        ${isToday(day) ? 'bg-accent text-white' : ''}
                      `}
                    >
                      {format(day, 'd')}
                    </span>

                    {hasAppointments && (
                      <div className="mt-1 space-y-0.5">
                        {dayAppointments.slice(0, 3).map((apt) => {
                          const staff = apt.staff as { color: string } | null
                          const status = APPOINTMENT_STATUS[apt.status as keyof typeof APPOINTMENT_STATUS]
                          return (
                            <div
                              key={apt.id}
                              className="text-[10px] md:text-xs px-1 py-0.5 rounded truncate"
                              style={{
                                backgroundColor: staff?.color ? `${staff.color}20` : status?.color?.split(' ')[0] || '#f3f4f6',
                                borderLeft: staff?.color ? `2px solid ${staff.color}` : undefined,
                              }}
                            >
                              <span className="hidden md:inline">{apt.start_time.slice(0, 5)} </span>
                              {(apt.clients as { full_name: string } | null)?.full_name?.split(' ')[0] || 'Cliente'}
                            </div>
                          )
                        })}
                        {dayAppointments.length > 3 && (
                          <div className="text-[10px] text-muted px-1">
                            +{dayAppointments.length - 3} más
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
          <div className="bg-white rounded-2xl border border-border p-4 md:p-6">
            <h3 className="font-semibold text-secondary mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {selectedDate
                ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es })
                : 'Selecciona un día'}
            </h3>

            {selectedDate ? (
              selectedDayAppointments.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {selectedDayAppointments.map((apt) => {
                    const service = apt.services as { name: string; fa_icon: string } | null
                    const client = apt.clients as { full_name: string; phone: string } | null
                    const staff = apt.staff as { name: string; color: string } | null
                    const status = APPOINTMENT_STATUS[apt.status as keyof typeof APPOINTMENT_STATUS]

                    return (
                      <div
                        key={apt.id}
                        className="p-3 rounded-xl border border-border hover:border-accent/30 transition-colors"
                        style={{ borderLeftWidth: '3px', borderLeftColor: staff?.color || '#E91E63' }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-secondary">
                            <Clock className="w-4 h-4 text-muted" />
                            {apt.start_time.slice(0, 5)} - {apt.end_time.slice(0, 5)}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${status?.color || 'bg-gray-100'}`}>
                            {status?.label || apt.status}
                          </span>
                        </div>

                        <p className="font-medium text-secondary mb-1">
                          {service?.name || 'Servicio'}
                        </p>

                        <div className="text-sm text-muted space-y-1">
                          <p className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {client?.full_name || 'Cliente'}
                          </p>
                          {client?.phone && (
                            <p className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <a href={`tel:${client.phone}`} className="hover:text-accent">
                                {client.phone}
                              </a>
                            </p>
                          )}
                          {staff && (
                            <p className="flex items-center gap-1">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: staff.color }}
                              />
                              {staff.name}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Link
                            href={`/admin/reservas/${apt.id}`}
                            className="flex-1 text-xs text-center py-1.5 bg-surface hover:bg-border rounded-lg transition-colors"
                          >
                            <Eye className="w-3 h-3 inline mr-1" />
                            Ver detalles
                          </Link>
                          <a
                            href={getGoogleCalendarUrl(apt)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs py-1.5 px-2 bg-surface hover:bg-border rounded-lg transition-colors"
                            title="Agregar a Google Calendar"
                          >
                            <CalendarIcon className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-muted text-sm text-center py-8">
                  No hay citas para este día
                </p>
              )
            ) : (
              <p className="text-muted text-sm text-center py-8">
                Selecciona un día para ver las citas
              </p>
            )}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {appointments.length === 0 ? (
              <div className="p-8 text-center text-muted">
                No hay citas este mes
              </div>
            ) : (
              appointments.map((apt) => {
                const service = apt.services as { name: string; fa_icon: string } | null
                const client = apt.clients as { full_name: string; phone: string } | null
                const staff = apt.staff as { name: string; color: string } | null
                const status = APPOINTMENT_STATUS[apt.status as keyof typeof APPOINTMENT_STATUS]

                return (
                  <div
                    key={apt.id}
                    className="p-4 hover:bg-surface/50 transition-colors flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="flex-shrink-0 text-center sm:text-left sm:w-24">
                      <p className="text-sm font-medium text-secondary">
                        {format(parseISO(apt.appointment_date), 'd MMM', { locale: es })}
                      </p>
                      <p className="text-xs text-muted">
                        {apt.start_time.slice(0, 5)}
                      </p>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-secondary truncate">
                        {service?.name || 'Servicio'}
                      </p>
                      <p className="text-sm text-muted truncate">
                        {client?.full_name || 'Cliente'} • {client?.phone}
                      </p>
                      {staff && (
                        <p className="text-xs text-muted flex items-center gap-1 mt-1">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: staff.color }}
                          />
                          {staff.name}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${status?.color || 'bg-gray-100'}`}>
                        {status?.label || apt.status}
                      </span>
                      <Link
                        href={`/admin/reservas/${apt.id}`}
                        className="p-2 hover:bg-surface rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-muted" />
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
      <div className="bg-white rounded-2xl border border-border p-4">
        <h4 className="text-sm font-medium text-secondary mb-3">Estados</h4>
        <div className="flex flex-wrap gap-3">
          {Object.entries(APPOINTMENT_STATUS).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${value.color.split(' ')[0]}`} />
              <span className="text-xs text-muted">{value.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
