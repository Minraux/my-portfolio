'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const links = [
  { href: '/works', label: 'Работы' },
  { href: '/publications', label: 'Публикации' },
  { href: '/source', label: 'Источник' },
  { href: '/about', label: 'Автор' },
]

export default function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY >= 50)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Hide header on Andromatic page
  if (pathname?.startsWith('/andromatic')) {
    return null
  }

  const isHome = pathname === '/'
  const transparent = isHome && !scrolled

  return (
    <header
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 50,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        flexWrap: 'nowrap',
        whiteSpace: 'nowrap',
        background: transparent ? 'transparent' : 'rgba(0,0,0,0.95)',
        backdropFilter: transparent ? 'none' : 'blur(8px)',
        transition: 'background 0.2s',
      }}
    >
      {pathname !== '/' && (
        <Link href="/" aria-label="Назад" className="nav-back">‹</Link>
      )}

      {links.filter(link => pathname !== link.href).map(link => (
        <Link
          key={link.href}
          href={link.href}
          className="nav-pill"
        >
          {link.label}
        </Link>
      ))}

      {pathname !== '/contact' && (
        <Link
          href="/contact"
          className="nav-pill nav-pill-cta"
          style={{ marginLeft: 'auto' }}
        >
          Контакт
        </Link>
      )}
    </header>
  )
}
