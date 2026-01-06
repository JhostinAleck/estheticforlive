import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, Calendar, Clock, User, FileText } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { StaffAppointmentActions } from './StaffAppointmentActions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function StaffCitaDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const adminClient = createAdminClient()

  // Get staff record
  const { data: staffData } = await adminClient
    .from('staff')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!staffData) redirect('/admin')

  const staff = staffData as { id: string }

  // Get appointment
  const { data: appointmentData, error } = await adminClient
    .from('appointments')
    .select(`
      id,
      appointment_date,
      start_time,
      end_time,
      status,
      client_notes,
      admin_notes,
      price,
      created_at,
      clients!inner(id, full_name, phone, email, total_appointments),
      services(id, name, duration_minutes, price)
    `)
    .eq('id', id)
    .eq('staff_id', staff.id)
    .single()

  if (error || !appointmentData) {
    notFound()
  }

  const appointment = appointmentData as {
    id: string
    appointment_date: string
    start_time: string
    end_time: string
    status: string
    client_notes: string | null
    admin_notes: string | null
    price: number | null
    created_at: string
    clients: {
      id: string
      full_name: string
      phone: string
      email: string | null
      total_appointments: number
    }
    services: {
      id: string
      name: string
      duration_minutes: number
      price: number | null
    } | null
  }

  // Get staff permissions
  const { data: permissionsData } = await adminClient
    .from('staff_permissions')
    .select('can_confirm_appointments, can_complete_appointments, can_cancel_appointments, can_view_client_info, can_view_client_history')
    .eq('staff_id', staff.id)
    .single()

  const permissions = (permissionsData as {
    can_confirm_appointments: boolean
    can_complete_appointments: boolean
    can_cancel_appointments: boolean
    can_view_client_info: boolean
    can_view_client_history: boolean
  }) || {
    can_confirm_appointments: true,
    can_complete_appointments: true,
    can_cancel_appointments: true,
    can_view_client_info: true,
    can_view_client_history: false,
  }

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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href="/staff/citas"
        className="inline-flex items-center text-sm text-muted hover:text-accent transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Volver a mis citas
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-secondary">
              Cita con {appointment.clients.full_name}
            </h1>
            <p className="text-muted">
              {format(parseISO(appointment.appointment_date), "EEEE d 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
            {getStatusLabel(appointment.status)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted">
            <Clock className="w-4 h-4" />
            <span>
              {appointment.start_time.slice(0, 5)} - {appointment.end_time.slice(0, 5)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted">
            <Calendar className="w-4 h-4" />
            <span>{appointment.services?.name || 'Servicio no especificado'}</span>
          </div>
        </div>
      </div>

      {/* Client Info */}
      {permissions.can_view_client_info && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="font-semibold text-secondary mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Informacion del Cliente
          </h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-muted">Nombre</div>
              <div className="font-medium text-secondary">{appointment.clients.full_name}</div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`tel:${appointment.clients.phone}`}
                className="flex items-center gap-2 text-accent hover:underline"
              >
                <Phone className="w-4 h-4" />
                {appointment.clients.phone}
              </a>
            </div>
            {appointment.clients.email && (
              <div className="flex items-center gap-3">
                <a
                  href={`mailto:${appointment.clients.email}`}
                  className="flex items-center gap-2 text-accent hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  {appointment.clients.email}
                </a>
              </div>
            )}
            {permissions.can_view_client_history && (
              <div className="text-sm text-muted">
                Total de citas: {appointment.clients.total_appointments}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {appointment.client_notes && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="font-semibold text-secondary mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Notas del Cliente
          </h2>
          <p className="text-secondary whitespace-pre-wrap">{appointment.client_notes}</p>
        </div>
      )}

      {/* Actions */}
      {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
        <StaffAppointmentActions
          appointmentId={appointment.id}
          currentStatus={appointment.status}
          permissions={permissions}
        />
      )}

      {/* WhatsApp Link */}
      {permissions.can_view_client_info && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <a
            href={`https://wa.me/${appointment.clients.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${appointment.clients.full_name}, te escribo desde Esthetic For Live respecto a tu cita del ${format(parseISO(appointment.appointment_date), "d 'de' MMMM", { locale: es })} a las ${appointment.start_time.slice(0, 5)}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Contactar por WhatsApp
          </a>
        </div>
      )}
    </div>
  )
}
