# Дизайн портфолио — Звуковой художник и педагог

## Цель

Персональный сайт-портфолио для звукового художника и педагога. Задачи: поиск работы, личный бренд, витрина проектов.

## Стек

- **Next.js 15** (App Router, SSG + ISR)
- **Sanity v3** (CMS + Studio по адресу `/studio`)
- **Tailwind CSS**
- **Framer Motion** (анимации)
- **Vercel** (хостинг)

## Страницы

```
/                  — Главная (hero + избранные работы)
/works             — Все работы
/works/[slug]      — Страница отдельной работы
/about             — Биография + CV
/teaching          — Педагогическая деятельность
/blog              — Список статей
/blog/[slug]       — Отдельная статья
/studio            — Sanity Studio (приватно)
```

## Контент-модель (Sanity)

### Work (Работа)
- `title` — название
- `slug`
- `description` — описание
- `type` — `audio` | `video` | `installation` | `performance`
- `media` — аудиофайл / ссылка (SoundCloud, Bandcamp, Vimeo) / embed-код (iframe)
- `year`, `location`
- `images` — галерея
- `featured` — флаг для главной страницы

### Post (Блог)
- `title`, `slug`, `publishedAt`
- `body` — Portable Text (текст, изображения, аудио, видео, embed-код)
- `tags`

### About
- `bio` — rich text биография
- `photo`
- `cv` — PDF файл

### Teaching (Педагогика)
- `title` — название курса/мастер-класса
- `description`
- `dates`, `location`
- `images`

### Settings
- Имя, контакты, ссылки на соцсети

## Визуальный стиль

**Шрифты (с поддержкой кириллицы, Google Fonts):**
- `Onest` — заголовки, навигация (геометрический гротеск)
- `Cormorant` — длинные тексты, биография, блог (элегантная засечка)

**Цвета:**
- Тёмный фон (почти чёрный) как база
- 1–2 насыщенных акцентных цвета (уточнить на этапе разработки)

**Анимации (Framer Motion) — приоритет:**
- Hover: scale, color, underline на карточках, ссылках, кнопках
- Scroll: fade + slide при входе во viewport, построчно для текста
- Переходы между страницами: мягкий fade

**Сетка:**
- Асимметричная раскладка на главной
- Masonry или нерегулярная сетка для работ

## Структура проекта

```
my-portfolio/
├── app/
│   ├── (site)/
│   │   ├── page.tsx
│   │   ├── works/
│   │   ├── about/
│   │   ├── teaching/
│   │   └── blog/
│   └── studio/[[...tool]]/
├── components/
├── sanity/
│   ├── schemas/
│   └── lib/
└── public/
```

## Деплой

- GitHub → Vercel (автодеплой при пуше)
- Sanity webhook → ISR-обновление при сохранении контента
- `.env.local`:
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - `NEXT_PUBLIC_SANITY_DATASET`
  - `SANITY_API_TOKEN`
