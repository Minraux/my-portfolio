import { defineField, defineType } from 'sanity'

export const settings = defineType({
  name: 'settings',
  title: 'Настройки',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Имя', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({
      name: 'seo',
      title: 'SEO по умолчанию',
      type: 'object',
      fields: [
        { name: 'title', type: 'string', title: 'Заголовок (до 60 симв.)' },
        { name: 'description', type: 'text', title: 'Описание (до 160 симв.)', rows: 3 },
        { name: 'ogImage', type: 'image', title: 'OG-изображение (1200×630px)' },
      ],
    }),
    defineField({
      name: 'heroImage',
      title: 'Фото на главной',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'heroEnabled',
      title: 'Показывать фото',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'socials',
      title: 'Соцсети и ссылки',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'label', type: 'string', title: 'Название' },
          { name: 'url', type: 'url', title: 'Ссылка' },
          {
            name: 'icon',
            type: 'string',
            title: 'Иконка',
            options: { list: ['telegram', 'instagram', 'youtube', 'bandcamp'] },
          },
        ],
      }],
    }),
  ],
})
