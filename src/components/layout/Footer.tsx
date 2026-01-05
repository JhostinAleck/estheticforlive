'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Mail, Phone, Instagram, Facebook } from 'lucide-react'
import { SOCIAL_MEDIA } from '@/lib/constants'
import { generateWhatsAppLink } from '@/lib/utils'
import type { SiteSettings } from '@/types/database.types'

interface FooterProps {
  settings: SiteSettings | null
}

export function Footer({ settings }: FooterProps) {
  const whatsappLink = generateWhatsAppLink(
    settings?.whatsapp_number || SOCIAL_MEDIA.whatsapp.phone,
    SOCIAL_MEDIA.whatsapp.defaultMessage
  )

  return (
    <footer className="bg-surface pt-16 pb-8 border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/esthetic-logo.png"
                alt="Esthetic For Live"
                width={100}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-muted text-sm leading-relaxed">
              Expertos en armonización facial y corporal. Combinamos tecnología avanzada con técnicas especializadas para resaltar tu belleza natural.
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href={settings?.instagram_url || SOCIAL_MEDIA.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent-light p-2.5 rounded-full text-accent hover:bg-accent hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={settings?.tiktok_url || SOCIAL_MEDIA.tiktok.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent-light p-2.5 rounded-full text-accent hover:bg-accent hover:text-white transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a
                href="#"
                className="bg-accent-light p-2.5 rounded-full text-accent hover:bg-accent hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-secondary font-semibold mb-6">Enlaces Rápidos</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-muted hover:text-accent transition-colors text-sm">Inicio</Link>
              </li>
              <li>
                <Link href="/servicios" className="text-muted hover:text-accent transition-colors text-sm">Servicios</Link>
              </li>
              <li>
                <Link href="/reservar" className="text-muted hover:text-accent transition-colors text-sm">Reservar Cita</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-secondary font-semibold mb-6">Tratamientos</h3>
            <ul className="space-y-3">
              <li className="text-muted text-sm">Limpieza Facial Profunda</li>
              <li className="text-muted text-sm">Rinomodelación</li>
              <li className="text-muted text-sm">M.E.L.A</li>
              <li className="text-muted text-sm">Depilación Láser</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-secondary font-semibold mb-6">Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <a
                  href={settings?.maps_url || SOCIAL_MEDIA.location.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors text-sm"
                >
                  {settings?.address || SOCIAL_MEDIA.location.address}<br />
                  <span className="text-muted-light">{settings?.city || SOCIAL_MEDIA.location.city}</span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent shrink-0" />
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent transition-colors text-sm">
                  {settings?.whatsapp_number || SOCIAL_MEDIA.whatsapp.phoneNumber}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent shrink-0" />
                <span className="text-muted text-sm">{settings?.email || 'contacto@estheticforlive.com'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Map Section */}
        <div className="mb-12">
          <h3 className="text-secondary font-semibold mb-6 text-center">Encuéntranos</h3>
          <div className="relative rounded-2xl overflow-hidden border border-border shadow-lg">
            <iframe
              src={settings?.maps_embed_url || SOCIAL_MEDIA.location.mapsEmbed}
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Esthetic For Live"
              className="w-full"
            />
            <a
              href={settings?.maps_url || SOCIAL_MEDIA.location.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 bg-accent text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-accent-hover transition-colors shadow-lg flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Abrir en Google Maps
            </a>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-light text-xs">
            © {new Date().getFullYear()} Esthetic For Live. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-muted-light hover:text-accent text-xs transition-colors">Política de Privacidad</a>
            <a href="#" className="text-muted-light hover:text-accent text-xs transition-colors">Términos y Condiciones</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
