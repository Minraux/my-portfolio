import FadeIn from '@/components/FadeIn'
import WorkCard from '@/components/WorkCard'
import SocialIcon from '@/components/SocialIcon'
import { getFeaturedWorks, getSettings } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'

export default async function HomePage() {
  const [works, settings] = await Promise.all([getFeaturedWorks(), getSettings()])
  const hasPhoto = !!settings?.heroImage?.url
  const photoUrl = hasPhoto ? urlFor(settings.heroImage).width(1600).url() : null

  return (
    <div>
      {/* Hero */}
      <section
        className="relative min-h-[100svh] flex flex-col justify-end"
        style={!hasPhoto ? { backgroundColor: 'var(--color-hero-fallback)' } : undefined}
      >
        {/* Фото */}
        {photoUrl && (
          <>
            <img
              src={photoUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Оверлей */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          </>
        )}

        {/* Контент */}
        <div className="relative z-10 px-6 pb-10 pt-24">
          <FadeIn>
            <h1
              className="font-sans text-[clamp(2.2rem,7vw,9rem)] leading-none font-bold uppercase"
              style={{ color: hasPhoto ? 'white' : 'oklch(14% 0.008 60)' }}
            >
              {settings?.name ?? 'Имя'}
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p
              className="font-serif text-[clamp(1rem,2.5vw,1.6rem)] mt-3 italic"
              style={{ color: hasPhoto ? 'rgba(255,255,255,0.75)' : 'oklch(40% 0 0)' }}
            >
              Звуковой художник и педагог
            </p>
          </FadeIn>

          {/* Соцсети */}
          {settings?.socials?.length > 0 && (
            <FadeIn delay={0.2}>
              <div className="flex gap-5 mt-6">
                {settings.socials.map((s: any) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="transition-opacity duration-300 hover:opacity-60"
                    style={{ color: hasPhoto ? 'white' : 'oklch(14% 0.008 60)' }}
                  >
                    <SocialIcon icon={s.icon} size={22} />
                  </a>
                ))}
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* Избранные работы */}
      {works.length > 0 && (
        <section className="px-6 py-24">
          <FadeIn>
            <h2 className="font-sans text-sm uppercase tracking-widest text-white/40 mb-12">
              Избранные работы
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {works.map((work: any, i: number) => (
              <FadeIn key={work._id} delay={i * 0.1}>
                <WorkCard work={work} />
              </FadeIn>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
