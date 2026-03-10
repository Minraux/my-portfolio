import { defineField, defineType } from 'sanity'

export const work = defineType({
  name: 'work',
  title: 'Работа',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Название', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', title: 'Слаг (URL)', type: 'slug', options: { source: 'title' }, validation: r => r.required() }),
    defineField({
      name: 'type',
      title: 'Тип',
      type: 'string',
      options: {
        list: [
          { title: 'Аудио', value: 'audio' },
          { title: 'Видео', value: 'video' },
          { title: 'Инсталляция', value: 'installation' },
          { title: 'Перформанс', value: 'performance' },
        ],
      },
      validation: r => r.required(),
    }),
    defineField({ name: 'year', title: 'Год', type: 'number' }),
    defineField({ name: 'location', title: 'Место', type: 'string' }),
    defineField({ name: 'images', title: 'Изображения', type: 'array', of: [{ type: 'image', options: { hotspot: true } }] }),
    defineField({
      name: 'mediaType',
      title: 'Тип медиа',
      type: 'string',
      options: {
        list: [
          { title: 'Файл', value: 'file' },
          { title: 'Ссылка', value: 'link' },
          { title: 'Встраиваемый код', value: 'embed' },
        ],
      },
    }),
    defineField({ name: 'mediaFile', title: 'Аудио/видео файл', type: 'file' }),
    defineField({ name: 'mediaUrl', title: 'Ссылка (SoundCloud, Vimeo…)', type: 'url' }),
    defineField({ name: 'embedCode', title: 'Встраиваемый код (iframe)', type: 'text' }),
    defineField({
      name: 'body',
      title: 'Текст статьи',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
        { type: 'object', name: 'embed', title: 'Встраиваемый блок', fields: [{ name: 'code', type: 'text', title: 'Код для вставки' }] },
      ],
    }),
    defineField({ name: 'description', title: 'Описание', type: 'text' }),
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
  preview: { select: { title: 'title', subtitle: 'type', media: 'images.0' } },
})
