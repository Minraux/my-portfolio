import { defineField, defineType } from 'sanity'

export const settings = defineType({
  name: 'settings',
  title: 'Настройки',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Имя', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({
      name: 'heroImage',
      title: 'Фото на главной',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'socials',
      title: 'Соцсети',
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
            options: { list: ['telegram', 'instagram', 'youtube'] },
          },
        ],
      }],
    }),
  ],
})
