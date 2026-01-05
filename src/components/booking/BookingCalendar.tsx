'use client'

import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { es } from 'date-fns/locale'
import { format, isBefore, startOfDay, addDays } from 'date-fns'
import { cn } from '@/lib/utils/cn'
import 'react-day-picker/style.css'

interface BookingCalendarProps {
  selectedDate: Date | undefined
  onDateSelect: (date: Date | undefined) => void
  disabledDays?: Date[]
  closedDays?: number[] // 0 = Sunday, 6 = Saturday
}

export function BookingCalendar({
  selectedDate,
  onDateSelect,
  disabledDays = [],
  closedDays = [0], // Sunday closed by default
}: BookingCalendarProps) {
  const today = startOfDay(new Date())
  const maxDate = addDays(today, 60) // Can book up to 60 days ahead

  const isDisabled = (date: Date) => {
    // Can't book in the past
    if (isBefore(date, today)) return true
    // Can't book on closed days
    if (closedDays.includes(date.getDay())) return true
    // Check specific disabled dates
    return disabledDays.some(d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-4 md:p-6">
      <h3 className="font-semibold text-secondary mb-4">Selecciona una fecha</h3>
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        locale={es}
        disabled={isDisabled}
        fromDate={today}
        toDate={maxDate}
        showOutsideDays={false}
        classNames={{
          root: 'w-full',
          months: 'w-full',
          month: 'w-full',
          caption: 'flex justify-between items-center mb-4',
          caption_label: 'text-lg font-semibold text-secondary capitalize',
          nav: 'flex gap-1',
          button_previous: 'p-2 hover:bg-accent-light rounded-lg transition-colors',
          button_next: 'p-2 hover:bg-accent-light rounded-lg transition-colors',
          month_grid: 'w-full border-collapse',
          weekdays: 'flex',
          weekday: 'text-muted text-sm font-medium w-full text-center py-2',
          week: 'flex w-full',
          day: 'w-full aspect-square p-0.5',
          day_button: cn(
            'w-full h-full rounded-lg text-sm font-medium transition-all',
            'hover:bg-accent-light hover:text-accent',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2'
          ),
          selected: 'bg-accent text-white hover:bg-accent hover:text-white',
          today: 'border-2 border-accent',
          outside: 'text-muted/40',
          disabled: 'text-muted/30 cursor-not-allowed hover:bg-transparent',
        }}
      />
      {selectedDate && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted">
            Fecha seleccionada:{' '}
            <span className="font-semibold text-secondary">
              {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
