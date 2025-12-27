import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Configuración del Sitio',
  type: 'document',
  fields: [
    defineField({
      name: 'servicesSection',
      title: 'Sección de Servicios (Home)',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Título',
          type: 'string',
          initialValue: 'Nuestros Servicios',
        },
        {
          name: 'subtitle',
          title: 'Subtítulo',
          type: 'text',
          initialValue: 'Explora nuestra gama completa de tratamientos diseñados para resaltar tu belleza natural.',
        },
      ],
    }),
    defineField({
      name: 'resultsSection',
      title: 'Sección de Resultados (Home)',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Título',
          type: 'string',
          initialValue: 'Resultados Reales',
        },
        {
          name: 'subtitle',
          title: 'Subtítulo',
          type: 'text',
          initialValue: 'Transformaciones que hablan por sí solas',
        },
      ],
    }),
    defineField({
      name: 'whatsappNumber',
      title: 'Número de WhatsApp',
      type: 'string',
      description: 'Formato: +57 313 8800396',
    }),
    defineField({
      name: 'address',
      title: 'Dirección',
      type: 'string',
    }),
    defineField({
      name: 'city',
      title: 'Ciudad',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
    }),
    defineField({
      name: 'mapsUrl',
      title: 'URL de Google Maps',
      type: 'url',
    }),
    defineField({
      name: 'mapsEmbed',
      title: 'URL Embed de Google Maps',
      type: 'url',
      description: 'URL para el iframe del mapa',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Configuración del Sitio',
      }
    },
  },
})
