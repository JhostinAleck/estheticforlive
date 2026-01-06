'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Send,
  RefreshCw,
  Shield,
  ShieldOff,
  Link as LinkIcon,
  Unlink,
  Key,
  Mail,
  User,
  Check,
  Clock,
  XCircle,
} from 'lucide-react'
import {
  inviteStaffMember,
  resendStaffInvitation,
  revokeStaffAccess,
  enableStaffAccess,
  linkCurrentUserToStaff,
  unlinkStaffAccount,
  resetStaffPassword,
  sendStaffPasswordReset,
  getStaffAccessStatus,
} from '@/lib/actions/staff-auth'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface StaffPortalAccessProps {
  staffId: string
  staffEmail: string | null
  staffName: string
  onRefresh: () => void
}

interface AccessStatus {
  hasEmail: boolean
  hasAccount: boolean
  invitationPending: boolean
  accessEnabled: boolean
  invitationSentAt: string | null
  invitationAcceptedAt: string | null
}

export function StaffPortalAccess({
  staffId,
  staffEmail,
  staffName,
  onRefresh,
}: StaffPortalAccessProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [accessStatus, setAccessStatus] = useState<AccessStatus | null>(null)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [devInvitationLink, setDevInvitationLink] = useState<string | null>(null)

  // Load access status on mount
  useEffect(() => {
    loadAccessStatus()
  }, [staffId])

  async function loadAccessStatus() {
    const status = await getStaffAccessStatus(staffId)
    setAccessStatus(status)
  }

  async function handleInvite() {
    if (!staffEmail) {
      toast.error('Primero agrega un email al colaborador')
      return
    }

    setIsLoading(true)
    const result = await inviteStaffMember(staffId)
    setIsLoading(false)

    if (result.success) {
      // Si hay link de desarrollo, mostrarlo
      if (result.invitationLink) {
        setDevInvitationLink(result.invitationLink)
        toast.success(result.message || 'Invitacion generada (modo desarrollo)')
      } else {
        toast.success('Invitacion enviada exitosamente')
      }
      loadAccessStatus()
      onRefresh()
    } else {
      toast.error(result.error || 'Error al enviar invitacion')
    }
  }

  async function handleResendInvitation() {
    setIsLoading(true)
    const result = await resendStaffInvitation(staffId)
    setIsLoading(false)

    if (result.success) {
      if (result.invitationLink) {
        setDevInvitationLink(result.invitationLink)
        toast.success(result.message || 'Link regenerado (modo desarrollo)')
      } else {
        toast.success('Invitacion reenviada')
      }
      loadAccessStatus()
    } else {
      toast.error(result.error || 'Error al reenviar invitacion')
    }
  }

  async function handleRevokeAccess() {
    if (!confirm('¿Revocar acceso al portal? El colaborador no podra ingresar hasta que lo reactives.')) {
      return
    }

    setIsLoading(true)
    const result = await revokeStaffAccess(staffId)
    setIsLoading(false)

    if (result.success) {
      toast.success('Acceso revocado')
      loadAccessStatus()
      onRefresh()
    } else {
      toast.error(result.error || 'Error al revocar acceso')
    }
  }

  async function handleEnableAccess() {
    setIsLoading(true)
    const result = await enableStaffAccess(staffId)
    setIsLoading(false)

    if (result.success) {
      toast.success('Acceso reactivado')
      loadAccessStatus()
      onRefresh()
    } else {
      toast.error(result.error || 'Error al reactivar acceso')
    }
  }

  async function handleLinkMyAccount() {
    if (!confirm('¿Vincular tu cuenta de admin a este colaborador? Podras gestionar tus horarios desde el portal de staff.')) {
      return
    }

    setIsLoading(true)
    const result = await linkCurrentUserToStaff(staffId)
    setIsLoading(false)

    if (result.success) {
      toast.success('Cuenta vinculada exitosamente')
      loadAccessStatus()
      onRefresh()
    } else {
      toast.error(result.error || 'Error al vincular cuenta')
    }
  }

  async function handleUnlinkAccount() {
    if (!confirm('¿Desvincular cuenta de este colaborador? Perderas acceso al portal de staff.')) {
      return
    }

    setIsLoading(true)
    const result = await unlinkStaffAccount(staffId)
    setIsLoading(false)

    if (result.success) {
      toast.success('Cuenta desvinculada')
      loadAccessStatus()
      onRefresh()
    } else {
      toast.error(result.error || 'Error al desvincular cuenta')
    }
  }

  async function handleResetPassword() {
    if (newPassword.length < 8) {
      toast.error('La contrasena debe tener al menos 8 caracteres')
      return
    }

    setIsLoading(true)
    const result = await resetStaffPassword(staffId, newPassword)
    setIsLoading(false)

    if (result.success) {
      toast.success('Contrasena restablecida exitosamente')
      setNewPassword('')
      setShowPasswordReset(false)
    } else {
      toast.error(result.error || 'Error al restablecer contrasena')
    }
  }

  async function handleSendPasswordResetEmail() {
    setIsLoading(true)
    const result = await sendStaffPasswordReset(staffId)
    setIsLoading(false)

    if (result.success) {
      toast.success('Email de restablecimiento enviado')
    } else {
      toast.error(result.error || 'Error al enviar email')
    }
  }

  if (!accessStatus) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted">Cargando estado de acceso...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-secondary">Estado del acceso:</span>
        {!accessStatus.hasAccount ? (
          accessStatus.invitationPending ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
              <Clock className="w-4 h-4" />
              Invitacion Pendiente
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
              <User className="w-4 h-4" />
              Sin Cuenta
            </span>
          )
        ) : accessStatus.accessEnabled ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
            <Check className="w-4 h-4" />
            Acceso Activo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
            <XCircle className="w-4 h-4" />
            Acceso Revocado
          </span>
        )}
      </div>

      {/* Invitation Info */}
      {accessStatus.invitationSentAt && (
        <div className="text-sm text-muted">
          Invitacion enviada: {format(new Date(accessStatus.invitationSentAt), "d 'de' MMMM, yyyy HH:mm", { locale: es })}
        </div>
      )}
      {accessStatus.invitationAcceptedAt && (
        <div className="text-sm text-muted">
          Cuenta creada: {format(new Date(accessStatus.invitationAcceptedAt), "d 'de' MMMM, yyyy HH:mm", { locale: es })}
        </div>
      )}

      {/* Actions based on status */}
      <div className="border-t border-border pt-4 space-y-4">
        {!accessStatus.hasAccount && !accessStatus.invitationPending && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-medium text-blue-900 mb-2">Opciones de acceso</h4>
              <p className="text-sm text-blue-700 mb-4">
                Puedes enviar una invitacion por email o vincular tu cuenta de admin directamente.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleInvite}
                  disabled={isLoading || !staffEmail}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Invitacion
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLinkMyAccount}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Vincular Mi Cuenta
                </Button>
              </div>
              {!staffEmail && (
                <p className="text-xs text-red-600 mt-2">
                  * Agrega un email al colaborador para poder enviar invitacion
                </p>
              )}
            </div>
          </>
        )}

        {accessStatus.invitationPending && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Invitacion pendiente</h4>
            <p className="text-sm text-yellow-700 mb-4">
              Se envio una invitacion a {staffEmail}. El colaborador debe aceptarla para activar su cuenta.
            </p>
            <Button
              variant="outline"
              onClick={handleResendInvitation}
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reenviar Invitacion
            </Button>
          </div>
        )}

        {/* Development mode: show direct invitation link */}
        {devInvitationLink && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Link de Invitacion (Desarrollo)
            </h4>
            <p className="text-sm text-blue-700 mb-3">
              El email no pudo enviarse (dominio no verificado en Resend). Usa este link directamente:
            </p>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <code className="text-xs text-blue-800 break-all block">
                {devInvitationLink}
              </code>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(devInvitationLink)
                  toast.success('Link copiado al portapapeles')
                }}
              >
                Copiar Link
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(devInvitationLink, '_blank')}
              >
                Abrir en nueva pestana
              </Button>
            </div>
          </div>
        )}

        {accessStatus.hasAccount && (
          <div className="space-y-4">
            {/* Access control */}
            <div className="bg-white border border-border rounded-xl p-4">
              <h4 className="font-medium text-secondary mb-3">Control de acceso</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                {accessStatus.accessEnabled ? (
                  <Button
                    variant="outline"
                    onClick={handleRevokeAccess}
                    disabled={isLoading}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <ShieldOff className="w-4 h-4 mr-2" />
                    Revocar Acceso
                  </Button>
                ) : (
                  <Button
                    onClick={handleEnableAccess}
                    disabled={isLoading}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Reactivar Acceso
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleUnlinkAccount}
                  disabled={isLoading}
                >
                  <Unlink className="w-4 h-4 mr-2" />
                  Desvincular Cuenta
                </Button>
              </div>
            </div>

            {/* Password reset */}
            <div className="bg-white border border-border rounded-xl p-4">
              <h4 className="font-medium text-secondary mb-3">Restablecer contrasena</h4>
              {!showPasswordReset ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowPasswordReset(true)}
                    disabled={isLoading}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Establecer Nueva Contrasena
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSendPasswordResetEmail}
                    disabled={isLoading}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Email de Restablecimiento
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nueva contrasena (min. 8 caracteres)"
                    minLength={8}
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={handleResetPassword}
                      disabled={isLoading || newPassword.length < 8}
                    >
                      Guardar Contrasena
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPasswordReset(false)
                        setNewPassword('')
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
