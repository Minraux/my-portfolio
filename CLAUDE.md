# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — локальный сервер (Next.js + Sanity Studio по адресу /studio)
- `npm run build` — сборка продакшн
- `npm run lint` — линтер

## Architecture

Next.js 15 App Router. Публичный сайт в `app/(site)/`, Sanity Studio в `app/studio/[[...tool]]/`.
Контент: Sanity v3, запросы на GROQ в `sanity/lib/queries.ts`, схемы в `sanity/schemas/`.
Анимации: Framer Motion — `FadeIn` (scroll, whileInView) и `PageTransition` (смена страниц, AnimatePresence) в `components/`.
Шрифты: Onest (заголовки, --font-sans) + Cormorant (текст, --font-serif), оба с кириллицей, подключены через `next/font/google`.

## Pages

- `/` — главная (hero + избранные работы из Sanity)
- `/works` — все работы, `/works/[slug]` — детальная (embed/link/file медиа)
- `/about` — биография (PortableText) + фото + CV PDF
- `/teaching` — курсы и мастер-классы
- `/blog` — список статей, `/blog/[slug]` — статья (PortableText с embed)
- `/studio` — Sanity Studio (приватно)
- `/api/revalidate` — ISR endpoint (POST, защищён REVALIDATE_SECRET)

## Environment Variables

- `NEXT_PUBLIC_SANITY_PROJECT_ID` — ID проекта Sanity (afz3cq75)
- `NEXT_PUBLIC_SANITY_DATASET` — датасет (production)
- `SANITY_API_TOKEN` — токен Sanity API (для записи, нужен для деплоя)
- `REVALIDATE_SECRET` — секрет для ISR webhook

## Content (Sanity types)

`work`, `post`, `about`, `teaching`, `settings`.
ISR-ревалидация через `POST /api/revalidate?secret=...` — настраивается как webhook в Sanity Dashboard (API → Webhooks).

## Next.js 15 notes

Dynamic route params are a Promise: use `params: Promise<{ slug: string }>` and `const { slug } = await params`.
