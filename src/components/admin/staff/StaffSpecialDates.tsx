'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Trash2, Calendar, X, Sun } from 'lucide-react'
import {
  getStaffSpecialDates,
  createStaffSpecialDate,
  deleteStaffSpecialDate,
  type StaffSpecialDate,
} from '@/lib/actions/staff-schedule'
import { format, parseISO, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'

interface StaffSpecialDatesProps {
  staffId: string
}

export function StaffSpecialDates({ staffId }: StaffSpecialDatesProps) {
  const [dates, setDates] = useState<StaffSpecialDate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    is_closed: true,
    open_time: '09:00',
    close_time: '14:00',
  })

  useEffect(() => {
    loadDates()
  }, [staffId])

  async function loadDates() {
    setIsLoading(true)
    const data = await getStaffSpecialDates(staffId, {
      from: startOfDay(new Date()),
    })
    setDates(data)
    setIsLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.date) {
      toast.error('Selecciona una fecha')
      return
    }

    setIsSubmitting(true)
    const result = await createStaffSpecialDate(staffId, {
      date: formData.date,
      description: formData.description || undefined,
      is_closed: formData.is_closed,
      open_time: formData.is_closed ? undefined : formData.open_time,
      close_time: formData.is_closed ? undefined : formData.close_time,
    })
    setIsSubmitting(false)

    if (result.success) {
      toast.success('Fecha especial creada')
      setShowForm(false)
      setFormData({
        date: '',
        description: '',
        is_closed: true,
        open_time: '09:00',
        close_time: '14:00',
      })
      loadDates()
    } else {
      toast.error(result.error || 'Error al crear fecha especial')
    }
  }

  async function handleDelete(dateId: string) {
    if (!confirm('¿Eliminar esta fecha especial?')) {
      return
    }

    const result = await deleteStaffSpecialDate(dateId)

    if (result.success) {
      toast.success('Fecha especial eliminada')
      setDates(prev => prev.filter(d => d.id !== dateId))
    } else {
      toast.error(result.error || 'Error al eliminar')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted">Cargando fechas especiales...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted">
          Registra dias de vacaciones, festivos personales o horarios especiales.
        </p>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Fecha
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-4 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-secondary">Nueva Fecha Especial</h4>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-muted hover:text-secondary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                Fecha *
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                Descripcion
              </label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ej: Vacaciones, Festivo..."
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_closed}
                onChange={(e) => setFormData({ ...formData, is_closed: e.target.checked })}
                className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
              />
              <span className="text-sm text-secondary">Dia cerrado (no disponible)</span>
            </label>
          </div>

          {!formData.is_closed && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Hora apertura
                </label>
                <Input
                  type="time"
                  value={formData.open_time}
                  onChange={(e) => setFormData({ ...formData, open_time: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Hora cierre
                </label>
                <Input
                  type="time"
                  value={formData.close_time}
                  onChange={(e) => setFormData({ ...formData, close_time: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Fecha'}
            </Button>
          </div>
        </form>
      )}

      {/* Dates list */}
      {dates.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <Sun className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="text-muted">No hay fechas especiales registradas</p>
        </div>
      ) : (
        <div className="space-y-2">
          {dates.map((date) => {
            const parsedDate = parseISO(date.date)

            return (
              <div
                key={date.id}
                className="bg-white border border-border rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    date.is_closed
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-secondary">
                      {format(parsedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                    </div>
                    <div className="text-sm text-muted">
                      {date.is_closed ? (
                        <span className="text-orange-600">Dia cerrado</span>
                      ) : (
                        <span>{date.open_time} - {date.close_time}</span>
                      )}
                      {date.description && ` • ${date.description}`}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(date.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
