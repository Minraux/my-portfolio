# Mobile Redesign + Contact Form Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Сделать сайт mobile-first: три чётких брейкпоинта (Mobile/Tablet/Desktop), адаптивный хедер с бургером, герой с фото на весь экран, корректная типографика, минималистичные иконки соцсетей, форма обратной связи через Resend, переименование раздела «Педагогика» → «Источник».

**Architecture:** Все изменения в существующих файлах Next.js 15 + один новый компонент SocialIcon + новая страница /contact + API route для Resend. Схема Sanity расширяется полем heroImage в settings.

**Tech Stack:** Next.js 15, Tailwind CSS v4, Framer Motion, Sanity v3, Resend, TypeScript

---

## Система брейкпоинтов

Tailwind CSS v4 использует стандартные брейкпоинты. В этом проекте:

| Устройство | Диапазон      | Tailwind префикс | Поведение                               |
|------------|---------------|------------------|-----------------------------------------|
| Mobile     | < 768px       | (default)        | 1 колонка, бургер-меню, уменьшенные отступы |
| Tablet     | 768px–1023px  | `md:`            | 2 колонки, бургер-меню, средние отступы |
| Desktop    | ≥ 1024px      | `lg:`            | 2–3 колонки, полная навигация, полные отступы |

**Правило:** бургер-меню показывается на Mobile + Tablet (< `lg`), полная навигация — только на Desktop (≥ `lg`).

Изменить брейкпоинт бургера с `md` на `lg` во всех компонентах.

---

### Task 1: Обновить цветовые переменные в globals.css

**Files:**
- Modify: `app/globals.css`

**Что делаем:**
Меняем `--color-bg` с глухого чёрного на тёмно-серый с тёплым тоном. Добавляем переменные для hero fallback и текста.

**Step 1: Открыть файл и заменить @theme блок**

```css
@import "tailwindcss";

@theme {
  --font-sans: var(--font-onest);
  --font-serif: var(--font-cormorant);
  --color-accent: oklch(72% 0.12 55);
  --color-bg: oklch(14% 0.008 60);
  --color-hero-fallback: oklch(96% 0.02 85);
  --color-text: oklch(95% 0 0);
  --color-muted: oklch(60% 0 0);
}

body {
  background-color: var(--color-bg);
  font-family: var(--font-sans);
  color: var(--color-text);
}
```

**Step 2: Проверить локально**

```bash
npm run dev
```

Открыть http://localhost:3000 — фон должен стать тёмно-серым с лёгким тёплым оттенком, не глухим чёрным.

**Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style: update background color to warm dark charcoal"
```

---

### Task 2: Добавить heroImage в Sanity-схему settings

**Files:**
- Modify: `sanity/schemas/settings.ts`
- Modify: `sanity/lib/queries.ts`

**Что делаем:**
Добавляем поле `heroImage` (image с hotspot) в схему Settings. Обновляем GROQ-запрос `getSettings`. Пользователь сможет загрузить фото в Sanity Studio → Settings.

**Step 1: Обновить схему**

```ts
// sanity/schemas/settings.ts
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
```

**Step 2: Обновить GROQ-запрос**

```ts
// sanity/lib/queries.ts — функция getSettings
export async function getSettings() {
  return client.fetch(`*[_type == "settings"][0] {
    name, email,
    "heroImage": heroImage { ..., "url": asset->url },
    socials[] { label, url, icon }
  }`)
}
```

**Step 3: Commit**

```bash
git add sanity/schemas/settings.ts sanity/lib/queries.ts
git commit -m "feat(sanity): add heroImage field and icon to socials in settings schema"
```

---

### Task 3: Создать компонент SocialIcon

**Files:**
- Create: `components/SocialIcon.tsx`

**Что делаем:**
Минималистичные SVG-иконки для Telegram, Instagram, YouTube. Компонент принимает `icon` (строка) и `size` (число, default 20).

**Step 1: Создать файл**

```tsx
// components/SocialIcon.tsx
type IconType = 'telegram' | 'instagram' | 'youtube'

const icons: Record<IconType, React.FC<{ size: number }>> = {
  telegram: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 5L2 12.5l7 1M21 5l-5 15-4.5-6.5M21 5L9 13.5m0 0L9.5 19.5" />
    </svg>
  ),
  instagram: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  ),
  youtube: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <polygon points="10,9 10,15 16,12" fill="currentColor" stroke="none" />
    </svg>
  ),
}

export default function SocialIcon({ icon, size = 20 }: { icon: string; size?: number }) {
  const Icon = icons[icon as IconType]
  if (!Icon) return null
  return <Icon size={size} />
}
```

**Step 2: Commit**

```bash
git add components/SocialIcon.tsx
git commit -m "feat: add SocialIcon component with Telegram, Instagram, YouTube SVGs"
```

---

### Task 4: Переделать герой на главной странице

**Files:**
- Modify: `app/(site)/page.tsx`

**Что делаем:**
Герой занимает `100svh`. Фото — абсолютное, `object-cover`. Поверх — градиентный оверлей снизу вверх. Текст и соцсети — в нижней части. Если фото нет — кремовый фон и тёмный текст. Соцсети — ссылки с иконками.

**Step 1: Заменить страницу**

```tsx
// app/(site)/page.tsx
import FadeIn from '@/components/FadeIn'
import WorkCard from '@/components/WorkCard'
import SocialIcon from '@/components/SocialIcon'
import { getFeaturedWorks, getSettings } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'

export default async function HomePage() {
  const [works, settings] = await Promise.all([getFeaturedWorks(), getSettings()])
  const hasPhoto = !!settings?.heroImage?.url
  const photoUrl = hasPhoto ? urlFor(settings.heroImage).width(1600).url() : null

  return (
    <div>
      {/* Hero */}
      <section
        className="relative min-h-[100svh] flex flex-col justify-end"
        style={!hasPhoto ? { backgroundColor: 'var(--color-hero-fallback)' } : undefined}
      >
        {/* Фото */}
        {photoUrl && (
          <>
            <img
              src={photoUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Оверлей */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          </>
        )}

        {/* Контент */}
        <div className="relative z-10 px-6 pb-10 pt-24">
          <FadeIn>
            <h1
              className="font-sans text-[clamp(2.2rem,7vw,9rem)] leading-none font-bold uppercase"
              style={{ color: hasPhoto ? 'white' : 'oklch(14% 0.008 60)' }}
            >
              {settings?.name ?? 'Имя'}
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p
              className="font-serif text-[clamp(1rem,2.5vw,1.6rem)] mt-3 italic"
              style={{ color: hasPhoto ? 'rgba(255,255,255,0.75)' : 'oklch(40% 0 0)' }}
            >
              Звуковой художник и педагог
            </p>
          </FadeIn>

          {/* Соцсети */}
          {settings?.socials?.length > 0 && (
            <FadeIn delay={0.2}>
              <div className="flex gap-5 mt-6">
                {settings.socials.map((s: any) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="transition-opacity duration-300 hover:opacity-60"
                    style={{ color: hasPhoto ? 'white' : 'oklch(14% 0.008 60)' }}
                  >
                    <SocialIcon icon={s.icon} size={22} />
                  </a>
                ))}
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* Избранные работы */}
      {works.length > 0 && (
        <section className="px-6 py-24">
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

**Step 2: Проверить локально**

```bash
npm run dev
```

Открыть http://localhost:3000 — герой на весь экран, соцсети видны без скролла.

**Step 3: Commit**

```bash
git add app/(site)/page.tsx
git commit -m "feat: hero with full-bleed photo, overlay, and social icons"
```

---

### Task 5: Переделать Header — бургер-меню

**Files:**
- Modify: `components/Header.tsx`

**Что делаем:**
На мобайл/планшете (< md = 768px) — показывается кнопка бургера. По клику открывается fullscreen overlay с навигацией. На десктопе — текущий вид. Состояние `isOpen` хранится в useState.

**Step 1: Заменить Header**

```tsx
// components/Header.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const links = [
  { href: '/works', label: 'Работы' },
  { href: '/about', label: 'О себе' },
  { href: '/teaching', label: 'Педагогика' },
  { href: '/blog', label: 'Блог' },
  { href: '/contact', label: 'Контакт' },
]

export default function Header({ name }: { name: string }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Закрывать при переходе на другую страницу
  useEffect(() => { setIsOpen(false) }, [pathname])

  // Блокировать скролл когда меню открыто
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 mix-blend-difference">
        <Link href="/" className="font-sans text-sm uppercase tracking-widest text-white">
          {name}
        </Link>

        {/* Десктоп навигация */}
        <nav className="hidden lg:flex gap-6">
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

        {/* Бургер кнопка (мобайл/планшет) */}
        <button
          onClick={() => setIsOpen(v => !v)}
          aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
          className="lg:hidden flex flex-col gap-1.5 p-1 text-white"
        >
          <span className={`block w-6 h-px bg-current transition-transform duration-300 origin-center ${isOpen ? 'translate-y-[5px] rotate-45' : ''}`} />
          <span className={`block w-6 h-px bg-current transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-px bg-current transition-transform duration-300 origin-center ${isOpen ? '-translate-y-[5px] -rotate-45' : ''}`} />
        </button>
      </header>

      {/* Мобильное меню оверлей */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex flex-col justify-center items-center"
          style={{ backgroundColor: 'var(--color-bg)' }}
        >
          <nav className="flex flex-col items-center gap-8">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-sans text-3xl uppercase tracking-widest transition-opacity duration-300 ${
                  pathname === link.href ? 'opacity-100' : 'opacity-40 hover:opacity-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
```

**Step 2: Проверить на мобайле**

```bash
npm run dev
```

В DevTools включить мобильный режим (iPhone SE). Проверить: бургер открывает/закрывает меню, на десктопе бургер скрыт.

**Step 3: Commit**

```bash
git add components/Header.tsx
git commit -m "feat: burger menu for mobile/tablet with fullscreen overlay"
```

---

### Task 6: Исправить H1 в статьях и работах

**Files:**
- Modify: `app/(site)/blog/[slug]/page.tsx`
- Modify: `app/(site)/works/[slug]/page.tsx`

**Что делаем:**
Уменьшить минимальный размер H1 — на мобиле он сейчас огромный (2rem minimum это ещё норм, но 5vw на 390px это ~20px, а font-size был clamp(2rem,5vw,4rem) — на мобиле будет 2rem что нормально). Однако body текст тоже огромный (text-xl).

**Step 1: Исправить blog/[slug]/page.tsx**

Строка 36 — изменить H1:
```tsx
// было:
<h1 className="font-sans text-[clamp(2rem,5vw,4rem)] font-bold uppercase mb-12">
// стало:
<h1 className="font-sans text-[clamp(1.5rem,4vw,3.5rem)] font-bold uppercase mb-8">
```

Строка 40 — уменьшить body текст:
```tsx
// было:
<div className="font-serif text-xl text-white/80 leading-relaxed ...">
// стало:
<div className="font-serif text-base md:text-xl text-white/80 leading-relaxed ...">
```

**Step 2: Исправить works/[slug]/page.tsx**

Строка 22 — изменить H1:
```tsx
// было:
<h1 className="font-sans text-[clamp(2rem,5vw,5rem)] font-bold uppercase mb-8">
// стало:
<h1 className="font-sans text-[clamp(1.5rem,4vw,4rem)] font-bold uppercase mb-6">
```

**Step 3: Commit**

```bash
git add app/(site)/blog/[slug]/page.tsx app/(site)/works/[slug]/page.tsx
git commit -m "fix: reduce H1 and body text size on mobile for blog and works pages"
```

---

### Task 7: Создать страницу /contact с формой

**Files:**
- Create: `app/(site)/contact/page.tsx`

**Что делаем:**
Страница с формой. Поля: Имя, Email, Сообщение. Кнопка «Отправить». Состояния: idle / loading / success / error. Отправка через `fetch('/api/contact', { method: 'POST' })`.

**Step 1: Создать страницу**

```tsx
// app/(site)/contact/page.tsx
'use client'
import { useState } from 'react'
import FadeIn from '@/components/FadeIn'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ContactPage() {
  const [status, setStatus] = useState<Status>('idle')
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="px-6 py-24 max-w-xl mx-auto">
      <FadeIn>
        <h1 className="font-sans text-[clamp(1.5rem,4vw,3rem)] font-bold uppercase mb-12">
          Контакт
        </h1>
      </FadeIn>

      {status === 'success' ? (
        <FadeIn>
          <p className="font-serif text-lg text-white/70 italic">
            Сообщение отправлено. Отвечу в ближайшее время.
          </p>
        </FadeIn>
      ) : (
        <FadeIn delay={0.1}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <label className="flex flex-col gap-2">
              <span className="font-sans text-xs uppercase tracking-widest text-white/40">Имя</span>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="bg-transparent border-b border-white/20 py-2 font-sans text-base outline-none focus:border-white/60 transition-colors duration-300"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-sans text-xs uppercase tracking-widest text-white/40">Email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="bg-transparent border-b border-white/20 py-2 font-sans text-base outline-none focus:border-white/60 transition-colors duration-300"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-sans text-xs uppercase tracking-widest text-white/40">Сообщение</span>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="bg-transparent border-b border-white/20 py-2 font-sans text-base outline-none focus:border-white/60 transition-colors duration-300 resize-none"
              />
            </label>
            {status === 'error' && (
              <p className="font-sans text-sm text-red-400">Ошибка отправки. Попробуйте ещё раз.</p>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="font-sans text-sm uppercase tracking-widest border border-white/30 px-6 py-3 hover:border-white transition-colors duration-300 disabled:opacity-50 self-start"
            >
              {status === 'loading' ? 'Отправка...' : 'Отправить →'}
            </button>
          </form>
        </FadeIn>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/(site)/contact/page.tsx
git commit -m "feat: add contact page with form UI"
```

---

### Task 8: Создать API route для отправки через Resend

**Files:**
- Create: `app/api/contact/route.ts`

**Что делаем:**
POST handler. Принимает `{ name, email, message }`. Отправляет письмо через Resend на `laskalugas@gmail.com`. Нужна ENV переменная `RESEND_API_KEY`.

**Step 1: Установить Resend**

```bash
npm install resend
```

**Step 2: Создать route**

```ts
// app/api/contact/route.ts
import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json()

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { error } = await resend.emails.send({
    from: 'Portfolio <onboarding@resend.dev>',
    to: 'laskalugas@gmail.com',
    subject: `Новое сообщение от ${name}`,
    text: `От: ${name} <${email}>\n\n${message}`,
  })

  if (error) {
    return NextResponse.json({ error: 'Send failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
```

**Step 3: Добавить RESEND_API_KEY в .env.local**

Создать аккаунт на resend.com → получить API Key → добавить в `.env.local`:
```
RESEND_API_KEY=re_xxxxxxxxxx
```

Также добавить в Vercel: Settings → Environment Variables → `RESEND_API_KEY`

**Step 4: Проверить локально**

```bash
npm run dev
```

Открыть http://localhost:3000/contact, заполнить форму, отправить. Проверить почту.

**Step 5: Commit**

```bash
git add app/api/contact/route.ts package.json package-lock.json
git commit -m "feat: add contact API route using Resend"
```

---

### Task 9: Финальная проверка и деплой

**Step 1: Запустить линтер**

```bash
npm run lint
```

Исправить все ошибки если есть.

**Step 2: Сборка**

```bash
npm run build
```

Убедиться что сборка проходит без ошибок.

**Step 3: Добавить RESEND_API_KEY в Vercel**

Vercel Dashboard → Project Settings → Environment Variables → Add:
- Key: `RESEND_API_KEY`
- Value: ваш API ключ от resend.com
- Environment: Production

**Step 4: Push и деплой**

```bash
git push
```

Зайти в Vercel Dashboard → нажать Redeploy.

**Step 5: Проверить на продакшене**

- Главная: фон тёмно-серый (не глухой чёрный)
- Мобайл: бургер-меню работает
- Герой: соцсети видны без скролла
- Блог: H1 не огромный
- /contact: форма отправляет письмо

**Step 6: Добавить фото в Sanity**

Sanity Studio → Settings → поле «Фото на главной» → загрузить фото.
Vercel Dashboard → Redeploy.

---

---

### Task 10: Переименовать раздел «Педагогика» → «Источник» и перенести маршрут

**Files:**
- Rename folder: `app/(site)/teaching/` → `app/(site)/istochnik/`
- Modify: `components/Header.tsx` (после Task 5)

**Что делаем:**
Переименовываем папку, обновляем href в навигации. URL и страница меняются: `/teaching` → `/istochnik`.

**Step 1: Переименовать папку маршрута**

```bash
mv app/(site)/teaching app/(site)/istochnik
```

**Step 2: Обновить ссылку в Header.tsx**

```tsx
// В массиве links — найти и заменить:
// было:
{ href: '/teaching', label: 'Педагогика' },
// стало:
{ href: '/istochnik', label: 'Источник' },
```

**Step 3: Проверить**

```bash
npm run dev
```

Открыть http://localhost:3000/istochnik — страница открывается, http://localhost:3000/teaching — 404.

**Step 4: Commit**

```bash
git add app/(site)/istochnik/ components/Header.tsx
git rm -r app/(site)/teaching/
git commit -m "feat: rename teaching section to istochnik with new route /istochnik"
```

---

## Порядок выполнения

1. Task 1 — цвета
2. Task 2 — Sanity схема + запрос
3. Task 3 — SocialIcon компонент
4. Task 4 — герой (зависит от Task 2 + 3)
5. Task 5 — бургер-меню (брейкпоинт `lg`, три уровня: Mobile/Tablet/Desktop)
6. Task 6 — типографика
7. Task 7 — страница /contact
8. Task 8 — API route (зависит от Task 7)
9. Task 10 — переименование /teaching → /istochnik
10. Task 9 — деплой
