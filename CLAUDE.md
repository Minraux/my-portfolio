# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- `/contact` — email + соцсети + форма (ContactForm → `/api/contact`)
- `/studio` — Sanity Studio
- `/api/contact` — Resend email handler
- `/api/revalidate` — ISR endpoint (POST, защищён REVALIDATE_SECRET)

## Key Components

- `Header` — фиксированный, pill-навигация с горизонтальным скроллом, прозрачный на главной до скролла
- `Footer` / `ConditionalFooter` — соцсети + копирайт
- `SocialIcon` — SVG иконки: telegram, instagram, youtube
- `ContactForm` — форма (client component, /api/contact)
- `WorksCanvas` / `PublicationsCanvas` — интерактивный канвас (md+)
- `FadeIn` / `PageTransition` — Framer Motion анимации

## Environment Variables

- `NEXT_PUBLIC_SANITY_PROJECT_ID` — ID проекта Sanity (afz3cq75)
- `NEXT_PUBLIC_SANITY_DATASET` — датасет (production)
- `SANITY_API_TOKEN` — токен Sanity API
- `REVALIDATE_SECRET` — секрет для ISR
- `RESEND_API_KEY` — ключ Resend для отправки писем с формы контактов

## Content (Sanity types)

`work`, `post`, `source`, `about`, `settings`.
Settings содержит: `name`, `email`, `heroImage` (фото главной), `heroEnabled`, `socials[]` (label/url/icon), `seo`.

## Breakpoints

- Mobile: < 768px — 1 колонка, горизонтальный скролл навигации
- Tablet: 768–1023px — 2 колонки
- Desktop: ≥ 1024px — полный вид, канвас в works/publications

## Next.js notes

Dynamic route params are a Promise: `params: Promise<{ slug: string }>`, `const { slug } = await params`.
