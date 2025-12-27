import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'service',
  title: 'Servicio',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'string',
      options: {
        list: [
          { title: 'Faciales', value: 'FACIALES' },
          { title: 'Plasma y Bioestimulantes', value: 'TRATAMIENTOS CON PLASMA Y BIOESTIMULANTES' },
          { title: 'Neuromoduladores y Rellenos', value: 'NEUROMODULADORES Y RELLENOS' },
          { title: 'Masajes y Relajación', value: 'MASAJES Y RELAJACION' },
          { title: 'Corporales', value: 'CORPORALES REDUCTORES Y ANTICELULITICOS' },
          { title: 'Especiales', value: 'TRATAMIENTOS ESPECIALES' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'faIcon',
      title: 'Icono Font Awesome',
      type: 'string',
      description: 'Clase del icono. Ej: fa-solid fa-spa, fa-solid fa-syringe',
      initialValue: 'fa-solid fa-spa',
    }),
    defineField({
      name: 'image',
      title: 'Imagen',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'order',
      title: 'Orden',
      type: 'number',
      description: 'Número para ordenar los servicios (menor = primero)',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      media: 'image',
    },
  },
})
