'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, User, Trash2, Info, Clock, CalendarOff, Shield, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getStaffById, updateStaff, deleteStaff } from '@/lib/actions/staff'
import { createClient } from '@/lib/supabase/client'
import { StaffPortalAccess } from '@/components/admin/staff/StaffPortalAccess'
import { StaffPermissionsForm } from '@/components/admin/staff/StaffPermissionsForm'
import { StaffWeeklySchedule } from '@/components/admin/staff/StaffWeeklySchedule'
import { StaffTimeBlocks } from '@/components/admin/staff/StaffTimeBlocks'
import { StaffSpecialDates } from '@/components/admin/staff/StaffSpecialDates'
import type { Service } from '@/types/database.types'

const COLORS = [
  '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
  '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#FF9800',
  '#FF5722', '#795548', '#607D8B',
]

type TabType = 'info' | 'horarios' | 'bloqueos' | 'fechas' | 'acceso'

const TABS: { key: TabType; label: string; icon: React.ReactNode }[] = [
  { key: 'info', label: 'Informacion', icon: <Info className="w-4 h-4" /> },
  { key: 'horarios', label: 'Horarios', icon: <Clock className="w-4 h-4" /> },
  { key: 'bloqueos', label: 'Bloqueos', icon: <CalendarOff className="w-4 h-4" /> },
  { key: 'fechas', label: 'Fechas Especiales', icon: <Calendar className="w-4 h-4" /> },
  { key: 'acceso', label: 'Acceso Portal', icon: <Shield className="w-4 h-4" /> },
]

export default function EditarPersonalPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [activeTab, setActiveTab] = useState<TabType>('info')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [staffData, setStaffData] = useState<{
    name: string
    email: string | null
    profile_id: string | null
  } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    color: COLORS[0],
    specialty: '',
    is_active: true,
    can_receive_appointments: true,
    display_order: 0,
  })

  useEffect(() => {
    loadData()
  }, [id])

  async function loadData() {
    // Load services
    const supabase = createClient()
    const { data: servicesData } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name')
    setServices(servicesData || [])

    // Load staff
    const staff = await getStaffById(id)
    if (staff) {
      setFormData({
        name: staff.name,
        email: staff.email || '',
        phone: staff.phone || '',
        color: staff.color,
        specialty: staff.specialty || '',
        is_active: staff.is_active,
        can_receive_appointments: staff.can_receive_appointments,
        display_order: staff.display_order,
      })
      setStaffData({
        name: staff.name,
        email: staff.email,
        profile_id: staff.profile_id,
      })
      setSelectedServices(staff.staff_services?.map(ss => ss.service_id) || [])
    } else {
      toast.error('Personal no encontrado')
      router.push('/admin/personal')
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    setIsSubmitting(true)

    const result = await updateStaff(id, formData, selectedServices)

    if (result.success) {
      toast.success('Personal actualizado exitosamente')
      setStaffData(prev => prev ? { ...prev, name: formData.name, email: formData.email || null } : null)
    } else {
      toast.error(result.error || 'Error al actualizar el personal')
    }

    setIsSubmitting(false)
  }

  const handleDelete = async () => {
    if (!confirm('¿Estas seguro de eliminar este personal? Esta accion no se puede deshacer.')) {
      return
    }

    setIsDeleting(true)

    const result = await deleteStaff(id)

    if (result.success) {
      toast.success('Personal eliminado')
      router.push('/admin/personal')
    } else {
      toast.error(result.error || 'Error al eliminar')
      setIsDeleting(false)
    }
  }

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(sid => sid !== serviceId)
        : [...prev, serviceId]
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-muted">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <Link
          href="/admin/personal"
          className="inline-flex items-center text-sm text-muted hover:text-accent transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver al personal
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
              style={{ backgroundColor: formData.color }}
            >
              {formData.name ? formData.name.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-secondary">{formData.name || 'Editar Personal'}</h1>
              <p className="text-sm text-muted">{formData.specialty || 'Sin especialidad'}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6 overflow-x-auto">
        <nav className="flex gap-1 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:text-secondary hover:border-border'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pb-8">
        {activeTab === 'info' && (
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="bg-white rounded-2xl border border-border p-4 md:p-6 space-y-4">
              {/* Avatar Preview */}
              <div className="flex justify-center mb-4">
                <div
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold"
                  style={{ backgroundColor: formData.color }}
                >
                  {formData.name ? formData.name.charAt(0).toUpperCase() : <User className="w-8 h-8 md:w-10 md:h-10" />}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Nombre completo *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Maria Garcia"
                  required
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Color identificador
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-full transition-transform ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-secondary scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Telefono
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+57 300 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="maria@ejemplo.com"
                  />
                </div>
              </div>

              {/* Specialty */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Especialidad
                </label>
                <Input
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="Ej: Tratamientos Faciales"
                />
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Servicios que puede realizar
                </label>
                <div className="border border-border rounded-xl p-3 max-h-48 overflow-y-auto">
                  {services.length === 0 ? (
                    <p className="text-sm text-muted text-center py-4">No hay servicios</p>
                  ) : (
                    <div className="space-y-2">
                      {services.map((service) => (
                        <label
                          key={service.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-surface p-2 rounded-lg"
                        >
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(service.id)}
                            onChange={() => toggleService(service.id)}
                            className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                          />
                          <span className="text-sm text-secondary">{service.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted mt-1">
                  {selectedServices.length} servicios seleccionados
                </p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Orden de visualizacion
                  </label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                    }
                    min={0}
                  />
                </div>
                <div className="space-y-3 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                    />
                    <span className="text-sm text-secondary">Activo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.can_receive_appointments}
                      onChange={(e) =>
                        setFormData({ ...formData, can_receive_appointments: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                    />
                    <span className="text-sm text-secondary">Puede recibir citas</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/admin/personal" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'horarios' && (
          <div className="bg-white rounded-2xl border border-border p-4 md:p-6">
            <h3 className="text-lg font-semibold text-secondary mb-4">Horario Semanal</h3>
            <StaffWeeklySchedule staffId={id} isAdmin={true} />
          </div>
        )}

        {activeTab === 'bloqueos' && (
          <div className="bg-white rounded-2xl border border-border p-4 md:p-6">
            <h3 className="text-lg font-semibold text-secondary mb-4">Bloqueos de Tiempo</h3>
            <StaffTimeBlocks staffId={id} />
          </div>
        )}

        {activeTab === 'fechas' && (
          <div className="bg-white rounded-2xl border border-border p-4 md:p-6">
            <h3 className="text-lg font-semibold text-secondary mb-4">Fechas Especiales</h3>
            <StaffSpecialDates staffId={id} />
          </div>
        )}

        {activeTab === 'acceso' && staffData && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border p-4 md:p-6">
              <h3 className="text-lg font-semibold text-secondary mb-4">Acceso al Portal</h3>
              <StaffPortalAccess
                staffId={id}
                staffEmail={staffData.email}
                staffName={staffData.name}
                onRefresh={loadData}
              />
            </div>

            <div className="bg-white rounded-2xl border border-border p-4 md:p-6">
              <h3 className="text-lg font-semibold text-secondary mb-4">Permisos</h3>
              <StaffPermissionsForm
                staffId={id}
                hasAccount={!!staffData.profile_id}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
