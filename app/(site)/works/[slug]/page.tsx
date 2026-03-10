export const revalidate = 300

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { getWork, getAllWorks } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'

export async function generateStaticParams() {
  const works = await getAllWorks()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return works.map((w: any) => ({ slug: w.slug.current }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const work = await getWork(slug)
  if (!work) return {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ogImage = (work as any).seo?.ogImage?.url ?? work.images?.[0]?.url
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    title: (work as any).seo?.title ?? work.title,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    description: (work as any).seo?.description,
    openGraph: ogImage ? { images: [{ url: ogImage }] } : undefined,
  }
}

const bodyComponents = {
  types: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    image: ({ value }: any) => (
      <img src={urlFor(value).width(1200).url()} alt="" style={{ width: '100%', margin: '24px 0' }} />
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    embed: ({ value }: any) => (
      <div dangerouslySetInnerHTML={{ __html: value.code }} style={{ margin: '24px 0' }} />
    ),
  },
  marks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    link: ({ value, children }: any) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer" className="text-link" style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}>
        {children}
      </a>
    ),
  },
}

const typeLabels: Record<string, string> = {
  audio: 'Аудио',
  video: 'Видео',
  installation: 'Инсталляция',
  performance: 'Перформанс',
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const work = await getWork(slug)
  if (!work) notFound()

  return (
    <div style={{ padding: '40px 24px' }}>

      {/* Ссылка над заголовком */}
      {work.mediaType === 'link' && work.mediaUrl && (
        <div style={{ marginBottom: 16 }}>
          <a
            href={work.mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-pill"
            style={{ display: 'inline-block' }}
          >
            Открыть ↗
          </a>
        </div>
      )}

      {/* Заголовок */}
      <h1 style={{
        fontSize: 'clamp(1.5rem, 4vw, 3rem)',
        fontWeight: 600,
        lineHeight: 1.2,
        marginBottom: 40,
        borderBottom: '1px solid #1e1e1e',
        paddingBottom: 24,
      }}>
        {work.title}
      </h1>

      {/* Двухколонная сетка */}
      <div className="detail-grid">

        {/* Левая колонка — всегда изображения */}
        <div className="detail-grid-left" style={{ paddingRight: 32 }}>
          {work.images?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {work.images.map((img: any, i: number) => (
                <img key={i} src={urlFor(img).width(900).url()} alt="" style={{ width: '100%' }} />
              ))}
            </div>
          )}
        </div>

        {/* Правая колонка — метаданные */}
        <div className="detail-grid-right" style={{ paddingLeft: 32, borderLeft: '1px solid #1e1e1e' }}>
          {work.type && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.15em', color: 'white', textTransform: 'uppercase', marginBottom: 4 }}>Тип</p>
              <p style={{ fontSize: 15 }}>{typeLabels[work.type] ?? work.type}</p>
              <div style={{ borderTop: '1px solid #1e1e1e', marginTop: 20 }} />
            </div>
          )}
          {work.year && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.15em', color: 'white', textTransform: 'uppercase', marginBottom: 4 }}>Год</p>
              <p style={{ fontSize: 15 }}>{work.year}</p>
              <div style={{ borderTop: '1px solid #1e1e1e', marginTop: 20 }} />
            </div>
          )}
          {work.location && (
            <div>
              <p style={{ fontSize: 11, letterSpacing: '0.15em', color: 'white', textTransform: 'uppercase', marginBottom: 4 }}>Место</p>
              <p style={{ fontSize: 15 }}>{work.location}</p>
            </div>
          )}
        </div>
      </div>

      {/* Аудио-файл под сеткой */}
      {work.mediaType === 'file' && work.mediaFile && (
        <div style={{ marginBottom: 40, borderTop: '1px solid #1e1e1e', paddingTop: 40 }}>
          <audio controls src={work.mediaFile} style={{ width: '100%' }} />
        </div>
      )}

      {/* Встраиваемый код под сеткой */}
      {work.mediaType === 'embed' && work.embedCode && (
        <div
          dangerouslySetInnerHTML={{ __html: work.embedCode }}
          style={{ marginBottom: 40, borderTop: '1px solid #1e1e1e', paddingTop: 40 }}
        />
      )}

      {/* Body-текст с inline embed */}
      {work.body && (
        <div className="article-body" style={{
          fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
          lineHeight: 1.6,
          borderTop: '1px solid #1e1e1e',
          paddingTop: 40,
        }}>
          <PortableText value={work.body} components={bodyComponents} />
        </div>
      )}

      {/* Описание (legacy) */}
      {!work.body && work.description && (
        <div style={{
          fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
          lineHeight: 1.6,
          color: 'white',
          borderTop: '1px solid #1e1e1e',
          paddingTop: 40,
        }}>
          <p>{work.description}</p>
        </div>
      )}
    </div>
  )
}
