'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Check, X, CheckCircle } from 'lucide-react'
import { updateAppointmentStatus } from '@/lib/actions/appointments'

type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

interface StaffAppointmentActionsProps {
  appointmentId: string
  currentStatus: string
  permissions: {
    can_confirm_appointments: boolean
    can_complete_appointments: boolean
    can_cancel_appointments: boolean
  }
}

export function StaffAppointmentActions({
  appointmentId,
  currentStatus,
  permissions,
}: StaffAppointmentActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  async function handleStatusChange(newStatus: AppointmentStatus) {
    setIsLoading(newStatus)

    const result = await updateAppointmentStatus(appointmentId, newStatus)

    if (result.success) {
      toast.success(
        newStatus === 'confirmed' ? 'Cita confirmada' :
        newStatus === 'completed' ? 'Cita completada' :
        newStatus === 'cancelled' ? 'Cita cancelada' : 'Estado actualizado'
      )
      router.refresh()
    } else {
      toast.error(result.error || 'Error al actualizar estado')
    }

    setIsLoading(null)
  }

  const canConfirm = currentStatus === 'pending' && permissions.can_confirm_appointments
  const canComplete = (currentStatus === 'pending' || currentStatus === 'confirmed') && permissions.can_complete_appointments
  const canCancel = (currentStatus === 'pending' || currentStatus === 'confirmed') && permissions.can_cancel_appointments

  if (!canConfirm && !canComplete && !canCancel) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <h2 className="font-semibold text-secondary mb-4">Acciones</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        {canConfirm && (
          <Button
            onClick={() => handleStatusChange('confirmed')}
            disabled={isLoading !== null}
            className="flex-1 bg-blue-500 hover:bg-blue-600"
          >
            <Check className="w-4 h-4 mr-2" />
            {isLoading === 'confirmed' ? 'Confirmando...' : 'Confirmar Cita'}
          </Button>
        )}
        {canComplete && (
          <Button
            onClick={() => handleStatusChange('completed')}
            disabled={isLoading !== null}
            className="flex-1 bg-green-500 hover:bg-green-600"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isLoading === 'completed' ? 'Completando...' : 'Marcar Completada'}
          </Button>
        )}
        {canCancel && (
          <Button
            variant="outline"
            onClick={() => {
              if (confirm('¿Estas seguro de cancelar esta cita?')) {
                handleStatusChange('cancelled')
              }
            }}
            disabled={isLoading !== null}
            className="flex-1 text-red-600 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-2" />
            {isLoading === 'cancelled' ? 'Cancelando...' : 'Cancelar Cita'}
          </Button>
        )}
      </div>
    </div>
  )
}
