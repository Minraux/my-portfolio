import type { Metadata } from 'next'
import AndromaticClient from './AndromaticClient'

export const metadata: Metadata = {
  metadataBase: new URL('https://dobrovolski.space'),
  title: 'Andromatic — 10-Step Sequencer | Эркки Куренниеми 1968',
  description: 'Веб-версия легендарного секвенсора Andromatic, созданного Эркки Куренниеми в 1968 году. 10-шаговый паттерн-секвенсор с аналоговым звучанием.',
  keywords: ['andromatic', 'sequencer', 'pattern sequencer', 'Erkki Kurenniemi', '1968', 'аналоговый синтезатор', 'step sequencer', 'электроакустическая музыка'],
  authors: [{ name: 'Влад Добровольский' }],
  openGraph: {
    title: 'Andromatic — 10-Step Sequencer | Эркки Куренниеми 1968',
    description: 'Веб-версия легендарного секвенсора Andromatic (1968)',
    type: 'website',
    url: 'https://dobrovolski.space/andromatic',
    siteName: 'Влад Добровольский',
    locale: 'ru_RU',
    images: [
      {
        url: 'https://dobrovolskii.space/andromatic/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Andromatic — 10-шаговый секвенсор в стиле 1968 года',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Andromatic — 10-Step Sequencer',
    description: 'Веб-версия секвенсора Andromatic (1968)',
    images: ['https://dobrovolskii.space/andromatic/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function AndromaticPage() {
  return (
    <div className="andromatic-page" style={{ minHeight: '100vh', background: '#141414', margin: 0, padding: 0 }}>
      <AndromaticClient />
    </div>
  )
}
