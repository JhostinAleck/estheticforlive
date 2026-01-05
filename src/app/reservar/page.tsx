import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { Clock, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Service, Category, SiteSettings } from '@/types/database.types'

export const metadata: Metadata = {
  title: 'Reservar Cita | Esthetic For Live',
  description: 'Agenda tu cita en Esthetic For Live. Selecciona el servicio que deseas y elige el horario que mejor te convenga.',
}

interface ServiceWithCategory extends Service {
  categories: Category | null
}

async function getServicesForBooking() {
  const supabase = await createClient()

  const [{ data: services }, { data: settings }] = await Promise.all([
    supabase
      .from('services')
      .select('*, categories(*)')
      .eq('is_active', true)
      .order('display_order'),
    supabase.from('site_settings').select('*').single(),
  ])

  // Group by category
  const grouped = (services || []).reduce((acc, service) => {
    const categoryName = (service as ServiceWithCategory).categories?.name || 'Otros'
    if (!acc[categoryName]) acc[categoryName] = []
    acc[categoryName].push(service)
    return acc
  }, {} as Record<string, Service[]>)

  return { grouped, services: services || [], settings: settings as SiteSettings | null }
}

export default async function ReservarPage() {
  const { grouped, settings } = await getServicesForBooking()

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-surface">
      {/* Header */}
      <section className="bg-gradient-to-b from-accent-light to-surface py-12">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <span className="text-accent font-medium text-sm uppercase tracking-wider">
            Paso 1 de 3
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-secondary mt-2 mb-4">
            Selecciona un Servicio
          </h1>
          <p className="text-muted max-w-xl mx-auto">
            Elige el tratamiento que deseas agendar
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {Object.entries(grouped).map(([categoryName, services]) => (
            <div key={categoryName} className="mb-10">
              <h2 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-accent text-white rounded-lg flex items-center justify-center text-sm">
                  {services.length}
                </span>
                {categoryName}
              </h2>

              <div className="space-y-3">
                {services.map((service) => (
                  <Link
                    key={service.id}
                    href={`/reservar/${service.id}`}
                    className="block bg-white rounded-xl border border-border hover:border-accent hover:shadow-md transition-all p-4 group"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="bg-accent-light w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-white transition-colors text-accent">
                          <i className={`${service.fa_icon} text-lg`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-secondary group-hover:text-accent transition-colors">
                            {service.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted">
                            {service.duration_minutes && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {service.duration_minutes} min
                              </span>
                            )}
                            {service.price && (
                              <span className="font-medium text-accent">
                                {formatPrice(service.price)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {Object.keys(grouped).length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl">
              <p className="text-muted mb-4">
                No hay servicios disponibles en este momento.
              </p>
              <Link href="/" className="text-accent font-medium hover:underline">
                Volver al inicio
              </Link>
            </div>
          )}
        </div>
      </section>
      </main>
      <Footer settings={settings} />
      <WhatsAppButton phone={settings?.whatsapp_number || '+573138800396'} />
    </>
  )
}
