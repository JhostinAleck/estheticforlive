import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCircle, Calendar, Clock, MapPin, MessageCircle, Phone, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SOCIAL_MEDIA } from '@/lib/constants'
import { generateWhatsAppLink, formatPrice } from '@/lib/utils'
import type { SiteSettings as FullSiteSettings } from '@/types/database.types'

export const metadata: Metadata = {
  title: 'Cita Confirmada | Esthetic For Live',
  description: 'Tu cita ha sido agendada exitosamente',
}

interface Props {
  params: Promise<{ appointmentId: string }>
}

interface AppointmentData {
  id: string
  appointment_date: string
  start_time: string
  end_time: string
  price: number | null
  services: { id: string; name: string; fa_icon: string; duration_minutes: number } | null
  clients: { id: string; full_name: string; phone: string; email: string | null } | null
}

interface SiteSettings {
  whatsapp_number: string | null
  address: string | null
  city: string | null
}

async function getAppointmentData(appointmentId: string) {
  const supabase = createAdminClient()

  const { data: appointment, error } = await supabase
    .from('appointments')
    .select(`
      *,
      services(id, name, fa_icon, duration_minutes),
      clients(id, full_name, phone, email)
    `)
    .eq('id', appointmentId)
    .single()

  if (error || !appointment) {
    return null
  }

  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .single()

  return {
    appointment: appointment as AppointmentData,
    settings: settings as SiteSettings | null,
    fullSettings: settings as FullSiteSettings | null,
  }
}

export default async function ConfirmacionPage({ params }: Props) {
  const { appointmentId } = await params
  const data = await getAppointmentData(appointmentId)

  if (!data) {
    notFound()
  }

  const { appointment, settings, fullSettings } = data
  const service = appointment.services
  const client = appointment.clients

  const appointmentDate = parseISO(appointment.appointment_date)
  const formattedDate = format(appointmentDate, "EEEE d 'de' MMMM, yyyy", { locale: es })

  const whatsappMessage = `Hola, acabo de agendar una cita para *${service?.name}* el día *${formattedDate}* a las *${appointment.start_time.slice(0, 5)}*. Mi nombre es ${client?.full_name}. Confirmo mi asistencia.`
  const whatsappLink = generateWhatsAppLink(
    settings?.whatsapp_number || SOCIAL_MEDIA.whatsapp.phone,
    whatsappMessage
  )

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-surface">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-xl mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-8 text-center text-white">
              <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Cita Agendada</h1>
              <p className="text-white/80">Te contactaremos para confirmar tu cita</p>
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              {/* Service */}
              <div className="flex items-center gap-4 p-4 bg-accent-light rounded-xl">
                <div className="bg-accent text-white w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                  <i className={`${service?.fa_icon || 'fa-solid fa-spa'} text-lg`} />
                </div>
                <div>
                  <p className="text-sm text-muted">Servicio</p>
                  <p className="font-semibold text-secondary">{service?.name}</p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-surface rounded-xl">
                  <div className="flex items-center gap-2 text-accent mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Fecha</span>
                  </div>
                  <p className="font-semibold text-secondary capitalize">
                    {format(appointmentDate, "EEE d MMM", { locale: es })}
                  </p>
                </div>
                <div className="p-4 bg-surface rounded-xl">
                  <div className="flex items-center gap-2 text-accent mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Hora</span>
                  </div>
                  <p className="font-semibold text-secondary">
                    {appointment.start_time.slice(0, 5)}
                  </p>
                </div>
              </div>

              {/* Price */}
              {appointment.price && (
                <div className="p-4 bg-surface rounded-xl">
                  <p className="text-sm text-muted mb-1">Precio estimado</p>
                  <p className="text-2xl font-bold text-accent">
                    {formatPrice(appointment.price)}
                  </p>
                </div>
              )}

              {/* Location */}
              <div className="p-4 bg-surface rounded-xl">
                <div className="flex items-center gap-2 text-accent mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Ubicación</span>
                </div>
                <p className="text-secondary">{settings?.address || 'Calle 4 No 5-40 García Rovira'}</p>
                <p className="text-sm text-muted">{settings?.city || 'La Plata, Huila'}</p>
              </div>

              {/* Client Info */}
              <div className="p-4 bg-surface rounded-xl">
                <p className="text-sm text-muted mb-2">Datos de contacto</p>
                <p className="font-semibold text-secondary">{client?.full_name}</p>
                <p className="text-sm text-muted flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {client?.phone}
                </p>
              </div>

              {/* Status Badge */}
              <div className="text-center p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-amber-700 font-medium">
                  Estado: Pendiente de confirmación
                </p>
                <p className="text-sm text-amber-600">
                  Te contactaremos pronto para confirmar
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 space-y-3">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full" size="lg">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Confirmar por WhatsApp
                </Button>
              </a>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Volver al inicio
                </Button>
              </Link>
            </div>
          </div>

          {/* Note */}
          <p className="text-center text-sm text-muted mt-6">
            Guarda esta página o envía la confirmación por WhatsApp para tener los detalles de tu cita.
          </p>
        </div>
      </div>
      </main>
      <Footer settings={fullSettings} />
      <WhatsAppButton phone={settings?.whatsapp_number || '+573138800396'} />
    </>
  )
}
