export const revalidate = 300

import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import { getAbout } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout()
  const ogImage = about?.photo?.url
  return {
    title: 'Автор',
    openGraph: {
      ...(ogImage && { images: [{ url: urlFor(about.photo).width(1200).auto('format').url(), width: 1200 }] }),
    },
  }
}

export default async function AboutPage() {
  const about = await getAbout()

  return (
    <div className="about-grid" style={{ padding: '40px 24px' }}>

      {/* Левая колонка — фото + CV */}
      <div style={{ width: 280, flexShrink: 0 }}>
        {about?.photo && (
          <img
            src={urlFor(about.photo).width(800).auto('format').url()}
            alt="Автор"
            style={{ width: '100%', display: 'block' }}
          />
        )}
        {about?.cv && (
          <a
            href={about.cv}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-pill"
            style={{ display: 'inline-block', marginTop: 16, fontSize: 13 }}
          >
            Скачать CV (PDF)
          </a>
        )}
      </div>

      {/* Правая колонка — биография */}
      {about?.bio && (
        <div style={{
          fontSize: 'clamp(1rem, 2vw, 1.15rem)',
          lineHeight: 1.7,
          color: 'white',
        }}
          className="about-bio"
        >
          <PortableText value={about.bio} />
        </div>
      )}
    </div>
  )
}
