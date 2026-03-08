'use client'
import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function ConditionalFooter({ name, socials }: { name: string; socials: { label: string; url: string }[] }) {
  const pathname = usePathname()
  if (pathname === '/' || pathname === '/works' || pathname === '/publications' || pathname === '/contact') return null
  return <Footer name={name} socials={socials} />
}
