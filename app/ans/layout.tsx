import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'АНС — Синтезатор Мурзина | Фотооптический синтезатор',
  description: 'Веб-версия легендарного фотооптического синтезатора АНС, созданного Евгением Мурзиным в 1958 году. Рисуйте спектрограммы и создавайте музыку.',
  keywords: ['АНС', 'синтезатор Мурзина', 'фотооптический синтезатор', 'спектрограмма', 'Евгений Мурзин', '1958', 'электроакустическая музыка', 'советский синтезатор', 'ANS synthesizer'],
  authors: [{ name: 'Влад Добровольский' }],
  openGraph: {
    title: 'АНС — Синтезатор Мурзина | Фотооптический синтезатор',
    description: 'Веб-версия легендарного фотооптического синтезатора АНС, созданного Евгением Мурзиным в 1958 году',
    type: 'website',
    url: 'https://dobrovolski.space/ans',
    siteName: 'Влад Добровольский',
    locale: 'ru_RU',
    images: [
      {
        url: '/ans/og-image.png',
        width: 1200,
        height: 630,
        alt: 'АНС — фотооптический синтезатор Мурзина, интерфейс с частотной шкалой и спектрограммой',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'АНС — Синтезатор Мурзина',
    description: 'Веб-версия легендарного фотооптического синтезатора АНС (1958)',
    images: ['/ans/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function AnsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
