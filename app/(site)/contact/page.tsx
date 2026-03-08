import type { Metadata } from 'next'
import { getSettings } from '@/sanity/lib/queries'

export const metadata: Metadata = { title: 'Контакт' }

export default async function ContactPage() {
  const settings = await getSettings()
  const email = settings?.email
  const socials = settings?.socials ?? []

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100svh - 3rem)',
      padding: '40px 24px',
    }}>
      {/* Email */}
      {email && (
        <p style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', marginBottom: 20 }}>
          <a
            href={`mailto:${email}`}
            className="text-link"
            style={{
              textDecoration: 'underline',
              textDecorationColor: '#444',
              textUnderlineOffset: 4,
            }}
          >
            {email}
          </a>
          {' '}
          <span style={{ color: 'white' }}>(по всем вопросам)</span>
        </p>
      )}

      {/* Ссылки */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {socials.map((s: any) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
            style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
              textDecoration: 'underline',
              textDecorationColor: '#444',
              textUnderlineOffset: 4,
              lineHeight: 1.6,
            }}
          >
            {s.label}
          </a>
        ))}
      </div>
    </div>
  )
}
