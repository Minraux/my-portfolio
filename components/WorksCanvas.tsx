'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'
import Footer from '@/components/Footer'

type Work = {
  _id: string
  title: string
  slug: { current: string }
  type: string
  year: number
  canvasTop?: string
  canvasLeft?: string
  image?: { url: string; [key: string]: any }
}

type Settings = {
  name?: string
  socials?: { label: string; url: string }[]
}

const typeLabels: Record<string, string> = {
  audio: 'Аудио',
  video: 'Видео',
  installation: 'Инсталляция',
  performance: 'Перформанс',
}

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

function calcPositions(works: Work[], W: number, H: number) {
  const placed: { top: number; left: number; w: number; h: number }[] = []
  return works.map((work, i) => {
    const pillW = Math.min(work.title.length * 9 + 48, 420)
    const pillH = 38

    if (work.canvasTop && work.canvasLeft) {
      return {
        top: Math.max(24, Math.min((parseFloat(work.canvasTop) / 100) * H, H - pillH - 68)),
        left: Math.max(8, Math.min((parseFloat(work.canvasLeft) / 100) * W, W - pillW - 8)),
      }
    }
    const years = works.map(w => w.year || 2000)
    const yMin = Math.min(...years)
    const yMax = Math.max(...years)
    const yRange = yMax - yMin || 1
    const yFrac = 1 - ((work.year || yMin) - yMin) / yRange

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

export default function WorksCanvas({ works, settings }: { works: Work[], settings: Settings | null }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [positions, setPositions] = useState<{ top: number; left: number }[]>([])
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [page, setPage] = useState(0)

  // Сброс старого кеша без размеров в ключе
  useEffect(() => {
    try {
      Object.keys(localStorage).filter(k => k.startsWith('canvas-')).forEach(k => localStorage.removeItem(k))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // window dimensions надёжнее offsetHeight при первом рендере
    const W = window.innerWidth
    const H = window.innerHeight - 96 // header ~48px + footer ~48px
    const key = `canvas-${works.map(w => `${w._id}${w.canvasTop ?? ''}${w.canvasLeft ?? ''}`).join('')}-${W}`

    try {
      const cached = localStorage.getItem(key)
      if (cached) {
        const parsed = JSON.parse(cached)
        // валидация: длина совпадает и позиции не нулевые
        if (Array.isArray(parsed) && parsed.length === works.length && parsed.some(p => p.top > 0)) {
          setPositions(parsed)
          return
        }
      }
    } catch { /* ignore */ }

    const pos = calcPositions(works, W, H)
    try { localStorage.setItem(key, JSON.stringify(pos)) } catch { /* ignore */ }
    setPositions(pos)
  }, [works])

  const totalPages = Math.ceil(works.length / MOBILE_PAGE_SIZE)
  const paginated = works.slice(page * MOBILE_PAGE_SIZE, (page + 1) * MOBILE_PAGE_SIZE)

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
      {/* ── Десктоп: canvas (первый экран) ── */}
      <div className="works-canvas-wrap">
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100svh - 3rem)' }}>
        <div
          ref={containerRef}
          style={{ position: 'relative', flex: 1 }}
        >
          {positions.length === works.length && works.map((work, i) => (
            <div
              key={work._id}
              style={{ position: 'absolute', top: positions[i].top, left: positions[i].left }}
              onMouseEnter={() => setHoveredId(work._id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {work.image?.url && (
                <div style={{
                  position: 'absolute',
                  ...(positions[i].top < 170 ? { top: '110%' } : { bottom: '110%' }),
                  left: 0,
                  width: 200,
                  height: 150,
                  opacity: hoveredId === work._id ? 1 : 0,
                  transition: 'opacity 0.15s',
                  pointerEvents: 'none',
                  zIndex: 20,
                }}>
                  <img
                    src={urlFor(work.image).width(400).height(300).fit('crop').url()}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,255,65,0.2)' }} />
                </div>
              )}
              <Link
                href={`/works/${work.slug.current}`}
                style={{
                  display: 'inline-block',
                  border: `1.5px solid ${hoveredId === work._id ? '#00FF41' : 'white'}`,
                  borderRadius: 9999,
                  padding: '8px 20px',
                  fontSize: 15,
                  textDecoration: 'none',
                  background: 'black',
                  color: hoveredId === work._id ? '#00FF41' : 'white',
                  transition: 'border-color 0.1s, color 0.1s',
                  whiteSpace: 'nowrap',
                }}
              >
                {work.title}
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
        {paginated.map((work: Work) => (
          <Link
            key={work._id}
            href={`/works/${work.slug.current}`}
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
            {work.image?.url && (
              <div className="img-thumb" style={{ width: 60, height: 48 }}>
                <img
                  src={urlFor(work.image).width(120).height(96).fit('crop').url()}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            <span style={{ flex: 1, fontSize: 15 }}>{work.title}</span>
            <span style={{ fontSize: 13, color: 'white' }}>
              {[(typeLabels[work.type] ?? work.type), work.year].filter(Boolean).join(' · ')}
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
