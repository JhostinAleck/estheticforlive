export const SITE_CONFIG = {
  name: 'Esthetic For Live',
  description: 'Centro de estética especializado en tratamientos faciales, corporales, masajes y más.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://estheticforlive.com',
}

export const SOCIAL_MEDIA = {
  tiktok: {
    username: '@esthetic.for.live',
    url: 'https://www.tiktok.com/@esthetic.for.live',
  },
  instagram: {
    username: '@estheticforlivee',
    url: 'https://www.instagram.com/estheticforlivee',
  },
  whatsapp: {
    phoneNumber: '+57 313 8800396',
    phone: '+573138800396',
    defaultMessage: 'Hola, me gustaría agendar una valoración',
  },
  location: {
    address: 'Calle 4 No 5-40 García Rovira, La Plata',
    city: 'La Plata, Huila',
    country: 'Colombia',
    mapsUrl: 'https://www.google.com/maps/place/Esthetic+For+Live/data=!4m2!3m1!1s0x0:0x4e579c4c0fa5cb1c?sa=X&ved=1t:2428&ictx=111',
    mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.5!2d-75.892!3d2.387!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x4e579c4c0fa5cb1c!2sEsthetic%20For%20Live!5e0!3m2!1ses!2sco!4v1703000000000',
  },
}

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No asistió',
}

export const APPOINTMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-gray-100 text-gray-800',
}

export const APPOINTMENT_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmada', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Completada', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
  no_show: { label: 'No asistió', color: 'bg-gray-100 text-gray-800' },
}

export const DAY_OF_WEEK_LABELS: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
}
