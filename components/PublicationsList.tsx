'use client'
import { useState } from 'react'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'
import Footer from '@/components/Footer'

type Post = {
  _id: string
  title: string
  slug: { current: string }
  publishedAt?: string
  excerpt?: string
  coverImage?: { url: string; [key: string]: any }
}

type Settings = {
  name?: string
  socials?: { label: string; url: string }[]
}

export default function PublicationsList({ posts, settings }: { posts: Post[]; settings: Settings | null }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100svh - 3rem)' }}>
      <div style={{ flex: 1 }} />
      <div style={{ padding: '0 24px' }}>
        {posts.map((post) => (
          <div
            key={post._id}
            style={{ position: 'relative' }}
            onMouseEnter={() => setHoveredId(post._id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {post.coverImage?.url && (
              <div style={{
                position: 'absolute',
                bottom: '110%',
                left: 0,
                width: 200,
                height: 150,
                opacity: hoveredId === post._id ? 1 : 0,
                transition: 'opacity 0.15s',
                pointerEvents: 'none',
                zIndex: 20,
              }}>
                <img
                  src={urlFor(post.coverImage).width(400).height(300).fit('crop').url()}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            <Link
              href={`/publications/${post.slug.current}`}
              className="home-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '12px 0',
                borderTop: '1px solid #1e1e1e',
                textDecoration: 'none',
                color: 'white',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, marginBottom: post.excerpt ? 4 : 0 }}>{post.title}</div>
                {post.excerpt && (
                  <div style={{ fontSize: 13, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {post.excerpt}
                  </div>
                )}
              </div>
              <span style={{ fontSize: 13, color: 'white', flexShrink: 0 }}>
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('ru-RU') : ''}
              </span>
              <span style={{ color: 'white', flexShrink: 0 }}>→</span>
            </Link>
          </div>
        ))}
        <div style={{ borderTop: '1px solid #1e1e1e' }} />
      </div>
      <Footer name={settings?.name ?? ''} socials={settings?.socials ?? []} />
    </div>
  )
}
