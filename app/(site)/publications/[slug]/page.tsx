export const revalidate = 300

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { getPost, getAllPosts } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import MediaPlayer from '@/components/MediaPlayer'

export async function generateStaticParams() {
  const posts = await getAllPosts()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return posts.map((p: any) => ({ slug: p.slug.current }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ogImage = (post as any).seo?.ogImage?.url ?? (post as any).coverImage?.url
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seo = (post as any).seo
  const ogTitle = seo?.title ?? post.title
  const ogDescription = seo?.description ?? (post as any).excerpt
  return {
    title: ogTitle,
    description: ogDescription,
    openGraph: {
      title: ogTitle,
      ...(ogDescription && { description: ogDescription }),
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    media: ({ value }: any) => <MediaPlayer value={value} />,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    block: ({ value, children }: any) => {
      const style = value?.style || 'normal'
      if (style === 'h2') return <h2>{children}</h2>
      if (style === 'h3') return <h3>{children}</h3>
      if (style === 'blockquote') return <blockquote>{children}</blockquote>
      return <p>{children}</p>
    },
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

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <div style={{ padding: '40px 24px' }}>

      {/* Заголовок */}
      <h1 style={{
        fontSize: 'clamp(1.5rem, 4vw, 3rem)',
        fontWeight: 600,
        lineHeight: 1.2,
        marginBottom: (post as any).excerpt ? 16 : 40,
        paddingBottom: (post as any).excerpt ? 0 : 24,
        borderBottom: (post as any).excerpt ? 'none' : '1px solid #1e1e1e',
      }}>
        {post.title}
      </h1>

      {/* Лид */}
      {(post as any).excerpt && (
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: 'white',
          lineHeight: 1.5,
          marginBottom: 40,
          borderBottom: '1px solid #1e1e1e',
          paddingBottom: 24,
        }}>
          {(post as any).excerpt}
        </p>
      )}

      {/* Двухколонная сетка */}
      <div className="detail-grid">

        {/* Левая колонка — обложка */}
        <div className="detail-grid-left" style={{ paddingRight: 32 }}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(post as any).coverImage?.url && (
            <img
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              src={urlFor((post as any).coverImage).width(900).url()}
              alt=""
              style={{ width: '100%' }}
            />
          )}
        </div>

        {/* Правая колонка — метаданные */}
        <div className="detail-grid-right" style={{ paddingLeft: 32, borderLeft: '1px solid #1e1e1e' }}>
          {post.publishedAt && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.15em', color: 'white', textTransform: 'uppercase', marginBottom: 4 }}>Дата</p>
              <p style={{ fontSize: 15 }}>{new Date(post.publishedAt).toLocaleDateString('ru-RU')}</p>
              <div style={{ borderTop: '1px solid #1e1e1e', marginTop: 20 }} />
            </div>
          )}
          {post.tags?.length > 0 && (
            <div>
              <p style={{ fontSize: 11, letterSpacing: '0.15em', color: 'white', textTransform: 'uppercase', marginBottom: 8 }}>Теги</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    style={{
                      border: '1px solid #333',
                      borderRadius: 9999,
                      padding: '3px 12px',
                      fontSize: 12,
                      color: 'white',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Body-текст на всю ширину */}
      {post.body && (
        <div className="article-body" style={{
          fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
          lineHeight: 1.6,
          color: 'white',
          borderTop: '1px solid #1e1e1e',
          paddingTop: 40,
        }}>
          <PortableText value={post.body} components={bodyComponents} />
        </div>
      )}
    </div>
  )
}
