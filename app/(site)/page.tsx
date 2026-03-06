import FadeIn from '@/components/FadeIn'
import WorkCard from '@/components/WorkCard'
import { getFeaturedWorks, getSettings } from '@/sanity/lib/queries'

export default async function HomePage() {
  const [works, settings] = await Promise.all([getFeaturedWorks(), getSettings()])

  return (
    <div className="px-6">
      {/* Hero */}
      <section className="min-h-[80vh] flex flex-col justify-end pb-16">
        <FadeIn>
          <h1 className="font-sans text-[clamp(3rem,10vw,10rem)] leading-none font-bold uppercase">
            {settings?.name ?? 'Имя'}
          </h1>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="font-serif text-[clamp(1.2rem,3vw,2rem)] text-white/60 mt-4 italic">
            Звуковой художник и педагог
          </p>
        </FadeIn>
      </section>

      {/* Избранные работы */}
      {works.length > 0 && (
        <section className="py-24">
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
