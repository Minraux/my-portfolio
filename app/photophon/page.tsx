import PhotophonApp from './PhotophonApp'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Photophon PS-1 — Оптический фотосинтезатор',
  description: 'Преобразует видеосигнал с веб-камеры в звук в реальном времени. Анализ яркости, RGB спектра, хроматичности и движения.',
  keywords: ['фотосинтезатор', 'веб-аудио', 'синтез звука', 'компьютерное зрение', 'интерактивное искусство', 'sound art', 'web audio'],
  authors: [{ name: 'Влад Добровольский' }],
  openGraph: {
    title: 'Photophon PS-1 — Оптический фотосинтезатор',
    description: 'Преобразует видеосигнал с веб-камеры в звук в реальном времени',
    type: 'website',
    url: 'https://dobrovolski.space/photophon',
    siteName: 'Влад Добровольский',
    locale: 'ru_RU',
    images: [
      {
        url: '/photophon/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Photophon PS-1 — интерфейс оптического фотосинтезатора в стиле Braun',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Photophon PS-1 — Оптический фотосинтезатор',
    description: 'Преобразует видеосигнал с веб-камеры в звук в реальном времени',
    images: ['/photophon/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PhotophonPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#EDE9E0', margin: 0, padding: 0 }}>
      <PhotophonApp />
    </div>
  )
}
