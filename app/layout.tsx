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
  title: {
    default: 'Влад Добровольский',
    template: '%s — Влад Добровольский',
  },
  description: 'Звуковой художник и педагог',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${onest.variable} ${cormorant.variable}`}>
      <body>{children}</body>
    </html>
  )
}
