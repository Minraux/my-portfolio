import { PortableText } from '@portabletext/react'
import FadeIn from '@/components/FadeIn'
import { getAllTeaching } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'

export default async function TeachingPage() {
  const items = await getAllTeaching()

  return (
    <div className="px-6 py-24">
      <FadeIn>
        <h1 className="font-sans text-[clamp(2rem,6vw,6rem)] font-bold uppercase mb-16">
          Педагогика
        </h1>
      </FadeIn>

      <div className="space-y-24">
        {items.map((item: any, i: number) => (
          <FadeIn key={item._id} delay={i * 0.05}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/10 pt-8">
              <div>
                <h2 className="font-sans text-2xl font-bold mb-2">{item.title}</h2>
                {item.dates && <p className="font-sans text-sm text-white/40 mb-1">{item.dates}</p>}
                {item.location && <p className="font-sans text-sm text-white/40 mb-4">{item.location}</p>}
                {item.description && (
                  <div className="font-serif text-lg text-white/70 [&_p]:mb-3">
                    <PortableText value={item.description} />
                  </div>
                )}
              </div>
              {item.images?.[0] && (
                <img
                  src={urlFor(item.images[0]).width(800).url()}
                  alt={item.title}
                  className="w-full object-cover"
                />
              )}
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  )
}
