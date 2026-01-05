import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { ServiceCard } from '@/components/services/ServiceCard'
import type { Category, Service, SiteSettings } from '@/types/database.types'

export const metadata: Metadata = {
  title: 'Servicios | Esthetic For Live',
  description: 'Explora nuestra amplia gama de tratamientos estéticos: faciales, corporales, neuromoduladores, masajes y más.',
}

interface CategoryWithServices extends Category {
  services: Service[]
}

async function getServicesData() {
  const supabase = await createClient()

  const [
    { data: categories },
    { data: services },
    { data: settings },
  ] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('site_settings')
      .select('*')
      .single(),
  ])

  // Group services by category
  const cats = (categories || []) as Category[]
  const svcs = (services || []) as Service[]
  const categoriesWithServices: CategoryWithServices[] = cats.map(category => ({
    ...category,
    services: svcs.filter(s => s.category_id === category.id)
  }))

  return { categoriesWithServices, settings: settings as SiteSettings | null }
}

export default async function ServiciosPage() {
  const { categoriesWithServices, settings } = await getServicesData()

  return (
    <>
      <Navbar />
      <main className="pt-20">
      {/* Header */}
      <section className="bg-gradient-to-b from-accent-light to-white py-16">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <span className="text-accent font-medium text-sm uppercase tracking-wider">
            Nuestros Tratamientos
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mt-2 mb-4">
            Servicios Estéticos
          </h1>
          <p className="text-muted max-w-2xl mx-auto">
            Explora nuestra amplia gama de tratamientos diseñados para realzar tu belleza natural
            con tecnología avanzada y profesionales expertos.
          </p>
        </div>
      </section>

      {/* Categories Navigation */}
      <nav className="sticky top-16 z-40 bg-white border-b border-border py-4">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categoriesWithServices.map((category) => (
              <a
                key={category.id}
                href={`#${category.slug}`}
                className="px-4 py-2 bg-accent-light hover:bg-accent hover:text-white rounded-full text-sm font-medium text-secondary whitespace-nowrap transition-colors"
              >
                <i className={`${category.fa_icon} mr-2`} />
                {category.name}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Services by Category */}
      <div className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          {categoriesWithServices.map((category) => (
            <section
              key={category.id}
              id={category.slug}
              className="mb-20 scroll-mt-32 last:mb-0"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-accent text-white w-14 h-14 rounded-2xl flex items-center justify-center">
                  <i className={`${category.fa_icon} text-2xl`} />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-secondary">
                    {category.name}
                  </h2>
                  <p className="text-muted">{category.description}</p>
                </div>
              </div>

              {category.services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.services.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-surface rounded-2xl">
                  <p className="text-muted">
                    Próximamente agregaremos más servicios en esta categoría.
                  </p>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
      </main>
      <Footer settings={settings} />
      <WhatsAppButton phone={settings?.whatsapp_number || '+573138800396'} />
    </>
  )
}
