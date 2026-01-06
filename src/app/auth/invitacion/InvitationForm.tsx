'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react'
import { verifyInvitationToken, acceptStaffInvitation } from '@/lib/actions/staff-auth'

interface TokenVerification {
  valid: boolean
  staff?: { id: string; name: string; email: string }
  error?: string
}

export function InvitationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [verification, setVerification] = useState<TokenVerification | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    async function verify() {
      if (!token) {
        setVerification({ valid: false, error: 'Token no proporcionado' })
        setIsLoading(false)
        return
      }

      const result = await verifyInvitationToken(token)
      setVerification(result)
      setIsLoading(false)
    }
    verify()
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password.length < 8) {
      toast.error('La contrasena debe tener al menos 8 caracteres')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Las contrasenas no coinciden')
      return
    }

    if (!token) return

    setIsSubmitting(true)
    const result = await acceptStaffInvitation(token, password)
    setIsSubmitting(false)

    if (result.success) {
      toast.success('Cuenta activada exitosamente')
      router.push(result.redirectTo || '/staff')
    } else {
      toast.error(result.error || 'Error al activar cuenta')
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-border p-8 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-2" />
          <div className="h-3 bg-gray-200 rounded w-32 mx-auto" />
        </div>
      </div>
    )
  }

  if (!verification?.valid) {
    return (
      <div className="bg-white rounded-2xl border border-border p-8 text-center">
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
          <X className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-secondary mb-2">Invitacion Invalida</h2>
        <p className="text-muted mb-6">
          {verification?.error || 'El enlace de invitacion no es valido o ha expirado.'}
        </p>
        <Button variant="outline" onClick={() => router.push('/')}>
          Ir al inicio
        </Button>
      </div>
    )
  }

  const { staff } = verification

  // Password strength indicators
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const passwordsMatch = password === confirmPassword && password.length > 0

  return (
    <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-xl font-bold text-secondary mb-1">Bienvenido, {staff?.name}</h2>
        <p className="text-muted text-sm">Configura tu contrasena para acceder al portal</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            Email
          </label>
          <Input
            type="email"
            value={staff?.email || ''}
            disabled
            className="bg-surface"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            Nueva Contrasena
          </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 8 caracteres"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            Confirmar Contrasena
          </label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contrasena"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Password requirements */}
        <div className="bg-surface rounded-xl p-3 space-y-1.5">
          <div className="text-xs font-medium text-secondary mb-2">Requisitos de contrasena:</div>
          <div className={`flex items-center gap-2 text-xs ${hasMinLength ? 'text-green-600' : 'text-muted'}`}>
            {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            Minimo 8 caracteres
          </div>
          <div className={`flex items-center gap-2 text-xs ${hasUppercase ? 'text-green-600' : 'text-muted'}`}>
            {hasUppercase ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            Al menos una mayuscula
          </div>
          <div className={`flex items-center gap-2 text-xs ${hasLowercase ? 'text-green-600' : 'text-muted'}`}>
            {hasLowercase ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            Al menos una minuscula
          </div>
          <div className={`flex items-center gap-2 text-xs ${hasNumber ? 'text-green-600' : 'text-muted'}`}>
            {hasNumber ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            Al menos un numero
          </div>
          <div className={`flex items-center gap-2 text-xs ${passwordsMatch ? 'text-green-600' : 'text-muted'}`}>
            {passwordsMatch ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            Las contrasenas coinciden
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !hasMinLength || !passwordsMatch}
        >
          {isSubmitting ? 'Activando cuenta...' : 'Activar mi Cuenta'}
        </Button>
      </form>

      <p className="text-xs text-muted text-center mt-4">
        Al activar tu cuenta, aceptas los terminos y condiciones del portal.
      </p>
    </div>
  )
}
