'use client'

import { cn } from '@/lib/utils/cn'

interface TimeSlot {
  time: string
  available: boolean
}

interface TimeSlotsProps {
  slots: TimeSlot[]
  selectedTime: string | undefined
  onTimeSelect: (time: string) => void
  isLoading?: boolean
}

export function TimeSlots({
  slots,
  selectedTime,
  onTimeSelect,
  isLoading = false,
}: TimeSlotsProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-border p-4 md:p-6">
        <h3 className="font-semibold text-secondary mb-4">Horarios disponibles</h3>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-surface rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  const availableSlots = slots.filter(s => s.available)
  const unavailableSlots = slots.filter(s => !s.available)

  return (
    <div className="bg-white rounded-2xl border border-border p-4 md:p-6">
      <h3 className="font-semibold text-secondary mb-4">
        Horarios disponibles
        {availableSlots.length > 0 && (
          <span className="text-sm font-normal text-muted ml-2">
            ({availableSlots.length} disponibles)
          </span>
        )}
      </h3>

      {slots.length === 0 ? (
        <p className="text-muted text-sm py-4 text-center">
          Selecciona una fecha para ver los horarios disponibles
        </p>
      ) : availableSlots.length === 0 ? (
        <p className="text-muted text-sm py-4 text-center">
          No hay horarios disponibles para este día. Por favor, selecciona otra fecha.
        </p>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => slot.available && onTimeSelect(slot.time)}
              disabled={!slot.available}
              className={cn(
                'py-2.5 px-3 rounded-lg text-sm font-medium transition-all',
                slot.available
                  ? selectedTime === slot.time
                    ? 'bg-accent text-white ring-2 ring-accent ring-offset-2'
                    : 'bg-accent-light text-accent hover:bg-accent hover:text-white'
                  : 'bg-surface text-muted/50 cursor-not-allowed line-through'
              )}
            >
              {slot.time}
            </button>
          ))}
        </div>
      )}

      {selectedTime && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted">
            Hora seleccionada:{' '}
            <span className="font-semibold text-secondary">{selectedTime}</span>
          </p>
        </div>
      )}
    </div>
  )
}
