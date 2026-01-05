import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/home/Hero'
import { ServicesGrid } from '@/components/home/ServicesGrid'
import { ResultsCarousel } from '@/components/home/ResultsCarousel'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import type { SiteSettings } from '@/types/database.types'

async function getHomeData() {
  const supabase = await createClient()

  const [
    { data: categories },
    { data: results },
    { data: settings },
  ] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('before_after_results')
      .select('*')
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('site_settings')
      .select('*')
      .single(),
  ])

  return {
    categories: categories || [],
    results: results || [],
    settings: settings as SiteSettings | null,
  }
}

export default async function HomePage() {
  const { categories, results, settings } = await getHomeData()

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Hero />
        <ServicesGrid
          categories={categories}
          title={settings?.services_title || 'Nuestros Servicios'}
          subtitle={settings?.services_subtitle || 'Explora nuestra amplia gama de tratamientos estéticos'}
        />
        <ResultsCarousel
          results={results}
          title={settings?.results_title || 'Resultados Reales'}
          subtitle={settings?.results_subtitle || 'Transformaciones que hablan por sí solas'}
        />
      </main>
      <Footer settings={settings} />
      <WhatsAppButton phone={settings?.whatsapp_number || '+573138800396'} />
    </>
  )
}
