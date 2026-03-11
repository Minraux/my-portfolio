# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Behaviour Rules

- **Не пиши приветствия** — переходи сразу к делу
- **Всегда используй diff** — когда редактируешь, показывай только изменённые строки
- **Не повторяй неизменённый код** — при выводе изменений опускай строки, которые не трогал
- **Язык: русский** — все ответы на русском

## Commands

- `npm run dev` — локальный сервер (Next.js + Sanity Studio по адресу /studio)
- `npm run build` — сборка продакшн
- `npm run lint` — линтер

## Architecture

Next.js 16 App Router. Публичный сайт в `app/(site)/`, Sanity Studio в `app/studio/[[...tool]]/`.
Контент: Sanity v3, запросы на GROQ в `sanity/lib/queries.ts`, схемы в `sanity/schemas/`.
Стили: Tailwind CSS v4 (`@import "tailwindcss"`) + CSS-классы в `app/globals.css` (nav-pill, detail-grid, about-grid и др.)
Шрифты: Onest (`--font-sans`) + Cormorant (`--font-serif`), оба с кириллицей, `next/font/google`.

## Pages

- `/` — главная: hero с фото (фиксированный фон) + список работ + публикации
- `/works` — список работ (канвас на md+, список на mobile), `/works/[slug]` — детальная
- `/publications` — публикации (список + канвас), `/publications/[slug]` — статья
- `/source` — раздел «Источник» (манифест о бережном образовании)
- `/about` — биография + фото + CV PDF
- `/contact` — email + соцсети (без формы)
- `/studio` — Sanity Studio
- `/api/contact` — Resend email handler
- `/api/revalidate` — ISR endpoint (POST, защищён REVALIDATE_SECRET)

## Key Components

- `Header` — фиксированный, pill-навигация с горизонтальным скроллом, прозрачный на главной до скролла
- `Footer` / `ConditionalFooter` — соцсети + копирайт
- `SocialIcon` — SVG иконки: telegram, instagram, youtube
- `ContactForm` — форма (client component, не используется на /contact)
- `WorksCanvas` / `PublicationsCanvas` — интерактивный канвас (desktop ≥768px): pill-элементы с позиционированием из Sanity (canvasTop/canvasLeft, %), превью-картинка по ховеру (направление зависит от позиции)
  - ✅ **Важно:** контейнер имеет `overflow: hidden` — пилюли не создают скроллбар
- `FadeIn` / `PageTransition` — Framer Motion анимации

## Environment Variables

- `NEXT_PUBLIC_SANITY_PROJECT_ID` — ID проекта Sanity (afz3cq75)
- `NEXT_PUBLIC_SANITY_DATASET` — датасет (production)
- `SANITY_API_TOKEN` — токен Sanity API
- `REVALIDATE_SECRET` — секрет для ISR
- `RESEND_API_KEY` — не нужен (форма заменена на email-ссылку)

## Content (Sanity types)

`work`, `post`, `source`, `about`, `settings`.
- `work`: title, slug, type, mediaType, year, location, images, body, featured, **hidden**, canvasTop, canvasLeft, seo
- `post`: title, slug, publishedAt, body, tags, excerpt, coverImage, **hidden**, canvasTop, canvasLeft, seo
- `settings`: name, email, heroImage, heroEnabled, socials[](label/url/icon: telegram/instagram/youtube), seo
- Canvas позиционирование: поля `canvasTop`/`canvasLeft` (%, строка) — задают позицию пилюли на холсте. Пустые = авторасстановка.

## Breakpoints

- Mobile: < 768px — 1 колонка, горизонтальный скролл навигации
- Tablet: 768–1023px — 2 колонки
- Desktop: ≥ 1024px — полный вид, канвас в works/publications

## Recent UI Fixes (Mar 11 2026)

- **Canvas overflow** — добавлен `overflow: hidden` на `WorksCanvas` и `PublicationsCanvas` контейнеры (`.works-canvas-wrap` / в PublicationsCanvas.tsx) чтобы пилюли не создавали горизонтальный скроллбар
- **About page links** — `.about-bio a` теперь белые по умолчанию, зелёные только по hover (было наоборот, нужно было совпадать с другими ссылками на сайте)
- **OG metadata** — добавлены `openGraph.title` (без суффикса «— Влад Добровольский»), `openGraph.description`, `openGraph.images` в `layout.tsx` (дефолт) и page components (works/[slug], publications/[slug])
- **Favicons** — добавлены в `public/`: favicon.ico, favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png, android-chrome-192x192.png, android-chrome-512x512.png, site.webmanifest. Метаданные в `layout.tsx` metadata object

## Performance & Optimizations (March 2026)

### ISR Caching
- `sanity/lib/queries.ts`: All `client.fetch()` calls include `{ next: { revalidate: 3600 } }` (1 hour cache)
- `getSettings()` wrapped in `cache()` to deduplicate requests during rendering
- Result: ~80% reduction in Sanity API calls

### Vercel Configuration
- `vercel.json`: Region set to `fra1` (Frankfurt, closer to Russia)
- `next.config.ts`: Image formats configured for AVIF/WebP (future optimization)

### Image URL Generation
- `sanity/lib/image.ts`: Singleton pattern for `createImageUrlBuilder`
- `.auto('format')` appended to URLs for automatic format optimization
- `imageUrl()` helper function for quick optimized URL generation

## Next.js notes

Dynamic route params are a Promise: `params: Promise<{ slug: string }>`, `const { slug } = await params`.
