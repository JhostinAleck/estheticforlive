'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft, Clock, Check, User, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { BookingCalendar } from '@/components/booking/BookingCalendar'
import { TimeSlots } from '@/components/booking/TimeSlots'
import { BookingForm } from '@/components/booking/BookingForm'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import {
  getAvailableSlots,
  createBooking,
  getStaffForServiceBooking,
  getStaffClosedDays,
  getStaffSpecialDates,
  getClosedDays,
  getSpecialDates,
} from '@/lib/actions/booking'
import type { Service, Category } from '@/types/database.types'

interface ServiceWithCategory extends Service {
  categories: Category | null
}

interface StaffMember {
  id: string
  name: string
  color: string
  specialty: string | null
  avatar_url: string | null
}

interface BookingClientProps {
  service: ServiceWithCategory
  closedDays: number[]
  specialDates: Date[]
}

type BookingStep = 'loading' | 'staff' | 'date' | 'time' | 'form' | 'no-staff'

export function BookingClient({ service, closedDays: initialClosedDays, specialDates: initialSpecialDates }: BookingClientProps) {
  const router = useRouter()
  const [step, setStep] = useState<BookingStep>('loading')
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [timeSlots, setTimeSlots] = useState<{ time: string; available: boolean }[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [closedDays, setClosedDays] = useState<number[]>(initialClosedDays)
  const [specialDates, setSpecialDates] = useState<Date[]>(initialSpecialDates)

  // Load staff for this service
  useEffect(() => {
    async function loadStaff() {
      try {
        const staff = await getStaffForServiceBooking(service.id)
        setStaffList(staff as StaffMember[])

        if (staff.length === 0) {
          // No staff assigned to this service
          setStep('no-staff')
        } else if (staff.length === 1) {
          // Auto-select single staff member
          const singleStaff = staff[0] as StaffMember
          setSelectedStaff(singleStaff)
          await loadStaffAvailability(singleStaff.id)
          setStep('date')
        } else {
          // Multiple staff - show selection
          setStep('staff')
        }
      } catch (error) {
        console.error('Error loading staff:', error)
        setStep('no-staff')
      }
    }
    loadStaff()
  }, [service.id])

  // Load staff-specific availability
  async function loadStaffAvailability(staffId: string) {
    try {
      const [staffClosedDays, staffSpecialDates, globalClosedDays, globalSpecialDates] = await Promise.all([
        getStaffClosedDays(staffId),
        getStaffSpecialDates(staffId),
        getClosedDays(),
        getSpecialDates(),
      ])

      // Combine staff and global closed days
      const allClosedDays = Array.from(new Set([...staffClosedDays, ...globalClosedDays]))
      const allSpecialDates = [...staffSpecialDates, ...globalSpecialDates]

      setClosedDays(allClosedDays)
      setSpecialDates(allSpecialDates)
    } catch (error) {
      console.error('Error loading availability:', error)
      // Use initial values on error
    }
  }

  const handleStaffSelect = async (staff: StaffMember) => {
    setSelectedStaff(staff)
    setSelectedDate(undefined)
    setSelectedTime(undefined)
    await loadStaffAvailability(staff.id)
    setStep('date')
  }

  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTime(undefined)

    if (date && selectedStaff) {
      setIsLoadingSlots(true)
      try {
        const dateStr = format(date, 'yyyy-MM-dd')
        const { slots } = await getAvailableSlots(service.id, dateStr, selectedStaff.id)
        setTimeSlots(slots)
        setStep('time')
      } catch (error) {
        console.error('Error loading slots:', error)
        toast.error('Error al cargar horarios disponibles')
      } finally {
        setIsLoadingSlots(false)
      }
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setStep('form')
  }

  const handleSubmit = async (formData: { fullName: string; phone: string; email?: string; notes?: string }) => {
    if (!selectedDate || !selectedTime || !selectedStaff) {
      toast.error('Por favor completa todos los pasos')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createBooking({
        serviceId: service.id,
        staffId: selectedStaff.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        ...formData,
      })

      if (result.success && result.appointmentId) {
        toast.success('Cita agendada exitosamente')
        router.push(`/confirmacion/${result.appointmentId}`)
      } else {
        toast.error(result.error || 'Error al crear la reserva')
      }
    } catch (error) {
      toast.error('Error inesperado al crear la reserva')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Steps configuration
  const allSteps = [
    { key: 'staff', label: 'Especialista', completed: !!selectedStaff },
    { key: 'date', label: 'Fecha', completed: !!selectedDate },
    { key: 'time', label: 'Hora', completed: !!selectedTime },
    { key: 'form', label: 'Datos', completed: false },
  ]

  // If only one staff member, skip the staff step in the UI
  const visibleSteps = staffList.length <= 1
    ? allSteps.filter(s => s.key !== 'staff')
    : allSteps

  // Loading state
  if (step === 'loading') {
    return (
      <main className="pt-20 min-h-screen bg-surface">
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
          <p className="text-muted">Cargando disponibilidad...</p>
        </div>
      </main>
    )
  }

  // No staff available
  if (step === 'no-staff') {
    return (
      <main className="pt-20 min-h-screen bg-surface">
        <section className="bg-gradient-to-b from-accent-light to-surface py-8">
          <div className="container mx-auto px-4 md:px-6">
            <Link
              href="/reservar"
              className="inline-flex items-center text-sm text-muted hover:text-accent transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Cambiar servicio
            </Link>
            <div className="flex items-start gap-4">
              <div className="bg-accent text-white w-14 h-14 rounded-2xl flex items-center justify-center shrink-0">
                <i className={`${service.fa_icon} text-xl`} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-secondary">
                  {service.name}
                </h1>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12">
          <div className="container mx-auto px-4 md:px-6 max-w-lg">
            <div className="bg-white rounded-2xl border border-border p-8 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-secondary mb-2">
                Servicio no disponible
              </h2>
              <p className="text-muted mb-6">
                Este servicio no tiene especialistas asignados en este momento.
                Por favor contáctanos directamente para agendar tu cita.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://wa.me/573001234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                >
                  <i className="fa-brands fa-whatsapp text-lg" />
                  Contactar por WhatsApp
                </a>
                <Link
                  href="/reservar"
                  className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-xl font-medium hover:bg-surface transition-colors"
                >
                  Ver otros servicios
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="pt-20 min-h-screen bg-surface">
      {/* Header */}
      <section className="bg-gradient-to-b from-accent-light to-surface py-8">
        <div className="container mx-auto px-4 md:px-6">
          <Link
            href="/reservar"
            className="inline-flex items-center text-sm text-muted hover:text-accent transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Cambiar servicio
          </Link>

          <div className="flex items-start gap-4">
            <div className="bg-accent text-white w-14 h-14 rounded-2xl flex items-center justify-center shrink-0">
              <i className={`${service.fa_icon} text-xl`} />
            </div>
            <div>
              <span className="text-accent font-medium text-sm uppercase tracking-wider">
                Reservar
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-secondary">
                {service.name}
              </h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted">
                {service.duration_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {service.duration_minutes} min
                  </span>
                )}
                {service.price && (
                  <span className="font-medium text-accent">
                    {formatPrice(service.price)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-8 flex-wrap">
            {visibleSteps.map((s, index) => (
              <div key={s.key} className="flex items-center">
                <button
                  onClick={() => {
                    if (s.key === 'staff') setStep('staff')
                    else if (s.key === 'date' && selectedStaff) setStep('date')
                    else if (s.key === 'time' && selectedDate) setStep('time')
                    else if (s.key === 'form' && selectedTime) setStep('form')
                  }}
                  disabled={
                    (s.key === 'date' && !selectedStaff) ||
                    (s.key === 'time' && !selectedDate) ||
                    (s.key === 'form' && !selectedTime)
                  }
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                    ${step === s.key
                      ? 'bg-accent text-white'
                      : s.completed
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-white text-muted border border-border'
                    }
                    ${(s.key === 'date' && !selectedStaff) || (s.key === 'time' && !selectedDate) || (s.key === 'form' && !selectedTime) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {s.completed && step !== s.key ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                  )}
                  {s.label}
                </button>
                {index < visibleSteps.length - 1 && (
                  <div className="w-8 h-px bg-border mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {/* Staff Selection */}
          {step === 'staff' && staffList.length > 1 && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-secondary mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-accent" />
                Selecciona un especialista
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {staffList.map((staff) => (
                  <button
                    key={staff.id}
                    onClick={() => handleStaffSelect(staff)}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left
                      ${selectedStaff?.id === staff.id
                        ? 'border-accent bg-accent-light'
                        : 'border-border hover:border-accent/50 hover:bg-surface'
                      }
                    `}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                      style={{ backgroundColor: staff.color }}
                    >
                      {staff.avatar_url ? (
                        <img
                          src={staff.avatar_url}
                          alt={staff.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        staff.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-secondary">{staff.name}</p>
                      {staff.specialty && (
                        <p className="text-sm text-muted">{staff.specialty}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date and Time Selection */}
          {(step === 'date' || step === 'time' || step === 'form') && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Calendar */}
              <div>
                <BookingCalendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  closedDays={closedDays}
                  disabledDays={specialDates}
                />
              </div>

              {/* Right Column - Time Slots or Form */}
              <div>
                {step === 'date' && (
                  <div className="bg-white rounded-2xl border border-border p-6 text-center">
                    <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="font-semibold text-secondary mb-2">
                      Selecciona una fecha
                    </h3>
                    <p className="text-sm text-muted">
                      Elige el día en que deseas agendar tu cita para ver los horarios disponibles.
                    </p>
                  </div>
                )}

                {step === 'time' && (
                  <TimeSlots
                    slots={timeSlots}
                    selectedTime={selectedTime}
                    onTimeSelect={handleTimeSelect}
                    isLoading={isLoadingSlots}
                  />
                )}

                {step === 'form' && (
                  <BookingForm
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                  />
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          {(selectedStaff || selectedDate || selectedTime) && (
            <div className="mt-6 bg-white rounded-2xl border border-border p-4">
              <h4 className="font-semibold text-secondary mb-3">Resumen de tu cita</h4>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <i className={`${service.fa_icon} text-accent`} />
                  <span>{service.name}</span>
                </div>
                {selectedStaff && (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: selectedStaff.color }}
                    />
                    <span>Con: <span className="font-medium">{selectedStaff.name}</span></span>
                  </div>
                )}
                {selectedDate && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted">Fecha:</span>
                    <span className="font-medium">
                      {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                    </span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted">Hora:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
