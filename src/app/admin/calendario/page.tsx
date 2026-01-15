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
  Settings,
  CalendarOff,
  Plus,
  Trash2,
  AlertCircle,
  Users,
  Filter,
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
import { APPOINTMENT_STATUS } from '@/lib/constants'
import { getCalendarAppointments, getCalendarStaff } from '@/lib/actions/calendar'
import {
  getBusinessHours,
  updateBusinessHours,
  getSpecialDates,
  createSpecialDate,
  deleteSpecialDate,
  getTimeBlocks,
  createTimeBlock,
  deleteTimeBlock,
} from '@/lib/actions/schedule'

interface Staff {
  id: string
  name: string
  color: string
}

interface Appointment {
  id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: string
  staff_id: string | null
  services: { name: string; fa_icon: string } | null
  clients: { full_name: string; phone: string } | null
  staff: { id: string; name: string; color: string } | null
}

interface BusinessHour {
  id: string
  day_of_week: string
  open_time: string
  close_time: string
  is_closed: boolean
}

interface SpecialDate {
  id: string
  date: string
  description: string | null
  is_closed: boolean
  open_time: string | null
  close_time: string | null
}

interface TimeBlock {
  id: string
  start_datetime: string
  end_datetime: string
  reason: string | null
}

type ViewMode = 'calendar' | 'settings'
type SettingsTab = 'hours' | 'special' | 'blocks'

const dayNames: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
}

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [calendarView, setCalendarView] = useState<'month' | 'list'>('month')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Staff filter states
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [showStaffFilter, setShowStaffFilter] = useState(false)

  // Settings states
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('hours')
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([])
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([])
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [saving, setSaving] = useState(false)

  // Form states
  const [newSpecialDate, setNewSpecialDate] = useState({
    date: '',
    description: '',
    is_closed: true,
    open_time: '08:00',
    close_time: '18:00',
  })

  const [newTimeBlock, setNewTimeBlock] = useState({
    date: '',
    start_time: '08:00',
    end_time: '12:00',
    reason: '',
  })

  const loadStaffList = useCallback(async () => {
    const data = await getCalendarStaff()
    setStaffList(data)
  }, [])

  const loadAppointments = useCallback(async () => {
    setIsLoading(true)
    const data = await getCalendarAppointments(currentDate)
    setAppointments(data)
    setIsLoading(false)
  }, [currentDate])

  const loadScheduleSettings = useCallback(async () => {
    const [hours, dates, blocks] = await Promise.all([
      getBusinessHours(),
      getSpecialDates(),
      getTimeBlocks(),
    ])
    setBusinessHours(hours as BusinessHour[])
    setSpecialDates(dates as SpecialDate[])
    setTimeBlocks(blocks as TimeBlock[])
  }, [])

  useEffect(() => {
    loadAppointments()
    loadScheduleSettings()
    loadStaffList()
  }, [loadAppointments, loadScheduleSettings, loadStaffList])

  // Close staff filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (showStaffFilter && !target.closest('[data-staff-filter]')) {
        setShowStaffFilter(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showStaffFilter])

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

  // Filtered appointments based on selected staff
  const filteredAppointments = selectedStaffId
    ? appointments.filter(apt => apt.staff?.id === selectedStaffId)
    : appointments

  const getAppointmentsForDay = (day: Date) => {
    return filteredAppointments.filter((apt) =>
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

  // Schedule settings handlers
  async function handleUpdateBusinessHour(day: string, field: string, value: string | boolean) {
    const hour = businessHours.find(h => h.day_of_week === day)
    if (!hour) return

    const updated = { ...hour, [field]: value }
    setBusinessHours(prev => prev.map(h => h.day_of_week === day ? updated : h))

    setSaving(true)
    await updateBusinessHours(day, {
      open_time: updated.open_time,
      close_time: updated.close_time,
      is_closed: updated.is_closed,
    })
    setSaving(false)
  }

  async function handleAddSpecialDate() {
    if (!newSpecialDate.date) return

    setSaving(true)
    const result = await createSpecialDate(newSpecialDate)
    if (result.success) {
      setNewSpecialDate({
        date: '',
        description: '',
        is_closed: true,
        open_time: '08:00',
        close_time: '18:00',
      })
      await loadScheduleSettings()
    }
    setSaving(false)
  }

  async function handleDeleteSpecialDate(id: string) {
    if (!confirm('¿Eliminar esta fecha especial?')) return

    setSaving(true)
    await deleteSpecialDate(id)
    await loadScheduleSettings()
    setSaving(false)
  }

  async function handleAddTimeBlock() {
    if (!newTimeBlock.date || !newTimeBlock.start_time || !newTimeBlock.end_time) return

    const start_datetime = `${newTimeBlock.date}T${newTimeBlock.start_time}:00`
    const end_datetime = `${newTimeBlock.date}T${newTimeBlock.end_time}:00`

    setSaving(true)
    const result = await createTimeBlock({
      start_datetime,
      end_datetime,
      reason: newTimeBlock.reason || undefined,
    })
    if (result.success) {
      setNewTimeBlock({
        date: '',
        start_time: '08:00',
        end_time: '12:00',
        reason: '',
      })
      await loadScheduleSettings()
    }
    setSaving(false)
  }

  async function handleDeleteTimeBlock(id: string) {
    if (!confirm('¿Eliminar este bloqueo de horario?')) return

    setSaving(true)
    await deleteTimeBlock(id)
    await loadScheduleSettings()
    setSaving(false)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Calendario</h1>
            <p className="text-sm md:text-base text-gray-500">
              {viewMode === 'calendar' ? 'Vista de citas del mes' : 'Configuración de horarios'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {viewMode === 'calendar' && (
              <Button variant="outline" size="sm" onClick={exportToIcal}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            )}
            <Button
              variant={viewMode === 'settings' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode(viewMode === 'calendar' ? 'settings' : 'calendar')}
            >
              {viewMode === 'calendar' ? (
                <>
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar Horarios
                </>
              ) : (
                <>
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Ver Calendario
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Calendar Navigation - only show in calendar mode */}
        {viewMode === 'calendar' && (
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

              {/* Staff Filter */}
              <div className="relative" data-staff-filter>
                <button
                  onClick={() => setShowStaffFilter(!showStaffFilter)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                    selectedStaffId
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  {selectedStaffId
                    ? staffList.find(s => s.id === selectedStaffId)?.name || 'Colaborador'
                    : 'Todos'}
                  <Filter className="w-3 h-3" />
                </button>

                {showStaffFilter && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setSelectedStaffId(null)
                          setShowStaffFilter(false)
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                          !selectedStaffId ? 'bg-accent/10 text-accent' : 'hover:bg-gray-100'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        Todos los colaboradores
                      </button>
                      {staffList.map((staff) => (
                        <button
                          key={staff.id}
                          onClick={() => {
                            setSelectedStaffId(staff.id)
                            setShowStaffFilter(false)
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                            selectedStaffId === staff.id ? 'bg-accent/10 text-accent' : 'hover:bg-gray-100'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: staff.color }}
                          />
                          {staff.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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
        )}
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <>
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
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
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
                              <div className="text-[10px] text-gray-500 px-1">
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
              <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {selectedDate
                    ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es })
                    : 'Selecciona un día'}
                </h3>

                {selectedDate ? (
                  <>
                    {isDayBlocked(selectedDate) && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                        <CalendarOff className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-700">Este día está cerrado</span>
                      </div>
                    )}
                    {selectedDayAppointments.length > 0 ? (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {selectedDayAppointments.map((apt) => {
                          const service = apt.services as { name: string; fa_icon: string } | null
                          const client = apt.clients as { full_name: string; phone: string } | null
                          const staff = apt.staff as { name: string; color: string } | null
                          const status = APPOINTMENT_STATUS[apt.status as keyof typeof APPOINTMENT_STATUS]

                          return (
                            <div
                              key={apt.id}
                              className="p-3 rounded-xl border border-gray-200 hover:border-accent/30 transition-colors"
                              style={{ borderLeftWidth: '3px', borderLeftColor: staff?.color || '#E91E63' }}
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
                                {service?.name || 'Servicio'}
                              </p>

                              <div className="text-sm text-gray-500 space-y-1">
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
                                  className="flex-1 text-xs text-center py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                  <Eye className="w-3 h-3 inline mr-1" />
                                  Ver detalles
                                </Link>
                                <a
                                  href={getGoogleCalendarUrl(apt)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs py-1.5 px-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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
                      <p className="text-gray-500 text-sm text-center py-8">
                        No hay citas para este día
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-8">
                    Selecciona un día para ver las citas
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* List View */
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {filteredAppointments.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {selectedStaffId ? 'No hay citas para este colaborador' : 'No hay citas este mes'}
                  </div>
                ) : (
                  filteredAppointments.map((apt) => {
                    const service = apt.services as { name: string; fa_icon: string } | null
                    const client = apt.clients as { full_name: string; phone: string } | null
                    const staff = apt.staff as { name: string; color: string } | null
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
                            {service?.name || 'Servicio'}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {client?.full_name || 'Cliente'} • {client?.phone}
                          </p>
                          {staff && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
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
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Status Legend */}
              <div>
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
                    <span className="text-xs text-gray-500">Día cerrado</span>
                  </div>
                </div>
              </div>

              {/* Staff Legend */}
              {staffList.length > 0 && (
                <div className="md:border-l md:border-gray-200 md:pl-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Colaboradores</h4>
                  <div className="flex flex-wrap gap-3">
                    {staffList.map((staff) => (
                      <button
                        key={staff.id}
                        onClick={() => setSelectedStaffId(selectedStaffId === staff.id ? null : staff.id)}
                        className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors ${
                          selectedStaffId === staff.id
                            ? 'bg-accent/10 ring-1 ring-accent'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: staff.color }}
                        />
                        <span className="text-xs text-gray-600">{staff.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Settings View */}
      {viewMode === 'settings' && (
        <div className="space-y-6">
          {/* Settings Tabs */}
          <div className="flex gap-1 border-b border-gray-200 bg-white rounded-t-2xl px-4">
            <button
              onClick={() => setSettingsTab('hours')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                settingsTab === 'hours'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Clock className="w-4 h-4 inline-block mr-2" />
              Horario Semanal
            </button>
            <button
              onClick={() => setSettingsTab('special')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                settingsTab === 'special'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <CalendarIcon className="w-4 h-4 inline-block mr-2" />
              Fechas Especiales
            </button>
            <button
              onClick={() => setSettingsTab('blocks')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                settingsTab === 'blocks'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <CalendarOff className="w-4 h-4 inline-block mr-2" />
              Bloqueos
            </button>
          </div>

          {/* Business Hours Tab */}
          {settingsTab === 'hours' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-900">Horario de Atención Semanal</h2>
                {saving && <span className="text-sm text-gray-500">Guardando...</span>}
              </div>

              <div className="space-y-4">
                {businessHours.map((hour) => (
                  <div
                    key={hour.day_of_week}
                    className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="w-28 font-medium text-gray-900">
                      {dayNames[hour.day_of_week]}
                    </div>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!hour.is_closed}
                        onChange={(e) => handleUpdateBusinessHour(hour.day_of_week, 'is_closed', !e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                      />
                      <span className="text-sm text-gray-700">Abierto</span>
                    </label>

                    {!hour.is_closed && (
                      <>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-500">Desde:</label>
                          <input
                            type="time"
                            value={hour.open_time}
                            onChange={(e) => handleUpdateBusinessHour(hour.day_of_week, 'open_time', e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-500">Hasta:</label>
                          <input
                            type="time"
                            value={hour.close_time}
                            onChange={(e) => handleUpdateBusinessHour(hour.day_of_week, 'close_time', e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                          />
                        </div>
                      </>
                    )}

                    {hour.is_closed && (
                      <span className="text-sm text-red-600 font-medium">Cerrado</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Dates Tab */}
          {settingsTab === 'special' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Agregar Fecha Especial</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Marca festivos, vacaciones o días con horario especial
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input
                      type="date"
                      value={newSpecialDate.date}
                      onChange={(e) => setNewSpecialDate(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <input
                      type="text"
                      value={newSpecialDate.description}
                      onChange={(e) => setNewSpecialDate(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Ej: Día festivo"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select
                      value={newSpecialDate.is_closed ? 'closed' : 'special'}
                      onChange={(e) => setNewSpecialDate(prev => ({ ...prev, is_closed: e.target.value === 'closed' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                    >
                      <option value="closed">Cerrado todo el día</option>
                      <option value="special">Horario especial</option>
                    </select>
                  </div>

                  {!newSpecialDate.is_closed && (
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                        <input
                          type="time"
                          value={newSpecialDate.open_time}
                          onChange={(e) => setNewSpecialDate(prev => ({ ...prev, open_time: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                        <input
                          type="time"
                          value={newSpecialDate.close_time}
                          onChange={(e) => setNewSpecialDate(prev => ({ ...prev, close_time: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAddSpecialDate}
                  disabled={!newSpecialDate.date || saving}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Fecha
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Fechas Especiales Registradas</h2>

                {specialDates.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay fechas especiales registradas</p>
                ) : (
                  <div className="space-y-3">
                    {specialDates.map((date) => (
                      <div
                        key={date.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${date.is_closed ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                            {date.is_closed ? <CalendarOff className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {format(parseISO(date.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                            </p>
                            <p className="text-sm text-gray-500">
                              {date.description || (date.is_closed ? 'Cerrado' : `${date.open_time} - ${date.close_time}`)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteSpecialDate(date.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Time Blocks Tab */}
          {settingsTab === 'blocks' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800">
                    Los bloqueos de horario te permiten reservar horas específicas para reuniones,
                    descansos o cualquier actividad que no sea atención a clientes.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Agregar Bloqueo de Horario</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input
                      type="date"
                      value={newTimeBlock.date}
                      onChange={(e) => setNewTimeBlock(prev => ({ ...prev, date: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora inicio</label>
                    <input
                      type="time"
                      value={newTimeBlock.start_time}
                      onChange={(e) => setNewTimeBlock(prev => ({ ...prev, start_time: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin</label>
                    <input
                      type="time"
                      value={newTimeBlock.end_time}
                      onChange={(e) => setNewTimeBlock(prev => ({ ...prev, end_time: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Motivo (opcional)</label>
                    <input
                      type="text"
                      value={newTimeBlock.reason}
                      onChange={(e) => setNewTimeBlock(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Ej: Reunión, Almuerzo, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddTimeBlock}
                  disabled={!newTimeBlock.date || !newTimeBlock.start_time || !newTimeBlock.end_time || saving}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Bloqueo
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Bloqueos Activos</h2>

                {timeBlocks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay bloqueos de horario activos</p>
                ) : (
                  <div className="space-y-3">
                    {timeBlocks.map((block) => {
                      const startDate = parseISO(block.start_datetime)
                      const endDate = parseISO(block.end_datetime)
                      return (
                        <div
                          key={block.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                              <Clock className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {format(startDate, "EEEE d 'de' MMMM", { locale: es })}
                              </p>
                              <p className="text-sm text-gray-500">
                                {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
                                {block.reason && ` • ${block.reason}`}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteTimeBlock(block.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
