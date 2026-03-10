'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'
import Footer from '@/components/Footer'

type Post = {
  _id: string
  title: string
  slug: { current: string }
  publishedAt?: string
  excerpt?: string
  canvasTop?: string
  canvasLeft?: string
  coverImage?: { url: string; [key: string]: any }
}

type Settings = {
  name?: string
  socials?: { label: string; url: string }[]
}

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

function calcPositions(posts: Post[], W: number, H: number) {
  const placed: { top: number; left: number; w: number; h: number }[] = []
  return posts.map((post, i) => {
    const pillW = Math.min(post.title.length * 9 + 48, 420)
    const pillH = 38

    if (post.canvasTop && post.canvasLeft) {
      return {
        top: Math.max(24, Math.min((parseFloat(post.canvasTop) / 100) * H, H - pillH - 68)),
        left: Math.max(8, Math.min((parseFloat(post.canvasLeft) / 100) * W, W - pillW - 8)),
      }
    }

    const years = posts.map(p => p.publishedAt ? new Date(p.publishedAt).getFullYear() : 2000)
    const yMin = Math.min(...years)
    const yMax = Math.max(...years)
    const yRange = yMax - yMin || 1
    const postYear = post.publishedAt ? new Date(post.publishedAt).getFullYear() : yMin
    const yFrac = 1 - (postYear - yMin) / yRange

    let top = 20 + yFrac * (H * 0.75) + seededRandom(i * 3) * (H * 0.1)
    let left = 24 + seededRandom(i * 7) * (W - pillW - 48)

    for (let a = 0; a < 80; a++) {
      const clash = placed.some(
        p => left < p.left + p.w + 20 && left + pillW + 20 > p.left &&
             top < p.top + p.h + 14 && top + pillH + 14 > p.top
      )
      if (!clash) break
      left = (left + pillW + 28) % Math.max(W - pillW - 48, 1)
      if (left < 24) {
        top = Math.min(top + pillH + 20, H - pillH - 24)
        left = 24 + seededRandom(i * 13 + a) * (W - pillW - 48)
      }
    }

    top = Math.max(24, Math.min(top, H - pillH - 68))
    left = Math.max(24, Math.min(left, W - pillW - 24))
    placed.push({ top, left, w: pillW, h: pillH })
    return { top, left }
  })
}

const MOBILE_PAGE_SIZE = 5

export default function PublicationsCanvas({ posts, settings }: { posts: Post[]; settings: Settings | null }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [positions, setPositions] = useState<{ top: number; left: number }[]>([])
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [page, setPage] = useState(0)

  useEffect(() => {
    try {
      Object.keys(localStorage).filter(k => k.startsWith('pub-canvas-')).forEach(k => localStorage.removeItem(k))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const W = window.innerWidth
    const H = window.innerHeight - 96
    const key = `pub-canvas-${posts.map(p => `${p._id}${p.canvasTop ?? ''}${p.canvasLeft ?? ''}`).join('')}-${W}`

    try {
      const cached = localStorage.getItem(key)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length === posts.length && parsed.some(p => p.top > 0)) {
          setPositions(parsed)
          return
        }
      }
    } catch { /* ignore */ }

    const pos = calcPositions(posts, W, H)
    try { localStorage.setItem(key, JSON.stringify(pos)) } catch { /* ignore */ }
    setPositions(pos)
  }, [posts])

  const totalPages = Math.ceil(posts.length / MOBILE_PAGE_SIZE)
  const paginated = posts.slice(page * MOBILE_PAGE_SIZE, (page + 1) * MOBILE_PAGE_SIZE)

  const disabledPill: React.CSSProperties = {
    display: 'inline-block',
    border: '1.5px solid #333',
    borderRadius: 9999,
    padding: '6px 16px',
    fontSize: 14,
    color: '#333',
    cursor: 'default',
    whiteSpace: 'nowrap',
  }

  return (
    <>
      {/* ── Десктоп: canvas ── */}
      <div className="works-canvas-wrap">
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100svh - 3rem)' }}>
          <div ref={containerRef} style={{ position: 'relative', flex: 1 }}>
            {positions.length === posts.length && posts.map((post, i) => (
              <div
                key={post._id}
                style={{ position: 'absolute', top: positions[i].top, left: positions[i].left }}
                onMouseEnter={() => setHoveredId(post._id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {post.coverImage?.url && (
                  <div style={{
                    position: 'absolute',
                    ...(positions[i].top < 170 ? { top: '110%' } : { bottom: '110%' }),
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
                  style={{
                    display: 'inline-block',
                    border: `1.5px solid ${hoveredId === post._id ? '#00FF41' : 'white'}`,
                    borderRadius: 9999,
                    padding: '8px 20px',
                    fontSize: 15,
                    textDecoration: 'none',
                    background: 'black',
                    color: hoveredId === post._id ? '#00FF41' : 'white',
                    transition: 'border-color 0.1s, color 0.1s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {post.title}
                </Link>
              </div>
            ))}
          </div>
          <Footer name={settings?.name ?? ''} socials={settings?.socials ?? []} />
        </div>
      </div>

      {/* ── Мобайл: список с пагинацией ── */}
      <div className="works-list">
        <div style={{ flex: 1, padding: '16px 24px' }}>
        {paginated.map((post: Post) => (
          <Link
            key={post._id}
            href={`/publications/${post.slug.current}`}
            className="home-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '12px 0',
              borderTop: '1px solid #1e1e1e',
              textDecoration: 'none',
              color: 'white',
            }}
          >
            {post.coverImage?.url && (
              <div className="img-thumb" style={{ width: 60, height: 48 }}>
                <img
                  src={urlFor(post.coverImage).width(120).height(96).fit('crop').url()}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            <span style={{ flex: 1, fontSize: 15 }}>{post.title}</span>
            <span style={{ fontSize: 13, color: 'white' }}>
              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('ru-RU', { year: 'numeric', month: 'short' }) : ''}
            </span>
            <span style={{ color: 'white' }}>→</span>
          </Link>
        ))}
        <div style={{ borderTop: '1px solid #1e1e1e' }} />

        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
            {page === 0 ? (
              <span style={disabledPill}>← Новее</span>
            ) : (
              <button onClick={() => setPage(p => p - 1)} className="nav-pill" style={{ fontSize: 14 }}>← Новее</button>
            )}
            {page === totalPages - 1 ? (
              <span style={disabledPill}>Старее →</span>
            ) : (
              <button onClick={() => setPage(p => p + 1)} className="nav-pill" style={{ fontSize: 14 }}>Старее →</button>
            )}
          </div>
        )}
        </div>
        <Footer name={settings?.name ?? ''} socials={settings?.socials ?? []} />
      </div>
    </>
  )
}
