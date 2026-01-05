'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import type { Service } from '@/types/database.types'

interface ServiceCardProps {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="group bg-white rounded-2xl border border-border hover:border-accent/30 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden bg-accent-light relative">
        {service.image_url ? (
          <Image
            src={service.image_url}
            alt={service.name}
            width={600}
            height={450}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className={`${service.fa_icon} text-5xl text-accent/40`} />
          </div>
        )}

        {/* Price Badge */}
        {service.price && (
          <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-medium">
            {formatPrice(service.price)}
            {service.price_note && <span className="text-xs ml-1">/{service.price_note}</span>}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="bg-accent-light w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-white transition-colors text-accent">
            <i className={`${service.fa_icon} text-xl`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-secondary group-hover:text-accent transition-colors">
              {service.name}
            </h3>
            {service.duration_minutes && (
              <span className="text-xs text-muted">
                {service.duration_minutes} min aprox.
              </span>
            )}
          </div>
        </div>

        <p className="text-muted text-sm mb-6 line-clamp-3">
          {service.short_description || service.description}
        </p>

        <div className="flex gap-3">
          <Link href={`/reservar/${service.id}`} className="flex-1">
            <Button className="w-full" size="sm">
              Agendar Cita
            </Button>
          </Link>
          <Link href={`/servicios/${service.slug}`}>
            <Button variant="outline" size="sm">
              Ver más
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
