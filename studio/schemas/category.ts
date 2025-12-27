import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'category',
  title: 'Categoría de Servicios',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'text',
    }),
    defineField({
      name: 'faIcon',
      title: 'Icono Font Awesome',
      type: 'string',
      description: 'Ej: fa-solid fa-spa',
      initialValue: 'fa-solid fa-spa',
    }),
    defineField({
      name: 'image',
      title: 'Imagen de Categoría',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'order',
      title: 'Orden',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
  },
})
