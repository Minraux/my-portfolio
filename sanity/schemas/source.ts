import { defineField, defineType } from 'sanity'

export const source = defineType({
  name: 'source',
  title: 'Источник',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Заголовок',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Текст',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        { name: 'title', type: 'string', title: 'Заголовок SEO' },
        { name: 'description', type: 'text', rows: 3, title: 'Описание SEO' },
        { name: 'ogImage', type: 'image', title: 'OG-изображение' },
      ],
    }),
  ],
})
