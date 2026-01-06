import { Suspense } from 'react'
import { InvitationForm } from './InvitationForm'

export const metadata = {
  title: 'Aceptar Invitacion - Esthetic For Live',
}

export default function InvitacionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-white px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-secondary mb-2">Esthetic For Live</h1>
          <p className="text-muted">Portal de Colaboradores</p>
        </div>

        <Suspense fallback={
          <div className="bg-white rounded-2xl border border-border p-8 text-center">
            <div className="text-muted">Verificando invitacion...</div>
          </div>
        }>
          <InvitationForm />
        </Suspense>
      </div>
    </div>
  )
}
