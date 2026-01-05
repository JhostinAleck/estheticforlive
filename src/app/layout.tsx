import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Esthetic For Live - Centro de Estética',
    template: '%s | Esthetic For Live',
  },
  description: 'Centro de estética especializado en tratamientos faciales, corporales, masajes y más. Ubicados en La Plata, Huila.',
  keywords: ['estética', 'belleza', 'tratamientos faciales', 'spa', 'La Plata', 'Huila', 'Colombia'],
  authors: [{ name: 'Esthetic For Live' }],
  creator: 'Esthetic For Live',
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: 'https://estheticforlive.com',
    siteName: 'Esthetic For Live',
    title: 'Esthetic For Live - Centro de Estética',
    description: 'Centro de estética especializado en tratamientos faciales, corporales, masajes y más.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Esthetic For Live - Centro de Estética',
    description: 'Centro de estética especializado en tratamientos faciales, corporales, masajes y más.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-primary text-secondary antialiased">
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
      </body>
    </html>
  )
}
