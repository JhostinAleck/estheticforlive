import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { NuevaReservaClient } from './NuevaReservaClient'

export const metadata: Metadata = {
  title: 'Nueva Reserva | Admin - Esthetic For Live',
  description: 'Crear nueva reserva',
}

interface Service {
  id: string
  name: string
  fa_icon: string
  duration_minutes: number
  price: number | null
}

interface Staff {
  id: string
  name: string
  color: string
  specialty: string | null
}

interface Client {
  id: string
  full_name: string
  phone: string
  email: string | null
}

async function getData() {
  const supabase = await createClient()

  const [servicesRes, staffRes, clientsRes] = await Promise.all([
    supabase
      .from('services')
      .select('id, name, fa_icon, duration_minutes, price')
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('staff')
      .select('id, name, color, specialty')
      .eq('is_active', true)
      .eq('can_receive_appointments', true)
      .order('name'),
    supabase
      .from('clients')
      .select('id, full_name, phone, email')
      .order('full_name')
      .limit(100),
  ])

  return {
    services: (servicesRes.data || []) as Service[],
    staff: (staffRes.data || []) as Staff[],
    clients: (clientsRes.data || []) as Client[],
  }
}

export default async function NuevaReservaPage() {
  const { services, staff, clients } = await getData()

  return (
    <NuevaReservaClient
      services={services}
      staff={staff}
      existingClients={clients}
    />
  )
}
