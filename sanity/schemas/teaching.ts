import { defineField, defineType } from 'sanity'

export const teaching = defineType({
  name: 'teaching',
  title: 'Педагогика',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Название', type: 'string', validation: r => r.required() }),
    defineField({ name: 'description', title: 'Описание', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'dates', title: 'Даты', type: 'string' }),
    defineField({ name: 'location', title: 'Место', type: 'string' }),
    defineField({ name: 'images', title: 'Изображения', type: 'array', of: [{ type: 'image', options: { hotspot: true } }] }),
  ],
})
