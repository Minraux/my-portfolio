import { defineField, defineType } from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'Статья',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Заголовок', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: r => r.required() }),
    defineField({ name: 'publishedAt', title: 'Дата публикации', type: 'datetime' }),
    defineField({
      name: 'body',
      title: 'Текст',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
        { type: 'object', name: 'embed', title: 'Embed', fields: [{ name: 'code', type: 'text', title: 'Embed-код' }] },
      ],
    }),
    defineField({ name: 'tags', title: 'Теги', type: 'array', of: [{ type: 'string' }] }),
  ],
  preview: { select: { title: 'title', subtitle: 'publishedAt' } },
})
