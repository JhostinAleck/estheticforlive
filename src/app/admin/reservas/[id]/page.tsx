'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Clock,
  User,
  MessageSquare,
  Save,
  Loader2,
  Trash2,
  History,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { updateAppointmentStatus, updateAppointmentNotes, deleteAppointment, getAppointmentHistory, getAppointmentById } from '@/lib/actions/appointments'
import { APPOINTMENT_STATUS } from '@/lib/constants'
import { formatPrice } from '@/lib/utils'

type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

interface Appointment {
  id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: AppointmentStatus
  client_notes: string | null
  admin_notes: string | null
  price: number | null
  created_at: string
  services: {
    name: string
    fa_icon: string
    duration_minutes: number
  } | null
  clients: {
    id: string
    full_name: string
    phone: string
    email: string | null
  } | null
}

interface HistoryItem {
  id: string
  previous_status: string | null
  new_status: string
  notes: string | null
  created_at: string
  profiles: {
    full_name: string | null
    email: string
  } | null
}

const STATUS_OPTIONS: { value: AppointmentStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'pending', label: 'Pendiente', icon: <AlertCircle className="w-4 h-4" />, color: 'bg-yellow-500' },
  { value: 'confirmed', label: 'Confirmada', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-blue-500' },
  { value: 'completed', label: 'Completada', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelada', icon: <XCircle className="w-4 h-4" />, color: 'bg-red-500' },
  { value: 'no_show', label: 'No asistió', icon: <XCircle className="w-4 h-4" />, color: 'bg-gray-500' },
]

export default function ReservaDetallePage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [currentStatus, setCurrentStatus] = useState<AppointmentStatus>('pending')

  useEffect(() => {
    async function loadData() {
      const data = await getAppointmentById(id)

      if (!data) {
        setLoading(false)
        return
      }

      const appointmentData = data as Appointment
      setAppointment(appointmentData)
      setAdminNotes(appointmentData.admin_notes || '')
      setCurrentStatus(appointmentData.status as AppointmentStatus)
      setLoading(false)

      // Load history
      const historyData = await getAppointmentHistory(id)
      setHistory(historyData as HistoryItem[])
    }

    loadData()
  }, [id])

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    if (newStatus === currentStatus) return

    setSaving(true)
    setError('')

    const result = await updateAppointmentStatus(id, newStatus, adminNotes)

    if (result.success) {
      setCurrentStatus(newStatus)
      // Reload history
      const historyData = await getAppointmentHistory(id)
      setHistory(historyData as HistoryItem[])
    } else {
      setError(result.error || 'Error al cambiar el estado')
    }

    setSaving(false)
  }

  const handleSaveNotes = async () => {
    setSaving(true)
    setError('')

    const result = await updateAppointmentNotes(id, adminNotes)

    if (!result.success) {
      setError(result.error || 'Error al guardar las notas')
    }

    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    const result = await deleteAppointment(id)

    if (result.success) {
      router.push('/admin/reservas')
    } else {
      setError(result.error || 'Error al eliminar la reserva')
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-secondary mb-4">Reserva no encontrada</h1>
        <Link href="/admin/reservas" className="text-accent hover:underline">
          Volver a reservas
        </Link>
      </div>
    )
  }

  const status = APPOINTMENT_STATUS[currentStatus]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/reservas"
            className="p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-secondary">Detalle de Reserva</h1>
            <p className="text-muted">
              {format(parseISO(appointment.appointment_date), "EEEE d 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="p-2 text-muted hover:bg-surface rounded-lg transition-colors"
            title="Ver historial"
          >
            <History className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar reserva"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Info */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="font-semibold text-secondary mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-accent" />
              Información del Cliente
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-lg font-medium text-secondary">
                  {appointment.clients?.full_name}
                </p>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <Phone className="w-4 h-4" />
                <a
                  href={`tel:${appointment.clients?.phone}`}
                  className="hover:text-accent transition-colors"
                >
                  {appointment.clients?.phone}
                </a>
              </div>
              {appointment.clients?.email && (
                <div className="flex items-center gap-2 text-muted">
                  <Mail className="w-4 h-4" />
                  <a
                    href={`mailto:${appointment.clients?.email}`}
                    className="hover:text-accent transition-colors"
                  >
                    {appointment.clients?.email}
                  </a>
                </div>
              )}
              <div className="pt-2">
                <a
                  href={`https://wa.me/${appointment.clients?.phone.replace(/\D/g, '')}?text=Hola ${appointment.clients?.full_name}, te escribimos de Esthetic For Live respecto a tu cita.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  <i className="fa-brands fa-whatsapp" />
                  Contactar por WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Service Info */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="font-semibold text-secondary mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Detalles de la Cita
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center">
                  <i className={`${appointment.services?.fa_icon || 'fa-solid fa-spa'} text-accent text-lg`} />
                </div>
                <div>
                  <p className="font-medium text-secondary">{appointment.services?.name}</p>
                  <p className="text-sm text-muted">
                    {appointment.services?.duration_minutes} minutos
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted" />
                  <span className="text-secondary">
                    {format(parseISO(appointment.appointment_date), "d MMM yyyy", { locale: es })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted" />
                  <span className="text-secondary">
                    {appointment.start_time.slice(0, 5)} - {appointment.end_time.slice(0, 5)}
                  </span>
                </div>
              </div>

              {appointment.price && (
                <div className="pt-2 border-t border-border">
                  <span className="text-lg font-semibold text-accent">
                    {formatPrice(appointment.price)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="font-semibold text-secondary mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accent" />
              Notas
            </h2>

            {appointment.client_notes && (
              <div className="mb-4 p-3 bg-surface rounded-lg">
                <p className="text-xs text-muted mb-1">Nota del cliente:</p>
                <p className="text-secondary">{appointment.client_notes}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Notas del administrador
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 min-h-[100px]"
                placeholder="Agregar notas internas..."
              />
              <button
                onClick={handleSaveNotes}
                disabled={saving}
                className="mt-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Guardar notas
              </button>
            </div>
          </div>
        </div>

        {/* Status Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="font-semibold text-secondary mb-4">Estado de la Cita</h2>

            <div className="mb-4">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${status?.color}`}>
                {status?.label}
              </span>
            </div>

            <p className="text-sm text-muted mb-4">Cambiar estado:</p>

            <div className="space-y-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  disabled={saving || opt.value === currentStatus}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    opt.value === currentStatus
                      ? 'bg-accent/10 border-2 border-accent'
                      : 'bg-surface hover:bg-border border-2 border-transparent'
                  } disabled:opacity-50`}
                >
                  <div className={`w-2 h-2 rounded-full ${opt.color}`} />
                  <span className="text-secondary font-medium">{opt.label}</span>
                  {opt.value === currentStatus && (
                    <CheckCircle className="w-4 h-4 text-accent ml-auto" />
                  )}
                </button>
              ))}
            </div>

            {saving && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted">
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </div>
            )}
          </div>

          <div className="bg-surface rounded-2xl p-4">
            <p className="text-xs text-muted">
              Creada: {format(parseISO(appointment.created_at), "d MMM yyyy 'a las' HH:mm", { locale: es })}
            </p>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-secondary mb-2">Eliminar reserva</h3>
            <p className="text-muted mb-6">
              ¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-border rounded-lg text-secondary hover:bg-surface transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary">Historial de cambios</h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 hover:bg-surface rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-muted" />
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-muted text-center py-8">No hay cambios registrados</p>
            ) : (
              <div className="space-y-4">
                {history.map((item) => {
                  const prevStatus = item.previous_status ? APPOINTMENT_STATUS[item.previous_status] : null
                  const newStatus = APPOINTMENT_STATUS[item.new_status]

                  return (
                    <div key={item.id} className="border-l-2 border-accent pl-4 pb-4">
                      <div className="flex items-center gap-2 text-sm">
                        {prevStatus && (
                          <>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${prevStatus.color}`}>
                              {prevStatus.label}
                            </span>
                            <ArrowLeft className="w-3 h-3 text-muted rotate-180" />
                          </>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${newStatus?.color}`}>
                          {newStatus?.label || item.new_status}
                        </span>
                      </div>
                      {item.notes && (
                        <p className="text-sm text-secondary mt-1">{item.notes}</p>
                      )}
                      <p className="text-xs text-muted mt-1">
                        {format(parseISO(item.created_at), "d MMM yyyy HH:mm", { locale: es })}
                        {item.profiles && ` · ${item.profiles.full_name || item.profiles.email}`}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
