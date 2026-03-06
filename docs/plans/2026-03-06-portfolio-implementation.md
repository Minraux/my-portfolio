# Portfolio Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Собрать персональный сайт-портфолио звукового художника и педагога на Next.js 15 + Sanity v3, с деплоем на Vercel.

**Architecture:** Next.js App Router с группой роутов `(site)` для публичного сайта и `/studio/[[...tool]]` для Sanity Studio. Контент управляется через Sanity CMS, страницы генерируются статически с ISR-ревалидацией по webhook. Анимации реализованы через Framer Motion.

**Tech Stack:** Next.js 15, Sanity v3, Tailwind CSS v4, Framer Motion, TypeScript, Vercel.

---

## Task 1: Scaffolding проекта

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json` (авто)
- Create: `sanity.config.ts`
- Create: `app/studio/[[...tool]]/page.tsx`

**Step 1: Создать Next.js проект с Sanity**

```bash
cd ~/Documents/my-portfolio
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias="@/*"
```

Ответить на вопросы:
- ESLint: Yes
- src/ directory: No
- Turbopack: Yes

**Step 2: Установить зависимости**

```bash
npm install next-sanity @sanity/image-url @sanity/vision
npm install framer-motion
npm install @portabletext/react
```

**Step 3: Создать Sanity проект**

```bash
npx sanity@latest init --env
```

- Выбрать "Create new project"
- Название: `my-portfolio`
- Dataset: `production`
- Это создаст `.env.local` с `NEXT_PUBLIC_SANITY_PROJECT_ID` и `NEXT_PUBLIC_SANITY_DATASET`

**Step 4: Создать `sanity.config.ts` в корне**

```ts
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'

export default defineConfig({
  name: 'default',
  title: 'Portfolio',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
})
```

**Step 5: Создать `app/studio/[[...tool]]/page.tsx`**

```tsx
'use client'
import { NextStudio } from 'next-sanity/studio'
import config from '../../../sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
```

**Step 6: Запустить и проверить**

```bash
npm run dev
```

Открыть `http://localhost:3000/studio` — должна появиться Sanity Studio.

**Step 7: Commit**

```bash
git add .
git commit -m "feat: scaffold Next.js + Sanity project"
```

---

## Task 2: Sanity схемы контента

**Files:**
- Create: `sanity/schemas/index.ts`
- Create: `sanity/schemas/work.ts`
- Create: `sanity/schemas/post.ts`
- Create: `sanity/schemas/about.ts`
- Create: `sanity/schemas/teaching.ts`
- Create: `sanity/schemas/settings.ts`

**Step 1: Создать `sanity/schemas/work.ts`**

```ts
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
```

**Step 2: Создать `sanity/schemas/post.ts`**

```ts
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
```

**Step 3: Создать `sanity/schemas/about.ts`**

```ts
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
```

**Step 4: Создать `sanity/schemas/teaching.ts`**

```ts
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
```

**Step 5: Создать `sanity/schemas/settings.ts`**

```ts
import { defineField, defineType } from 'sanity'

export const settings = defineType({
  name: 'settings',
  title: 'Настройки',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Имя', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'socials', title: 'Соцсети', type: 'array', of: [
      { type: 'object', fields: [
        { name: 'label', type: 'string', title: 'Название' },
        { name: 'url', type: 'url', title: 'Ссылка' },
      ]}
    ]}),
  ],
})
```

**Step 6: Создать `sanity/schemas/index.ts`**

```ts
import { work } from './work'
import { post } from './post'
import { about } from './about'
import { teaching } from './teaching'
import { settings } from './settings'

export const schemaTypes = [work, post, about, teaching, settings]
```

**Step 7: Проверить**

Открыть `http://localhost:3000/studio` — в левой панели должны появиться все типы документов.

**Step 8: Commit**

```bash
git add sanity/
git commit -m "feat: add Sanity content schemas"
```

---

## Task 3: Sanity клиент и GROQ запросы

**Files:**
- Create: `sanity/lib/client.ts`
- Create: `sanity/lib/image.ts`
- Create: `sanity/lib/queries.ts`

**Step 1: Создать `sanity/lib/client.ts`**

```ts
import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: true,
})
```

**Step 2: Создать `sanity/lib/image.ts`**

```ts
import createImageUrlBuilder from '@sanity/image-url'
import { client } from './client'

const builder = createImageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}
```

**Step 3: Создать `sanity/lib/queries.ts`**

```ts
import { client } from './client'

export async function getFeaturedWorks() {
  return client.fetch(`*[_type == "work" && featured == true] | order(_createdAt desc) {
    _id, title, slug, type, description, year, "image": images[0]
  }`)
}

export async function getAllWorks() {
  return client.fetch(`*[_type == "work"] | order(year desc) {
    _id, title, slug, type, description, year, location, "image": images[0]
  }`)
}

export async function getWork(slug: string) {
  return client.fetch(`*[_type == "work" && slug.current == $slug][0] {
    _id, title, slug, type, description, year, location,
    mediaType, mediaUrl, embedCode, "mediaFile": mediaFile.asset->url,
    images[] { ..., "url": asset->url }
  }`, { slug })
}

export async function getAllPosts() {
  return client.fetch(`*[_type == "post"] | order(publishedAt desc) {
    _id, title, slug, publishedAt, tags
  }`)
}

export async function getPost(slug: string) {
  return client.fetch(`*[_type == "post" && slug.current == $slug][0] {
    _id, title, slug, publishedAt, tags, body[] {
      ...,
      _type == "image" => { ..., "url": asset->url }
    }
  }`, { slug })
}

export async function getAbout() {
  return client.fetch(`*[_type == "about"][0] {
    bio, "photo": photo { ..., "url": asset->url }, "cv": cv.asset->url
  }`)
}

export async function getAllTeaching() {
  return client.fetch(`*[_type == "teaching"] | order(_createdAt desc) {
    _id, title, description, dates, location, "images": images[] { ..., "url": asset->url }
  }`)
}

export async function getSettings() {
  return client.fetch(`*[_type == "settings"][0] { name, email, socials }`)
}
```

**Step 4: Commit**

```bash
git add sanity/lib/
git commit -m "feat: add Sanity client and GROQ queries"
```

---

## Task 4: Глобальные стили, шрифты и Tailwind

**Files:**
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`
- Modify: `app/layout.tsx`

**Step 1: Обновить `app/layout.tsx` — подключить шрифты**

```tsx
import type { Metadata } from 'next'
import { Onest, Cormorant } from 'next/font/google'
import './globals.css'

const onest = Onest({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-onest',
  display: 'swap',
})

const cormorant = Cormorant({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Звуковой художник и педагог',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${onest.variable} ${cormorant.variable}`}>
      <body className="bg-zinc-950 text-white">{children}</body>
    </html>
  )
}
```

**Step 2: Обновить `app/globals.css`**

```css
@import "tailwindcss";

@theme {
  --font-sans: var(--font-onest);
  --font-serif: var(--font-cormorant);
  --color-accent: oklch(85% 0.25 95);   /* кислотный жёлтый — можно менять */
  --color-bg: oklch(10% 0 0);
}

body {
  background-color: var(--color-bg);
  font-family: var(--font-sans);
}
```

**Step 3: Проверить**

```bash
npm run dev
```

Открыть `http://localhost:3000` — фон должен быть тёмным, шрифт Onest.

**Step 4: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "feat: add Onest + Cormorant fonts and global styles"
```

---

## Task 5: Layout — шапка и подвал

**Files:**
- Create: `components/Header.tsx`
- Create: `components/Footer.tsx`
- Create: `app/(site)/layout.tsx`

**Step 1: Создать `components/Header.tsx`**

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/works', label: 'Работы' },
  { href: '/about', label: 'О себе' },
  { href: '/teaching', label: 'Педагогика' },
  { href: '/blog', label: 'Блог' },
]

export default function Header({ name }: { name: string }) {
  const pathname = usePathname()
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 mix-blend-difference">
      <Link href="/" className="font-sans text-sm uppercase tracking-widest text-white">
        {name}
      </Link>
      <nav className="flex gap-6">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`font-sans text-sm uppercase tracking-widest transition-opacity duration-300 ${
              pathname === link.href ? 'opacity-100' : 'opacity-50 hover:opacity-100'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
```

**Step 2: Создать `components/Footer.tsx`**

```tsx
export default function Footer({ name, socials }: { name: string; socials: { label: string; url: string }[] }) {
  return (
    <footer className="border-t border-white/10 px-6 py-8 flex items-center justify-between">
      <span className="font-sans text-sm text-white/40">{name} © {new Date().getFullYear()}</span>
      <div className="flex gap-4">
        {socials?.map(s => (
          <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer"
            className="font-sans text-sm text-white/40 hover:text-white transition-colors duration-300">
            {s.label}
          </a>
        ))}
      </div>
    </footer>
  )
}
```

**Step 3: Создать `app/(site)/layout.tsx`**

```tsx
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getSettings } from '@/sanity/lib/queries'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()
  return (
    <>
      <Header name={settings?.name ?? 'Portfolio'} />
      <main className="min-h-screen pt-16">{children}</main>
      <Footer name={settings?.name ?? ''} socials={settings?.socials ?? []} />
    </>
  )
}
```

**Step 4: Переместить главную страницу в группу роутов**

```bash
mkdir -p app/\(site\)
mv app/page.tsx app/\(site\)/page.tsx
```

**Step 5: Проверить**

Открыть `http://localhost:3000` — должна появиться шапка с навигацией и подвал.

**Step 6: Commit**

```bash
git add components/ app/\(site\)/
git commit -m "feat: add site layout with header and footer"
```

---

## Task 6: Анимации — базовые компоненты

**Files:**
- Create: `components/FadeIn.tsx`
- Create: `components/PageTransition.tsx`

**Step 1: Создать `components/FadeIn.tsx`**

```tsx
'use client'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export default function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

**Step 2: Создать `components/PageTransition.tsx`**

```tsx
'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

**Step 3: Добавить `PageTransition` в `app/(site)/layout.tsx`**

```tsx
// Обернуть <main> в PageTransition:
import PageTransition from '@/components/PageTransition'

// ...
<main className="min-h-screen pt-16">
  <PageTransition>{children}</PageTransition>
</main>
```

**Step 4: Commit**

```bash
git add components/FadeIn.tsx components/PageTransition.tsx app/\(site\)/layout.tsx
git commit -m "feat: add FadeIn and PageTransition animation components"
```

---

## Task 7: Главная страница

**Files:**
- Modify: `app/(site)/page.tsx`
- Create: `components/WorkCard.tsx`

**Step 1: Создать `components/WorkCard.tsx`**

```tsx
'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { urlFor } from '@/sanity/lib/image'

type Work = {
  _id: string
  title: string
  slug: { current: string }
  type: string
  year: number
  image?: any
}

export default function WorkCard({ work }: { work: Work }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/works/${work.slug.current}`} className="group block">
        <div className="overflow-hidden bg-white/5 aspect-video mb-3">
          {work.image && (
            <motion.img
              src={urlFor(work.image).width(800).url()}
              alt={work.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </div>
        <div className="flex items-baseline justify-between">
          <h3 className="font-sans text-lg group-hover:text-accent transition-colors duration-300">
            {work.title}
          </h3>
          <span className="font-sans text-sm text-white/40">{work.year}</span>
        </div>
        <p className="font-sans text-sm text-white/40 mt-1 uppercase tracking-wider">{work.type}</p>
      </Link>
    </motion.div>
  )
}
```

**Step 2: Обновить `app/(site)/page.tsx`**

```tsx
import FadeIn from '@/components/FadeIn'
import WorkCard from '@/components/WorkCard'
import { getFeaturedWorks, getSettings } from '@/sanity/lib/queries'

export default async function HomePage() {
  const [works, settings] = await Promise.all([getFeaturedWorks(), getSettings()])

  return (
    <div className="px-6">
      {/* Hero */}
      <section className="min-h-[80vh] flex flex-col justify-end pb-16">
        <FadeIn>
          <h1 className="font-sans text-[clamp(3rem,10vw,10rem)] leading-none font-bold uppercase">
            {settings?.name ?? 'Имя'}
          </h1>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="font-serif text-[clamp(1.2rem,3vw,2rem)] text-white/60 mt-4 italic">
            Звуковой художник и педагог
          </p>
        </FadeIn>
      </section>

      {/* Избранные работы */}
      {works.length > 0 && (
        <section className="py-24">
          <FadeIn>
            <h2 className="font-sans text-sm uppercase tracking-widest text-white/40 mb-12">
              Избранные работы
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {works.map((work: any, i: number) => (
              <FadeIn key={work._id} delay={i * 0.1}>
                <WorkCard work={work} />
              </FadeIn>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
```

**Step 3: Проверить**

Добавить одну работу в Sanity Studio с флагом "Показать на главной", затем открыть `http://localhost:3000`.

**Step 4: Commit**

```bash
git add app/\(site\)/page.tsx components/WorkCard.tsx
git commit -m "feat: add home page with hero and featured works"
```

---

## Task 8: Страница всех работ

**Files:**
- Create: `app/(site)/works/page.tsx`
- Create: `app/(site)/works/[slug]/page.tsx`

**Step 1: Создать `app/(site)/works/page.tsx`**

```tsx
import FadeIn from '@/components/FadeIn'
import WorkCard from '@/components/WorkCard'
import { getAllWorks } from '@/sanity/lib/queries'

export default async function WorksPage() {
  const works = await getAllWorks()

  return (
    <div className="px-6 py-24">
      <FadeIn>
        <h1 className="font-sans text-[clamp(2rem,6vw,6rem)] font-bold uppercase mb-16">
          Работы
        </h1>
      </FadeIn>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {works.map((work: any, i: number) => (
          <FadeIn key={work._id} delay={i * 0.05}>
            <WorkCard work={work} />
          </FadeIn>
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Создать `app/(site)/works/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import FadeIn from '@/components/FadeIn'
import { getWork, getAllWorks } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'

export async function generateStaticParams() {
  const works = await getAllWorks()
  return works.map((w: any) => ({ slug: w.slug.current }))
}

export default async function WorkPage({ params }: { params: { slug: string } }) {
  const work = await getWork(params.slug)
  if (!work) notFound()

  return (
    <div className="px-6 py-24 max-w-4xl mx-auto">
      <FadeIn>
        <p className="font-sans text-sm uppercase tracking-widest text-white/40 mb-4">
          {work.type} {work.year && `— ${work.year}`} {work.location && `— ${work.location}`}
        </p>
        <h1 className="font-sans text-[clamp(2rem,5vw,5rem)] font-bold uppercase mb-8">
          {work.title}
        </h1>
      </FadeIn>

      {/* Медиа */}
      <FadeIn delay={0.1}>
        {work.mediaType === 'embed' && work.embedCode && (
          <div className="mb-8" dangerouslySetInnerHTML={{ __html: work.embedCode }} />
        )}
        {work.mediaType === 'link' && work.mediaUrl && (
          <a href={work.mediaUrl} target="_blank" rel="noopener noreferrer"
            className="inline-block font-sans text-sm border border-white/20 px-4 py-2 hover:border-white transition-colors duration-300 mb-8">
            Открыть ↗
          </a>
        )}
        {work.mediaType === 'file' && work.mediaFile && (
          <audio controls src={work.mediaFile} className="w-full mb-8" />
        )}
      </FadeIn>

      {work.description && (
        <FadeIn delay={0.15}>
          <p className="font-serif text-xl text-white/80 italic mb-12">{work.description}</p>
        </FadeIn>
      )}

      {/* Галерея */}
      {work.images?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {work.images.map((img: any, i: number) => (
            <FadeIn key={i} delay={i * 0.05}>
              <img src={urlFor(img).width(1200).url()} alt="" className="w-full" />
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add app/\(site\)/works/
git commit -m "feat: add works list and work detail pages"
```

---

## Task 9: Страница «О себе»

**Files:**
- Create: `app/(site)/about/page.tsx`

**Step 1: Создать `app/(site)/about/page.tsx`**

```tsx
import { PortableText } from '@portabletext/react'
import FadeIn from '@/components/FadeIn'
import { getAbout } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'

export default async function AboutPage() {
  const about = await getAbout()

  return (
    <div className="px-6 py-24 max-w-3xl mx-auto">
      <FadeIn>
        <h1 className="font-sans text-[clamp(2rem,6vw,6rem)] font-bold uppercase mb-16">
          О себе
        </h1>
      </FadeIn>

      {about?.photo && (
        <FadeIn delay={0.05}>
          <img
            src={urlFor(about.photo).width(800).url()}
            alt="Фото"
            className="w-full max-w-sm mb-12"
          />
        </FadeIn>
      )}

      {about?.bio && (
        <FadeIn delay={0.1}>
          <div className="font-serif text-xl text-white/80 leading-relaxed prose-invert [&_p]:mb-4">
            <PortableText value={about.bio} />
          </div>
        </FadeIn>
      )}

      {about?.cv && (
        <FadeIn delay={0.15}>
          <a
            href={about.cv}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-12 font-sans text-sm border border-white/20 px-6 py-3 hover:border-white transition-colors duration-300"
          >
            Скачать CV ↓
          </a>
        </FadeIn>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/\(site\)/about/
git commit -m "feat: add about page"
```

---

## Task 10: Страница «Педагогика»

**Files:**
- Create: `app/(site)/teaching/page.tsx`

**Step 1: Создать `app/(site)/teaching/page.tsx`**

```tsx
import { PortableText } from '@portabletext/react'
import FadeIn from '@/components/FadeIn'
import { getAllTeaching } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'

export default async function TeachingPage() {
  const items = await getAllTeaching()

  return (
    <div className="px-6 py-24">
      <FadeIn>
        <h1 className="font-sans text-[clamp(2rem,6vw,6rem)] font-bold uppercase mb-16">
          Педагогика
        </h1>
      </FadeIn>

      <div className="space-y-24">
        {items.map((item: any, i: number) => (
          <FadeIn key={item._id} delay={i * 0.05}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/10 pt-8">
              <div>
                <h2 className="font-sans text-2xl font-bold mb-2">{item.title}</h2>
                {item.dates && <p className="font-sans text-sm text-white/40 mb-1">{item.dates}</p>}
                {item.location && <p className="font-sans text-sm text-white/40 mb-4">{item.location}</p>}
                {item.description && (
                  <div className="font-serif text-lg text-white/70 [&_p]:mb-3">
                    <PortableText value={item.description} />
                  </div>
                )}
              </div>
              {item.images?.[0] && (
                <img
                  src={urlFor(item.images[0]).width(800).url()}
                  alt={item.title}
                  className="w-full object-cover"
                />
              )}
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/\(site\)/teaching/
git commit -m "feat: add teaching page"
```

---

## Task 11: Блог

**Files:**
- Create: `app/(site)/blog/page.tsx`
- Create: `app/(site)/blog/[slug]/page.tsx`

**Step 1: Создать `app/(site)/blog/page.tsx`**

```tsx
import Link from 'next/link'
import FadeIn from '@/components/FadeIn'
import { getAllPosts } from '@/sanity/lib/queries'

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="px-6 py-24 max-w-3xl mx-auto">
      <FadeIn>
        <h1 className="font-sans text-[clamp(2rem,6vw,6rem)] font-bold uppercase mb-16">Блог</h1>
      </FadeIn>
      <ul className="space-y-0 divide-y divide-white/10">
        {posts.map((post: any, i: number) => (
          <FadeIn key={post._id} delay={i * 0.04}>
            <li>
              <Link href={`/blog/${post.slug.current}`}
                className="group flex items-baseline justify-between py-6 hover:text-accent transition-colors duration-300">
                <span className="font-sans text-xl font-medium">{post.title}</span>
                <span className="font-sans text-sm text-white/40 ml-4 shrink-0">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('ru-RU') : ''}
                </span>
              </Link>
            </li>
          </FadeIn>
        ))}
      </ul>
    </div>
  )
}
```

**Step 2: Создать `app/(site)/blog/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import FadeIn from '@/components/FadeIn'
import { getPost, getAllPosts } from '@/sanity/lib/queries'

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((p: any) => ({ slug: p.slug.current }))
}

const components = {
  types: {
    image: ({ value }: any) => (
      <img src={value.url} alt="" className="w-full my-8" />
    ),
    embed: ({ value }: any) => (
      <div className="my-8" dangerouslySetInnerHTML={{ __html: value.code }} />
    ),
  },
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  return (
    <article className="px-6 py-24 max-w-2xl mx-auto">
      <FadeIn>
        {post.publishedAt && (
          <p className="font-sans text-sm text-white/40 mb-4">
            {new Date(post.publishedAt).toLocaleDateString('ru-RU')}
          </p>
        )}
        <h1 className="font-sans text-[clamp(2rem,5vw,4rem)] font-bold uppercase mb-12">
          {post.title}
        </h1>
      </FadeIn>
      <FadeIn delay={0.1}>
        <div className="font-serif text-xl text-white/80 leading-relaxed [&_p]:mb-6 [&_h2]:font-sans [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-12 [&_h2]:mb-4">
          <PortableText value={post.body} components={components} />
        </div>
      </FadeIn>
      {post.tags?.length > 0 && (
        <FadeIn delay={0.15}>
          <div className="flex gap-2 mt-12">
            {post.tags.map((tag: string) => (
              <span key={tag} className="font-sans text-xs border border-white/20 px-3 py-1 text-white/40">
                {tag}
              </span>
            ))}
          </div>
        </FadeIn>
      )}
    </article>
  )
}
```

**Step 3: Commit**

```bash
git add app/\(site\)/blog/
git commit -m "feat: add blog list and post pages"
```

---

## Task 12: ISR и Sanity webhook

**Files:**
- Modify: `sanity/lib/client.ts`
- Create: `app/api/revalidate/route.ts`

**Step 1: Обновить `sanity/lib/client.ts` для ISR**

```ts
import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
})
```

**Step 2: Создать `app/api/revalidate/route.ts`**

```ts
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }
  revalidatePath('/', 'layout')
  return NextResponse.json({ revalidated: true })
}
```

**Step 3: Добавить `REVALIDATE_SECRET` в `.env.local`**

```
REVALIDATE_SECRET=придумайте-случайную-строку
```

**Step 4: После деплоя на Vercel** — настроить webhook в Sanity:
- Sanity Dashboard → API → Webhooks → Add webhook
- URL: `https://ваш-домен.vercel.app/api/revalidate?secret=ваш-secret`
- Trigger on: create, update, delete

**Step 5: Commit**

```bash
git add app/api/ sanity/lib/client.ts
git commit -m "feat: add ISR revalidation endpoint"
```

---

## Task 13: Деплой на Vercel

**Step 1: Создать репозиторий на GitHub**

```bash
gh repo create my-portfolio --public --source=. --remote=origin --push
```

**Step 2: Подключить к Vercel**

- Зайти на vercel.com → New Project → Import Git Repository
- Выбрать `my-portfolio`

**Step 3: Добавить переменные окружения в Vercel**

В настройках проекта → Environment Variables:
```
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET
SANITY_API_TOKEN
REVALIDATE_SECRET
```

**Step 4: Добавить домен Vercel в CORS настройки Sanity**

- Sanity Dashboard → API → CORS Origins
- Добавить `https://ваш-домен.vercel.app`

**Step 5: Проверить деплой**

Открыть `https://ваш-домен.vercel.app` — сайт должен работать.
Открыть `/studio` — Sanity Studio должна работать.

---

## Task 14: Обновить CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Обновить `CLAUDE.md`**

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — локальный сервер (Next.js + Sanity Studio)
- `npm run build` — сборка продакшн
- `npm run lint` — линтер

## Architecture

Next.js 15 App Router. Публичный сайт в `app/(site)/`, Sanity Studio в `app/studio/[[...tool]]/`.
Контент: Sanity v3, запросы на GROQ в `sanity/lib/queries.ts`, схемы в `sanity/schemas/`.
Анимации: Framer Motion — `FadeIn` (scroll) и `PageTransition` (смена страниц) в `components/`.
Шрифты: Onest (заголовки) + Cormorant (текст), оба с кириллицей, подключены через `next/font/google`.

## Environment Variables

- `NEXT_PUBLIC_SANITY_PROJECT_ID` — ID проекта Sanity
- `NEXT_PUBLIC_SANITY_DATASET` — датасет (production)
- `SANITY_API_TOKEN` — токен Sanity API
- `REVALIDATE_SECRET` — секрет для ISR webhook

## Content

Типы в Sanity: `work`, `post`, `about`, `teaching`, `settings`.
ISR-ревалидация через `POST /api/revalidate?secret=...` (настраивается как webhook в Sanity Dashboard).
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with full project documentation"
```
