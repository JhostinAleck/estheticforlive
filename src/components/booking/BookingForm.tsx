'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Loader2 } from 'lucide-react'

const bookingSchema = z.object({
  fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos').max(15),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => Promise<void>
  isSubmitting?: boolean
}

export function BookingForm({ onSubmit, isSubmitting = false }: BookingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-border p-4 md:p-6">
      <h3 className="font-semibold text-secondary mb-4">Tus datos de contacto</h3>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-secondary mb-1.5">
            Nombre completo <span className="text-accent">*</span>
          </label>
          <input
            {...register('fullName')}
            type="text"
            id="fullName"
            placeholder="Tu nombre completo"
            className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
          />
          {errors.fullName && (
            <p className="text-sm text-red-500 mt-1">{errors.fullName.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-secondary mb-1.5">
            Teléfono / WhatsApp <span className="text-accent">*</span>
          </label>
          <input
            {...register('phone')}
            type="tel"
            id="phone"
            placeholder="3001234567"
            className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Email (Optional) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-secondary mb-1.5">
            Email <span className="text-muted text-xs">(opcional)</span>
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            placeholder="tu@email.com"
            className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Notes (Optional) */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-secondary mb-1.5">
            Notas adicionales <span className="text-muted text-xs">(opcional)</span>
          </label>
          <textarea
            {...register('notes')}
            id="notes"
            rows={3}
            placeholder="Alguna indicación especial o pregunta..."
            className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all resize-none"
          />
          {errors.notes && (
            <p className="text-sm text-red-500 mt-1">{errors.notes.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Confirmando...
            </>
          ) : (
            'Confirmar Reserva'
          )}
        </Button>

        <p className="text-xs text-muted text-center">
          Al confirmar, aceptas que te contactemos para confirmar tu cita
        </p>
      </div>
    </form>
  )
}
