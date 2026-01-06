'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Trash2, Clock, X } from 'lucide-react'
import {
  getStaffTimeBlocks,
  createStaffTimeBlock,
  deleteStaffTimeBlock,
  type StaffTimeBlock,
} from '@/lib/actions/staff-schedule'
import { format, parseISO, addMonths, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'

interface StaffTimeBlocksProps {
  staffId: string
}

export function StaffTimeBlocks({ staffId }: StaffTimeBlocksProps) {
  const [blocks, setBlocks] = useState<StaffTimeBlock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    start_time: '09:00',
    end_time: '10:00',
    reason: '',
  })

  useEffect(() => {
    loadBlocks()
  }, [staffId])

  async function loadBlocks() {
    setIsLoading(true)
    const data = await getStaffTimeBlocks(staffId, {
      from: startOfDay(new Date()),
      to: addMonths(new Date(), 3),
    })
    setBlocks(data)
    setIsLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.date || !formData.start_time || !formData.end_time) {
      toast.error('Completa todos los campos')
      return
    }

    const startDatetime = `${formData.date}T${formData.start_time}:00`
    const endDatetime = `${formData.date}T${formData.end_time}:00`

    if (endDatetime <= startDatetime) {
      toast.error('La hora de fin debe ser mayor a la hora de inicio')
      return
    }

    setIsSubmitting(true)
    const result = await createStaffTimeBlock(staffId, {
      start_datetime: startDatetime,
      end_datetime: endDatetime,
      reason: formData.reason || undefined,
    })
    setIsSubmitting(false)

    if (result.success) {
      toast.success('Bloqueo creado')
      setShowForm(false)
      setFormData({
        date: '',
        start_time: '09:00',
        end_time: '10:00',
        reason: '',
      })
      loadBlocks()
    } else {
      toast.error(result.error || 'Error al crear bloqueo')
    }
  }

  async function handleDelete(blockId: string) {
    if (!confirm('¿Eliminar este bloqueo de tiempo?')) {
      return
    }

    const result = await deleteStaffTimeBlock(blockId)

    if (result.success) {
      toast.success('Bloqueo eliminado')
      setBlocks(prev => prev.filter(b => b.id !== blockId))
    } else {
      toast.error(result.error || 'Error al eliminar')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted">Cargando bloqueos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted">
          Bloquea horarios para reuniones, descansos u otras actividades.
        </p>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Bloqueo
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-4 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-secondary">Nuevo Bloqueo</h4>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-muted hover:text-secondary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                Hora inicio *
              </label>
              <Input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                Hora fin *
              </label>
              <Input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Motivo (opcional)
            </label>
            <Input
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Ej: Reunion de equipo, Almuerzo..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Bloqueo'}
            </Button>
          </div>
        </form>
      )}

      {/* Blocks list */}
      {blocks.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <Clock className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="text-muted">No hay bloqueos programados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {blocks.map((block) => {
            const startDate = parseISO(block.start_datetime)
            const endDate = parseISO(block.end_datetime)

            return (
              <div
                key={block.id}
                className="bg-white border border-border rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-secondary">
                      {format(startDate, "EEEE d 'de' MMMM", { locale: es })}
                    </div>
                    <div className="text-sm text-muted">
                      {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
                      {block.reason && ` • ${block.reason}`}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(block.id)}
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
