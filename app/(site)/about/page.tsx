import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'

export const metadata: Metadata = { title: 'Автор' }
import { getAbout } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'

export default async function AboutPage() {
  const about = await getAbout()

  return (
    <div className="about-grid" style={{ padding: '40px 24px' }}>

      {/* Левая колонка — фото + CV */}
      <div style={{ width: 280, flexShrink: 0 }}>
        {about?.photo && (
          <img
            src={urlFor(about.photo).width(560).url()}
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
