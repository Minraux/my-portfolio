import { defineField, defineType } from 'sanity'

export const work = defineType({
  name: 'work',
  title: 'Работа',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Название', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: r => r.required() }),
    defineField({ name: 'description', title: 'Описание', type: 'text' }),
    defineField({
      name: 'type',
      title: 'Тип',
      type: 'string',
      options: { list: ['audio', 'video', 'installation', 'performance'] },
      validation: r => r.required(),
    }),
    defineField({
      name: 'mediaType',
      title: 'Тип медиа',
      type: 'string',
      options: { list: ['file', 'link', 'embed'] },
    }),
    defineField({ name: 'mediaFile', title: 'Аудио/видео файл', type: 'file' }),
    defineField({ name: 'mediaUrl', title: 'Ссылка (SoundCloud, Vimeo…)', type: 'url' }),
    defineField({ name: 'embedCode', title: 'Embed-код (iframe)', type: 'text' }),
    defineField({ name: 'year', title: 'Год', type: 'number' }),
    defineField({ name: 'location', title: 'Место', type: 'string' }),
    defineField({ name: 'images', title: 'Изображения', type: 'array', of: [{ type: 'image', options: { hotspot: true } }] }),
    defineField({ name: 'featured', title: 'Показать на главной', type: 'boolean', initialValue: false }),
  ],
  preview: { select: { title: 'title', subtitle: 'type', media: 'images.0' } },
})
