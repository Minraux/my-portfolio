export const revalidate = 300

import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'

export const metadata: Metadata = { title: 'Источник' }
import { getSource } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'

const components = {
  types: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    image: ({ value }: any) => (
      <figure style={{ margin: '32px 0' }}>
        <img src={urlFor(value).width(720).url()} alt="" style={{ width: '100%' }} />
        {value.caption && (
          <figcaption style={{ fontSize: 13, color: 'white', marginTop: 8 }}>{value.caption}</figcaption>
        )}
      </figure>
    ),
  },
  block: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h1: ({ children }: any) => (
      <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 600, lineHeight: 1.2, margin: '48px 0 16px' }}>{children}</h1>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h2: ({ children }: any) => (
      <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 2rem)', fontWeight: 500, lineHeight: 1.3, margin: '36px 0 12px' }}>{children}</h2>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h3: ({ children }: any) => (
      <h3 style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: 500, lineHeight: 1.4, margin: '28px 0 8px' }}>{children}</h3>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h4: ({ children }: any) => (
      <h4 style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '24px 0 8px', color: 'white' }}>{children}</h4>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    blockquote: ({ children }: any) => (
      <blockquote style={{
        borderLeft: '2px solid #2a2a2a',
        paddingLeft: 20,
        color: 'white',
        fontStyle: 'italic',
        margin: '28px 0',
      }}>
        {children}
      </blockquote>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    normal: ({ children }: any) => (
      <p style={{ marginBottom: '1.4em' }}>{children}</p>
    ),
  },
  list: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bullet: ({ children }: any) => (
      <ul style={{ paddingLeft: 20, marginBottom: '1.2em', listStyleType: 'disc' }}>{children}</ul>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    number: ({ children }: any) => (
      <ol style={{ paddingLeft: 20, marginBottom: '1.2em', listStyleType: 'decimal' }}>{children}</ol>
    ),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listItem: ({ children }: any) => (
    <li style={{ marginBottom: '0.5em' }}>{children}</li>
  ),
  marks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    strong: ({ children }: any) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    em: ({ children }: any) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    link: ({ value, children }: any) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-link"
        style={{ textDecoration: 'underline', textDecorationColor: '#444', textUnderlineOffset: 3 }}
      >
        {children}
      </a>
    ),
  },
}

export default async function SourcePage() {
  const source = await getSource()

  return (
    <div style={{ padding: '40px 24px' }}>
      {source?.title && (
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 3rem)',
          fontWeight: 600,
          lineHeight: 1.2,
          marginBottom: 40,
          borderBottom: '1px solid #1e1e1e',
          paddingBottom: 24,
        }}>
          {source.title}
        </h1>
      )}

      {source?.body ? (
        <div style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', lineHeight: 1.6, maxWidth: 800 }}>
          <PortableText value={source.body} components={components} />
        </div>
      ) : (
        <p style={{ color: 'white' }}>Нет содержимого. Добавьте текст в Sanity Studio → Источник.</p>
      )}
    </div>
  )
}
