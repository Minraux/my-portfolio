import { defineField, defineType } from 'sanity'

export const about = defineType({
  name: 'about',
  title: 'О себе',
  type: 'document',
  fields: [
    defineField({ name: 'bio', title: 'Биография', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'photo', title: 'Фото', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'cv', title: 'CV (PDF)', type: 'file' }),
  ],
})
