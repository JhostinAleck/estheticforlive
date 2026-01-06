'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Save } from 'lucide-react'
import { getStaffPermissions, updateStaffPermissions } from '@/lib/actions/staff-auth'

interface StaffPermissionsFormProps {
  staffId: string
  hasAccount: boolean
}

interface Permissions {
  can_view_appointments: boolean
  can_confirm_appointments: boolean
  can_complete_appointments: boolean
  can_cancel_appointments: boolean
  can_reschedule_appointments: boolean
  can_edit_own_schedule: boolean
  can_add_time_blocks: boolean
  can_add_special_dates: boolean
  can_view_client_info: boolean
  can_view_client_history: boolean
  can_view_reports: boolean
  can_export_data: boolean
}

const defaultPermissions: Permissions = {
  can_view_appointments: true,
  can_confirm_appointments: true,
  can_complete_appointments: true,
  can_cancel_appointments: true,
  can_reschedule_appointments: false,
  can_edit_own_schedule: true,
  can_add_time_blocks: true,
  can_add_special_dates: true,
  can_view_client_info: true,
  can_view_client_history: false,
  can_view_reports: false,
  can_export_data: false,
}

const permissionLabels: Record<keyof Permissions, { label: string; description: string }> = {
  can_view_appointments: {
    label: 'Ver sus citas',
    description: 'Puede ver la lista de citas asignadas',
  },
  can_confirm_appointments: {
    label: 'Confirmar citas',
    description: 'Puede confirmar citas pendientes',
  },
  can_complete_appointments: {
    label: 'Completar citas',
    description: 'Puede marcar citas como completadas',
  },
  can_cancel_appointments: {
    label: 'Cancelar citas',
    description: 'Puede cancelar citas programadas',
  },
  can_reschedule_appointments: {
    label: 'Reagendar citas',
    description: 'Puede cambiar fecha y hora de citas',
  },
  can_edit_own_schedule: {
    label: 'Editar horario semanal',
    description: 'Puede modificar su horario de trabajo',
  },
  can_add_time_blocks: {
    label: 'Agregar bloqueos',
    description: 'Puede bloquear horarios para reuniones o descansos',
  },
  can_add_special_dates: {
    label: 'Agregar fechas especiales',
    description: 'Puede registrar vacaciones y dias libres',
  },
  can_view_client_info: {
    label: 'Ver info de clientes',
    description: 'Puede ver nombre y telefono del cliente',
  },
  can_view_client_history: {
    label: 'Ver historial de clientes',
    description: 'Puede ver el historial completo del cliente',
  },
  can_view_reports: {
    label: 'Ver reportes',
    description: 'Puede acceder a reportes y estadisticas',
  },
  can_export_data: {
    label: 'Exportar datos',
    description: 'Puede exportar datos a CSV o Excel',
  },
}

const permissionGroups = [
  {
    title: 'Permisos de Citas',
    permissions: [
      'can_view_appointments',
      'can_confirm_appointments',
      'can_complete_appointments',
      'can_cancel_appointments',
      'can_reschedule_appointments',
    ] as (keyof Permissions)[],
  },
  {
    title: 'Permisos de Horarios',
    permissions: [
      'can_edit_own_schedule',
      'can_add_time_blocks',
      'can_add_special_dates',
    ] as (keyof Permissions)[],
  },
  {
    title: 'Permisos de Clientes',
    permissions: [
      'can_view_client_info',
      'can_view_client_history',
    ] as (keyof Permissions)[],
  },
  {
    title: 'Otros Permisos',
    permissions: [
      'can_view_reports',
      'can_export_data',
    ] as (keyof Permissions)[],
  },
]

export function StaffPermissionsForm({ staffId, hasAccount }: StaffPermissionsFormProps) {
  const [permissions, setPermissions] = useState<Permissions>(defaultPermissions)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    async function loadPermissions() {
      const data = await getStaffPermissions(staffId)
      if (data) {
        setPermissions(data)
      }
      setIsLoading(false)
    }
    loadPermissions()
  }, [staffId])

  function handlePermissionChange(key: keyof Permissions, value: boolean) {
    setPermissions(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  async function handleSave() {
    setIsSaving(true)
    const result = await updateStaffPermissions(staffId, permissions)
    setIsSaving(false)

    if (result.success) {
      toast.success('Permisos actualizados')
      setHasChanges(false)
    } else {
      toast.error(result.error || 'Error al actualizar permisos')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted">Cargando permisos...</div>
      </div>
    )
  }

  if (!hasAccount) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
        <p className="text-muted">
          Los permisos estaran disponibles cuando el colaborador tenga una cuenta activa.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {permissionGroups.map((group) => (
        <div key={group.title} className="bg-white border border-border rounded-xl p-4">
          <h4 className="font-medium text-secondary mb-4">{group.title}</h4>
          <div className="space-y-3">
            {group.permissions.map((key) => {
              const { label, description } = permissionLabels[key]
              return (
                <label
                  key={key}
                  className="flex items-start gap-3 cursor-pointer hover:bg-surface p-2 -mx-2 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={permissions[key]}
                    onChange={(e) => handlePermissionChange(key, e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded border-border text-accent focus:ring-accent"
                  />
                  <div>
                    <div className="text-sm font-medium text-secondary">{label}</div>
                    <div className="text-xs text-muted">{description}</div>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      ))}

      {/* Save button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar Permisos'}
        </Button>
      </div>
    </div>
  )
}
