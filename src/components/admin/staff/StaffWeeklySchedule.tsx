'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Copy, Save } from 'lucide-react'
import {
  getStaffSchedules,
  updateStaffSchedule,
  copyFromBusinessHours,
  type StaffSchedule,
} from '@/lib/actions/staff-schedule'

interface StaffWeeklyScheduleProps {
  staffId: string
  isAdmin?: boolean
}

const DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miercoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sabado' },
  { key: 'sunday', label: 'Domingo' },
]

export function StaffWeeklySchedule({ staffId, isAdmin = false }: StaffWeeklyScheduleProps) {
  const [schedules, setSchedules] = useState<StaffSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editedDays, setEditedDays] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadSchedules()
  }, [staffId])

  async function loadSchedules() {
    setIsLoading(true)
    const data = await getStaffSchedules(staffId)
    setSchedules(data)
    setIsLoading(false)
  }

  function getScheduleForDay(day: string): StaffSchedule | undefined {
    return schedules.find(s => s.day_of_week === day)
  }

  function handleTimeChange(day: string, field: 'open_time' | 'close_time', value: string) {
    setSchedules(prev =>
      prev.map(s =>
        s.day_of_week === day ? { ...s, [field]: value } : s
      )
    )
    setEditedDays(prev => new Set(prev).add(day))
  }

  function handleClosedChange(day: string, isClosed: boolean) {
    setSchedules(prev =>
      prev.map(s =>
        s.day_of_week === day ? { ...s, is_closed: isClosed } : s
      )
    )
    setEditedDays(prev => new Set(prev).add(day))
  }

  async function handleSaveDay(day: string) {
    const schedule = getScheduleForDay(day)
    if (!schedule) return

    setIsSaving(true)
    const result = await updateStaffSchedule(staffId, day, {
      open_time: schedule.open_time,
      close_time: schedule.close_time,
      is_closed: schedule.is_closed,
    })
    setIsSaving(false)

    if (result.success) {
      toast.success('Horario actualizado')
      setEditedDays(prev => {
        const newSet = new Set(prev)
        newSet.delete(day)
        return newSet
      })
    } else {
      toast.error(result.error || 'Error al guardar')
    }
  }

  async function handleSaveAll() {
    if (editedDays.size === 0) return

    setIsSaving(true)
    let hasError = false

    for (const day of Array.from(editedDays)) {
      const schedule = getScheduleForDay(day)
      if (!schedule) continue

      const result = await updateStaffSchedule(staffId, day, {
        open_time: schedule.open_time,
        close_time: schedule.close_time,
        is_closed: schedule.is_closed,
      })

      if (!result.success) {
        hasError = true
        toast.error(`Error al guardar ${day}: ${result.error}`)
      }
    }

    setIsSaving(false)

    if (!hasError) {
      toast.success('Todos los horarios actualizados')
      setEditedDays(new Set())
    }
  }

  async function handleCopyFromBusiness() {
    if (!confirm('¿Copiar los horarios globales del negocio? Esto sobrescribira los horarios actuales.')) {
      return
    }

    setIsSaving(true)
    const result = await copyFromBusinessHours(staffId)
    setIsSaving(false)

    if (result.success) {
      toast.success('Horarios copiados')
      loadSchedules()
      setEditedDays(new Set())
    } else {
      toast.error(result.error || 'Error al copiar horarios')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted">Cargando horarios...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header actions */}
      {isAdmin && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyFromBusiness}
            disabled={isSaving}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copiar Horarios Globales
          </Button>
          {editedDays.size > 0 && (
            <Button
              size="sm"
              onClick={handleSaveAll}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Todo ({editedDays.size})
            </Button>
          )}
        </div>
      )}

      {/* Schedule grid */}
      <div className="space-y-2">
        {DAYS.map(({ key, label }) => {
          const schedule = getScheduleForDay(key)
          const isEdited = editedDays.has(key)

          if (!schedule) return null

          return (
            <div
              key={key}
              className={`bg-white border rounded-xl p-4 ${
                isEdited ? 'border-accent ring-1 ring-accent/20' : 'border-border'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Day name */}
                <div className="w-full sm:w-28">
                  <span className="font-medium text-secondary">{label}</span>
                </div>

                {/* Closed toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={schedule.is_closed}
                    onChange={(e) => handleClosedChange(key, e.target.checked)}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-muted">Cerrado</span>
                </label>

                {/* Time inputs */}
                {!schedule.is_closed && (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={schedule.open_time}
                      onChange={(e) => handleTimeChange(key, 'open_time', e.target.value)}
                      className="px-3 py-1.5 border border-border rounded-lg text-sm focus:ring-1 focus:ring-accent focus:border-accent"
                    />
                    <span className="text-muted">a</span>
                    <input
                      type="time"
                      value={schedule.close_time}
                      onChange={(e) => handleTimeChange(key, 'close_time', e.target.value)}
                      className="px-3 py-1.5 border border-border rounded-lg text-sm focus:ring-1 focus:ring-accent focus:border-accent"
                    />
                  </div>
                )}

                {/* Save button for individual day */}
                {isEdited && !isAdmin && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSaveDay(key)}
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Save all for non-admin (staff portal) */}
      {!isAdmin && editedDays.size > 0 && (
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSaveAll}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Guardando...' : `Guardar Cambios (${editedDays.size})`}
          </Button>
        </div>
      )}
    </div>
  )
}
