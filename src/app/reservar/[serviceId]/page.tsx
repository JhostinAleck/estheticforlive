import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { BookingClient } from './BookingClient'
import { getClosedDays, getSpecialDates } from '@/lib/actions/booking'
import type { SiteSettings } from '@/types/database.types'

interface Props {
  params: Promise<{ serviceId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { serviceId } = await params
  const supabase = await createClient()

  const { data: service } = await supabase
    .from('services')
    .select('name')
    .eq('id', serviceId)
    .single()

  const svc = service as { name: string } | null

  return {
    title: svc ? `Reservar ${svc.name} | Esthetic For Live` : 'Reservar Cita',
    description: 'Selecciona fecha y hora para tu cita',
  }
}

async function getServiceData(serviceId: string) {
  const supabase = await createClient()

  const [{ data: service, error }, { data: settings }] = await Promise.all([
    supabase
      .from('services')
      .select('*, categories(*)')
      .eq('id', serviceId)
      .eq('is_active', true)
      .single(),
    supabase.from('site_settings').select('*').single(),
  ])

  const siteSettings = settings as SiteSettings | null

  if (error || !service) {
    return { service: null, settings: siteSettings }
  }

  return { service, settings: siteSettings }
}

export default async function ReservarServicioPage({ params }: Props) {
  const { serviceId } = await params
  const { service, settings } = await getServiceData(serviceId)

  if (!service) {
    notFound()
  }

  const closedDays = await getClosedDays()
  const specialDates = await getSpecialDates()

  return (
    <>
      <Navbar />
      <BookingClient
        service={service}
        closedDays={closedDays}
        specialDates={specialDates}
      />
      <Footer settings={settings} />
      <WhatsAppButton phone={settings?.whatsapp_number || '+573138800396'} />
    </>
  )
}
