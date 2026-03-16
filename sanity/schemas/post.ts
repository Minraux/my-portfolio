import { defineField, defineType } from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'Публикация',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Заголовок', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', title: 'Слаг (URL)', type: 'slug', options: { source: 'title' }, validation: r => r.required() }),
    defineField({ name: 'publishedAt', title: 'Дата публикации', type: 'datetime' }),
    defineField({ name: 'excerpt', title: 'Лид (до 150 символов)', type: 'text', rows: 2 }),
    defineField({ name: 'coverImage', title: 'Обложка', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'tags', title: 'Теги', type: 'array', of: [{ type: 'string' }] }),
    defineField({
      name: 'body',
      title: 'Текст',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
        { type: 'object', name: 'embed', title: 'Встраиваемый блок', fields: [{ name: 'code', type: 'text', title: 'Код для вставки' }] },
        { type: 'object', name: 'media', title: 'Аудио/видео файл', fields: [{ name: 'file', type: 'file', title: 'Файл', validation: r => r.required() }, { name: 'mediaType', type: 'string', title: 'Тип', options: { list: [{ title: 'Аудио', value: 'audio' }, { title: 'Видео', value: 'video' }] }, validation: r => r.required() }], preview: { select: { mediaType: 'mediaType', filename: 'file.asset->originalFilename' }, prepare: ({ mediaType, filename }) => ({ title: (mediaType === 'audio' ? '🎵 ' : '🎬 ') + (filename || 'Без названия') }) } },
      ],
    }),
    defineField({ name: 'featured', title: 'Показать на главной', type: 'boolean', initialValue: false }),
    defineField({ name: 'hidden', title: 'Скрыть с сайта', type: 'boolean', initialValue: false }),
    defineField({ name: 'canvasTop', title: 'Позиция на холсте (сверху, %)', type: 'string' }),
    defineField({ name: 'canvasLeft', title: 'Позиция на холсте (слева, %)', type: 'string' }),
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
