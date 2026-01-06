'use client'

import { Clock, AlertCircle } from 'lucide-react'
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
        <h3 className="font-semibold text-secondary mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent" />
          Horarios disponibles
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="h-11 bg-surface rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  const availableSlots = slots.filter(s => s.available)

  return (
    <div className="bg-white rounded-2xl border border-border p-4 md:p-6 flex flex-col">
      <h3 className="font-semibold text-secondary mb-1 flex items-center gap-2">
        <Clock className="w-5 h-5 text-accent" />
        Horarios disponibles
      </h3>
      {availableSlots.length > 0 && (
        <p className="text-sm text-muted mb-4">
          {availableSlots.length} horarios disponibles
        </p>
      )}

      {slots.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center mb-3">
            <Clock className="w-6 h-6 text-muted" />
          </div>
          <p className="text-muted text-sm">
            Selecciona una fecha para ver los horarios disponibles
          </p>
        </div>
      ) : availableSlots.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <p className="text-secondary font-medium mb-1">Sin disponibilidad</p>
          <p className="text-muted text-sm">
            No hay horarios disponibles para este día.
            <br />
            Por favor, selecciona otra fecha.
          </p>
        </div>
      ) : (
        <div className="max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => slot.available && onTimeSelect(slot.time)}
                disabled={!slot.available}
                className={cn(
                  'py-3 px-3 rounded-xl text-sm font-medium transition-all',
                  slot.available
                    ? selectedTime === slot.time
                      ? 'bg-accent text-white shadow-lg shadow-accent/30 scale-105'
                      : 'bg-accent-light text-accent hover:bg-accent hover:text-white hover:shadow-md'
                    : 'bg-surface text-muted/40 cursor-not-allowed line-through'
                )}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedTime && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-center">
            <span className="text-muted">Hora seleccionada: </span>
            <span className="font-semibold text-accent text-lg">{selectedTime}</span>
          </p>
        </div>
      )}
    </div>
  )
}
