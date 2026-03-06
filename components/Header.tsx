'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const links = [
  { href: '/works', label: 'Работы' },
  { href: '/about', label: 'О себе' },
  { href: '/istochnik', label: 'Источник' },
  { href: '/blog', label: 'Блог' },
  { href: '/contact', label: 'Контакт' },
]

export default function Header({ name }: { name: string }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Закрывать при переходе на другую страницу
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setIsOpen(false) }, [pathname])

  // Блокировать скролл когда меню открыто
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 mix-blend-difference">
        <Link href="/" className="font-sans text-sm uppercase tracking-widest text-white">
          {name}
        </Link>

        {/* Десктоп навигация */}
        <nav className="hidden lg:flex gap-6">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-sans text-sm uppercase tracking-widest transition-opacity duration-300 ${
                pathname === link.href ? 'opacity-100' : 'opacity-50 hover:opacity-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Бургер кнопка (мобайл/планшет) */}
        <button
          onClick={() => setIsOpen(v => !v)}
          aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
          className="lg:hidden flex flex-col gap-1.5 p-1 text-white"
        >
          <span className={`block w-6 h-px bg-current transition-transform duration-300 origin-center ${isOpen ? 'translate-y-[5px] rotate-45' : ''}`} />
          <span className={`block w-6 h-px bg-current transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-px bg-current transition-transform duration-300 origin-center ${isOpen ? '-translate-y-[5px] -rotate-45' : ''}`} />
        </button>
      </header>

      {/* Мобильное меню оверлей */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex flex-col justify-center items-center"
          style={{ backgroundColor: 'var(--color-bg)' }}
        >
          <nav className="flex flex-col items-center gap-8">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-sans text-3xl uppercase tracking-widest transition-opacity duration-300 ${
                  pathname === link.href ? 'opacity-100' : 'opacity-40 hover:opacity-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
