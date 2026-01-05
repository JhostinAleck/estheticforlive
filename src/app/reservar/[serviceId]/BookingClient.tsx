'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft, Clock, Check } from 'lucide-react'
import { toast } from 'sonner'
import { BookingCalendar } from '@/components/booking/BookingCalendar'
import { TimeSlots } from '@/components/booking/TimeSlots'
import { BookingForm } from '@/components/booking/BookingForm'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { getAvailableSlots, createBooking } from '@/lib/actions/booking'
import type { Service, Category } from '@/types/database.types'

interface ServiceWithCategory extends Service {
  categories: Category | null
}

interface BookingClientProps {
  service: ServiceWithCategory
  closedDays: number[]
  specialDates: Date[]
}

type BookingStep = 'date' | 'time' | 'form'

export function BookingClient({ service, closedDays, specialDates }: BookingClientProps) {
  const router = useRouter()
  const [step, setStep] = useState<BookingStep>('date')
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [timeSlots, setTimeSlots] = useState<{ time: string; available: boolean }[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTime(undefined)

    if (date) {
      setIsLoadingSlots(true)
      const dateStr = format(date, 'yyyy-MM-dd')
      const { slots } = await getAvailableSlots(service.id, dateStr)
      setTimeSlots(slots)
      setIsLoadingSlots(false)
      setStep('time')
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setStep('form')
  }

  const handleSubmit = async (formData: { fullName: string; phone: string; email?: string; notes?: string }) => {
    if (!selectedDate || !selectedTime) {
      toast.error('Por favor selecciona fecha y hora')
      return
    }

    setIsSubmitting(true)

    const result = await createBooking({
      serviceId: service.id,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      ...formData,
    })

    setIsSubmitting(false)

    if (result.success && result.appointmentId) {
      toast.success('Cita agendada exitosamente')
      router.push(`/confirmacion/${result.appointmentId}`)
    } else {
      toast.error(result.error || 'Error al crear la reserva')
    }
  }

  const steps = [
    { key: 'date', label: 'Fecha', completed: !!selectedDate },
    { key: 'time', label: 'Hora', completed: !!selectedTime },
    { key: 'form', label: 'Datos', completed: false },
  ]

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
          <div className="flex items-center gap-2 mt-8">
            {steps.map((s, index) => (
              <div key={s.key} className="flex items-center">
                <button
                  onClick={() => {
                    if (s.key === 'date') setStep('date')
                    else if (s.key === 'time' && selectedDate) setStep('time')
                    else if (s.key === 'form' && selectedTime) setStep('form')
                  }}
                  disabled={
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
                    ${(s.key === 'time' && !selectedDate) || (s.key === 'form' && !selectedTime) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
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
                {index < steps.length - 1 && (
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
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Calendar (always visible) */}
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

          {/* Summary */}
          {(selectedDate || selectedTime) && (
            <div className="mt-6 bg-white rounded-2xl border border-border p-4">
              <h4 className="font-semibold text-secondary mb-3">Resumen de tu cita</h4>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <i className={`${service.fa_icon} text-accent`} />
                  <span>{service.name}</span>
                </div>
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
