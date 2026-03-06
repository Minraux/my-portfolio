'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/works', label: 'Работы' },
  { href: '/about', label: 'О себе' },
  { href: '/teaching', label: 'Педагогика' },
  { href: '/blog', label: 'Блог' },
]

export default function Header({ name }: { name: string }) {
  const pathname = usePathname()
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 mix-blend-difference">
      <Link href="/" className="font-sans text-sm uppercase tracking-widest text-white">
        {name}
      </Link>
      <nav className="flex gap-6">
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
    </header>
  )
}
