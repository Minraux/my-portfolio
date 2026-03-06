import { PortableText } from '@portabletext/react'
import FadeIn from '@/components/FadeIn'
import { getAbout } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'

export default async function AboutPage() {
  const about = await getAbout()

  return (
    <div className="px-6 py-24 max-w-3xl mx-auto">
      <FadeIn>
        <h1 className="font-sans text-[clamp(2rem,6vw,6rem)] font-bold uppercase mb-16">
          О себе
        </h1>
      </FadeIn>

      {about?.photo && (
        <FadeIn delay={0.05}>
          <img
            src={urlFor(about.photo).width(800).url()}
            alt="Фото"
            className="w-full max-w-sm mb-12"
          />
        </FadeIn>
      )}

      {about?.bio && (
        <FadeIn delay={0.1}>
          <div className="font-serif text-xl text-white/80 leading-relaxed prose-invert [&_p]:mb-4">
            <PortableText value={about.bio} />
          </div>
        </FadeIn>
      )}

      {about?.cv && (
        <FadeIn delay={0.15}>
          <a
            href={about.cv}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-12 font-sans text-sm border border-white/20 px-6 py-3 hover:border-white transition-colors duration-300"
          >
            Скачать CV ↓
          </a>
        </FadeIn>
      )}
    </div>
  )
}
