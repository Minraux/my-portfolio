import { defineField, defineType } from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'Публикация',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Заголовок', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', title: 'Слаг (URL)', type: 'slug', options: { source: 'title' }, validation: r => r.required() }),
    defineField({ name: 'publishedAt', title: 'Дата публикации', type: 'datetime' }),
    defineField({
      name: 'body',
      title: 'Текст',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
        { type: 'object', name: 'embed', title: 'Встраиваемый блок', fields: [{ name: 'code', type: 'text', title: 'Код для вставки' }] },
      ],
    }),
    defineField({ name: 'tags', title: 'Теги', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'excerpt', title: 'Лид (до 150 символов)', type: 'text', rows: 2 }),
    defineField({ name: 'coverImage', title: 'Обложка', type: 'image', options: { hotspot: true } }),
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
  preview: { select: { title: 'title', subtitle: 'publishedAt' } },
})
