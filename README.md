# Портфолио Влада Добровольского

Личный портфель звукохудожника, композитора и педагога.

**Сайт:** https://dobrovolski.space/
**Альтернативный URL:** https://my-portfolio-eight-inky-26.vercel.app/
**GitHub:** https://github.com/Minraux/my-portfolio

## Стек

- **Next.js 16** — App Router, TypeScript
- **Sanity v3** — CMS для контента (ID: `afz3cq75`)
- **Tailwind CSS v4** + Custom CSS классы
- **Framer Motion** — анимации
- **Vercel** — хостинг (регион: Frankfurt `fra1`)

## Разработка

```bash
npm run dev          # dev сервер на http://localhost:3000
npm run build        # production сборка
npm run lint         # линтер
```

Sanity Studio доступна на `/studio`.

## Структура

- `app/(site)/` — публичные страницы
- `app/studio/` — Sanity Studio
- `components/` — React компоненты
- `sanity/` — CMS конфигурация (schemas, queries, lib)
- `app/globals.css` — глобальные стили (nav-pill, detail-grid, etc.)

## Проекты

### Andromatic
10-шаговый паттерн-секвенсор (Эркки Куренниеми, 1968).

**URL:** `/andromatic`

- 5 октав (A2–C7), 4 волны (sine, triangle, sawtooth, square)
- Контроллеры: TEMPO, ATTACK, DECAY, FILTER, VOLUME
- Shuffle для рандомизации паттерна
- Осциллограф в реальном времени

📄 [Документация](docs/ANDROMATIC.md)

## Оптимизация (март 2026)

✅ **ISR кэширование** — Sanity запросы кэшируются на 1 час (`revalidate: 3600`)
✅ **Vercel fra1** — серверы во Франкфурте (ближе к РФ)
✅ **React cache()** — дедупликация запросов getSettings
✅ **Singleton pattern** — для URL builder (sanity/lib/image.ts)

Результат: ~80% снижение количества Sanity запросов.

## Переменные окружения

```
NEXT_PUBLIC_SANITY_PROJECT_ID=afz3cq75
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=...
REVALIDATE_SECRET=...
```

## API

- `POST /api/revalidate` — On-Demand ISR (требует REVALIDATE_SECRET)
- `/api/contact` — обработка контактных форм (Resend)
