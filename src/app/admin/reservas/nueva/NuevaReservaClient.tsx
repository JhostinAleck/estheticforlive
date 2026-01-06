'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft, Calendar, Clock, User, Search, Plus, Check } from 'lucide-react'
import { toast } from 'sonner'
import { BookingCalendar } from '@/components/booking/BookingCalendar'
import { TimeSlots } from '@/components/booking/TimeSlots'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import {
  getAvailableSlots,
  getStaffClosedDays,
  getStaffSpecialDates,
  getClosedDays,
  getSpecialDates,
} from '@/lib/actions/booking'
import { createAdminBooking } from '@/lib/actions/appointments'

interface Service {
  id: string
  name: string
  fa_icon: string
  duration_minutes: number
  price: number | null
}

interface Staff {
  id: string
  name: string
  color: string
  specialty: string | null
}

interface Client {
  id: string
  full_name: string
  phone: string
  email: string | null
}

interface NuevaReservaClientProps {
  services: Service[]
  staff: Staff[]
  existingClients: Client[]
}

type Step = 'service' | 'staff' | 'datetime' | 'client'

export function NuevaReservaClient({ services, staff, existingClients }: NuevaReservaClientProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('service')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [timeSlots, setTimeSlots] = useState<{ time: string; available: boolean }[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [closedDays, setClosedDays] = useState<number[]>([])
  const [specialDates, setSpecialDates] = useState<Date[]>([])

  // Client form
  const [clientMode, setClientMode] = useState<'existing' | 'new'>('existing')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientSearch, setClientSearch] = useState('')
  const [newClient, setNewClient] = useState({ fullName: '', phone: '', email: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get staff for selected service
  const availableStaff = staff.filter(s => {
    // For now, all staff can do all services
    // You could filter by staff_services here
    return true
  })

  // Filter clients by search
  const filteredClients = existingClients.filter(c =>
    c.full_name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.phone.includes(clientSearch)
  )

  // Load staff availability when staff is selected
  useEffect(() => {
    if (selectedStaff) {
      loadStaffAvailability(selectedStaff.id)
    }
  }, [selectedStaff])

  async function loadStaffAvailability(staffId: string) {
    const [staffClosedDays, staffSpecialDates, globalClosedDays, globalSpecialDates] = await Promise.all([
      getStaffClosedDays(staffId),
      getStaffSpecialDates(staffId),
      getClosedDays(),
      getSpecialDates(),
    ])

    const allClosedDays = Array.from(new Set([...staffClosedDays, ...globalClosedDays]))
    const allSpecialDates = [...staffSpecialDates, ...globalSpecialDates]

    setClosedDays(allClosedDays)
    setSpecialDates(allSpecialDates)
  }

  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTime(undefined)

    if (date && selectedStaff && selectedService) {
      setIsLoadingSlots(true)
      const dateStr = format(date, 'yyyy-MM-dd')
      const { slots } = await getAvailableSlots(selectedService.id, dateStr, selectedStaff.id)
      setTimeSlots(slots)
      setIsLoadingSlots(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedService || !selectedStaff || !selectedDate || !selectedTime) {
      toast.error('Faltan datos de la reserva')
      return
    }

    const clientData = clientMode === 'existing'
      ? { clientId: selectedClient?.id }
      : { fullName: newClient.fullName, phone: newClient.phone, email: newClient.email || undefined }

    if (clientMode === 'existing' && !selectedClient) {
      toast.error('Selecciona un cliente')
      return
    }

    if (clientMode === 'new' && (!newClient.fullName || !newClient.phone)) {
      toast.error('Ingresa nombre y teléfono del cliente')
      return
    }

    setIsSubmitting(true)

    const result = await createAdminBooking({
      serviceId: selectedService.id,
      staffId: selectedStaff.id,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      ...clientData,
    })

    setIsSubmitting(false)

    if (result.success) {
      toast.success('Reserva creada exitosamente')
      router.push('/admin/reservas')
    } else {
      toast.error(result.error || 'Error al crear la reserva')
    }
  }

  const steps = [
    { key: 'service', label: 'Servicio', completed: !!selectedService },
    { key: 'staff', label: 'Especialista', completed: !!selectedStaff },
    { key: 'datetime', label: 'Fecha y hora', completed: !!selectedDate && !!selectedTime },
    { key: 'client', label: 'Cliente', completed: false },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/reservas"
          className="p-2 hover:bg-surface rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary">Nueva Reserva</h1>
          <p className="text-muted">Crear reserva manual</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 flex-wrap">
        {steps.map((s, index) => (
          <div key={s.key} className="flex items-center">
            <button
              onClick={() => {
                if (s.key === 'service') setCurrentStep('service')
                else if (s.key === 'staff' && selectedService) setCurrentStep('staff')
                else if (s.key === 'datetime' && selectedStaff) setCurrentStep('datetime')
                else if (s.key === 'client' && selectedTime) setCurrentStep('client')
              }}
              disabled={
                (s.key === 'staff' && !selectedService) ||
                (s.key === 'datetime' && !selectedStaff) ||
                (s.key === 'client' && !selectedTime)
              }
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                ${currentStep === s.key
                  ? 'bg-accent text-white'
                  : s.completed
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-white text-muted border border-border'
                }
                ${(s.key === 'staff' && !selectedService) || (s.key === 'datetime' && !selectedStaff) || (s.key === 'client' && !selectedTime)
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
                }
              `}
            >
              {s.completed && currentStep !== s.key ? (
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

      {/* Step Content */}
      <div className="bg-white rounded-2xl border border-border p-6">
        {/* Step 1: Service Selection */}
        {currentStep === 'service' && (
          <div>
            <h2 className="text-lg font-semibold text-secondary mb-4">Selecciona un servicio</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service)
                    setCurrentStep('staff')
                  }}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left
                    ${selectedService?.id === service.id
                      ? 'border-accent bg-accent-light'
                      : 'border-border hover:border-accent/50'
                    }
                  `}
                >
                  <div className="bg-accent-light w-12 h-12 rounded-xl flex items-center justify-center text-accent">
                    <i className={`${service.fa_icon} text-lg`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-secondary truncate">{service.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Clock className="w-3 h-3" />
                      {service.duration_minutes} min
                      {service.price && (
                        <span className="text-accent font-medium">
                          {formatPrice(service.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Staff Selection */}
        {currentStep === 'staff' && (
          <div>
            <h2 className="text-lg font-semibold text-secondary mb-4">Selecciona un especialista</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableStaff.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedStaff(s)
                    setSelectedDate(undefined)
                    setSelectedTime(undefined)
                    setCurrentStep('datetime')
                  }}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left
                    ${selectedStaff?.id === s.id
                      ? 'border-accent bg-accent-light'
                      : 'border-border hover:border-accent/50'
                    }
                  `}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: s.color }}
                  >
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-secondary">{s.name}</p>
                    {s.specialty && (
                      <p className="text-sm text-muted">{s.specialty}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Date & Time Selection */}
        {currentStep === 'datetime' && (
          <div>
            <h2 className="text-lg font-semibold text-secondary mb-4">Selecciona fecha y hora</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <BookingCalendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                closedDays={closedDays}
                disabledDays={specialDates}
              />
              <div>
                {selectedDate ? (
                  <TimeSlots
                    slots={timeSlots}
                    selectedTime={selectedTime}
                    onTimeSelect={(time) => {
                      setSelectedTime(time)
                      setCurrentStep('client')
                    }}
                    isLoading={isLoadingSlots}
                  />
                ) : (
                  <div className="bg-surface rounded-2xl p-6 text-center">
                    <Calendar className="w-12 h-12 text-muted mx-auto mb-3" />
                    <p className="text-muted">Selecciona una fecha para ver horarios disponibles</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Client Selection */}
        {currentStep === 'client' && (
          <div>
            <h2 className="text-lg font-semibold text-secondary mb-4">Información del cliente</h2>

            {/* Toggle between existing and new client */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setClientMode('existing')}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${clientMode === 'existing' ? 'bg-accent text-white' : 'bg-surface text-secondary hover:bg-border'}
                `}
              >
                Cliente existente
              </button>
              <button
                onClick={() => setClientMode('new')}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${clientMode === 'new' ? 'bg-accent text-white' : 'bg-surface text-secondary hover:bg-border'}
                `}
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Nuevo cliente
              </button>
            </div>

            {clientMode === 'existing' ? (
              <div>
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o teléfono..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                  />
                </div>

                {/* Client List */}
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredClients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => setSelectedClient(client)}
                      className={`
                        w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left
                        ${selectedClient?.id === client.id
                          ? 'border-accent bg-accent-light'
                          : 'border-border hover:border-accent/50'
                        }
                      `}
                    >
                      <div className="bg-surface w-10 h-10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-muted" />
                      </div>
                      <div>
                        <p className="font-medium text-secondary">{client.full_name}</p>
                        <p className="text-sm text-muted">{client.phone}</p>
                      </div>
                    </button>
                  ))}
                  {filteredClients.length === 0 && (
                    <p className="text-center text-muted py-4">No se encontraron clientes</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={newClient.fullName}
                    onChange={(e) => setNewClient({ ...newClient, fullName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                    placeholder="Nombre del cliente"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                    placeholder="Ej: 3001234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                    placeholder="cliente@email.com"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary & Actions */}
      {(selectedService || selectedStaff || selectedDate) && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="font-semibold text-secondary mb-4">Resumen de la reserva</h3>
          <div className="flex flex-wrap gap-4 text-sm mb-6">
            {selectedService && (
              <div className="flex items-center gap-2">
                <i className={`${selectedService.fa_icon} text-accent`} />
                <span>{selectedService.name}</span>
              </div>
            )}
            {selectedStaff && (
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: selectedStaff.color }}
                />
                <span>Con: {selectedStaff.name}</span>
              </div>
            )}
            {selectedDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted" />
                <span>{format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}</span>
              </div>
            )}
            {selectedTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted" />
                <span>{selectedTime}</span>
              </div>
            )}
            {(clientMode === 'existing' && selectedClient) && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted" />
                <span>{selectedClient.full_name}</span>
              </div>
            )}
            {(clientMode === 'new' && newClient.fullName) && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted" />
                <span>{newClient.fullName} (Nuevo)</span>
              </div>
            )}
          </div>

          {currentStep === 'client' && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (clientMode === 'existing' ? !selectedClient : !newClient.fullName || !newClient.phone)}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? 'Creando...' : 'Crear Reserva'}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
