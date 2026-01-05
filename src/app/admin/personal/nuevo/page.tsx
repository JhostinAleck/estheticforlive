'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, User } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createStaff } from '@/lib/actions/staff'
import { createClient } from '@/lib/supabase/client'
import type { Service } from '@/types/database.types'

const COLORS = [
  '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
  '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#FF9800',
  '#FF5722', '#795548', '#607D8B',
]

export default function NuevoPersonalPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
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
    async function loadServices() {
      const supabase = createClient()
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name')
      setServices(data || [])
    }
    loadServices()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    setIsSubmitting(true)

    const result = await createStaff(formData, selectedServices)

    if (result.success) {
      toast.success('Personal creado exitosamente')
      router.push('/admin/personal')
    } else {
      toast.error(result.error || 'Error al crear el personal')
    }

    setIsSubmitting(false)
  }

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-0">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <Link
          href="/admin/personal"
          className="inline-flex items-center text-sm text-muted hover:text-accent transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver al personal
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-secondary">Nuevo Personal</h1>
        <p className="text-sm md:text-base text-muted">Agrega un nuevo miembro al equipo</p>
      </div>

      {/* Form */}
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
              placeholder="Ej: María García"
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
                Teléfono
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
                <p className="text-sm text-muted text-center py-4">Cargando servicios...</p>
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
                Orden de visualización
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
            {isSubmitting ? 'Guardando...' : 'Guardar Personal'}
          </Button>
        </div>
      </form>
    </div>
  )
}
