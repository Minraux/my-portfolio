import Link from 'next/link'
import Footer from '@/components/Footer'
import { getFeaturedWorks, getLatestPosts, getSettings } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'

const typeLabels: Record<string, string> = {
  audio: 'Аудио',
  video: 'Видео',
  installation: 'Инсталляция',
  performance: 'Перформанс',
}

export default async function HomePage() {
  const [works, posts, settings] = await Promise.all([
    getFeaturedWorks(),
    getLatestPosts(),
    getSettings(),
  ])

  const heroEnabled = settings?.heroEnabled !== false && !!settings?.heroImage?.url
  const photoUrl = heroEnabled ? urlFor(settings.heroImage).width(1600).url() : null

  return (
    <div style={{
      position: 'relative',
      minHeight: 'calc(100svh - 3rem)',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Hero фото — фиксированный фон */}
      {photoUrl && (
        <>
          <img
            src={photoUrl}
            alt=""
            style={{
              position: 'fixed',
              top: 0, left: 0,
              width: '100%', height: '100svh',
              objectFit: 'cover',
              zIndex: 0,
            }}
          />
          <div style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100%', height: '100svh',
            background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)',
            zIndex: 1,
          }} />
        </>
      )}

      {/* Распорка — толкает контент вниз */}
      <div style={{ flex: 1 }} />

      {/* Контент поверх фото */}
      <div style={{ position: 'relative', zIndex: 10 }}>

        {works.length > 0 && (
          <section style={{ padding: '0 24px' }}>
            <p style={{ fontSize: 11, letterSpacing: '0.15em', color: 'white', textTransform: 'uppercase', marginBottom: 12 }}>
              Последние работы
            </p>
            {works.map((work: any) => (
              <Link
                key={work._id}
                href={`/works/${work.slug.current}`}
                className="home-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '10px 0',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  textDecoration: 'none',
                  color: 'white',
                }}
              >
                {work.image?.url && (
                  <img
                    src={urlFor(work.image).width(120).height(96).fit('crop').url()}
                    alt=""
                    style={{ width: 60, height: 48, objectFit: 'cover', flexShrink: 0 }}
                  />
                )}
                <span style={{ flex: 1, fontSize: 15 }}>{work.title}</span>
                <span style={{ fontSize: 13, color: 'white', flexShrink: 0 }}>
                  {[(typeLabels[work.type] ?? work.type), work.year].filter(Boolean).join(' · ')}
                </span>
                <span style={{ color: 'white', flexShrink: 0 }}>→</span>
              </Link>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
          </section>
        )}

        {posts.length > 0 && (
          <section style={{ padding: '24px 24px 0' }}>
            <p style={{ fontSize: 11, letterSpacing: '0.15em', color: 'white', textTransform: 'uppercase', marginBottom: 12 }}>
              Последние публикации
            </p>
            {posts.map((post: any) => (
              <Link
                key={post._id}
                href={`/publications/${post.slug.current}`}
                className="home-row"
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 14,
                  padding: '10px 0',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  textDecoration: 'none',
                  color: 'white',
                }}
              >
                <span style={{ flex: 1, fontSize: 15 }}>{post.title}</span>
                <span style={{ fontSize: 13, color: 'white', flexShrink: 0 }}>
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('ru-RU') : ''}
                </span>
                <span style={{ color: 'white', flexShrink: 0 }}>→</span>
              </Link>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
          </section>
        )}

        <Footer name={settings?.name ?? ''} socials={settings?.socials ?? []} />
      </div>
    </div>
  )
}
