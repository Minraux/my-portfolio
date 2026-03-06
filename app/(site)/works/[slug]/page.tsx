import { notFound } from 'next/navigation'
import FadeIn from '@/components/FadeIn'
import { getWork, getAllWorks } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'

export async function generateStaticParams() {
  const works = await getAllWorks()
  return works.map((w: any) => ({ slug: w.slug.current }))
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const work = await getWork(slug)
  if (!work) notFound()

  return (
    <div className="px-6 py-24 max-w-4xl mx-auto">
      <FadeIn>
        <p className="font-sans text-sm uppercase tracking-widest text-white/40 mb-4">
          {work.type} {work.year && `— ${work.year}`} {work.location && `— ${work.location}`}
        </p>
        <h1 className="font-sans text-[clamp(1.5rem,4vw,4rem)] font-bold uppercase mb-6">
          {work.title}
        </h1>
      </FadeIn>

      <FadeIn delay={0.1}>
        {work.mediaType === 'embed' && work.embedCode && (
          <div className="mb-8" dangerouslySetInnerHTML={{ __html: work.embedCode }} />
        )}
        {work.mediaType === 'link' && work.mediaUrl && (
          <a href={work.mediaUrl} target="_blank" rel="noopener noreferrer"
            className="inline-block font-sans text-sm border border-white/20 px-4 py-2 hover:border-white transition-colors duration-300 mb-8">
            Открыть ↗
          </a>
        )}
        {work.mediaType === 'file' && work.mediaFile && (
          <audio controls src={work.mediaFile} className="w-full mb-8" />
        )}
      </FadeIn>

      {work.description && (
        <FadeIn delay={0.15}>
          <p className="font-serif text-xl text-white/80 italic mb-12">{work.description}</p>
        </FadeIn>
      )}

      {work.images?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {work.images.map((img: any, i: number) => (
            <FadeIn key={i} delay={i * 0.05}>
              <img src={urlFor(img).width(1200).url()} alt="" className="w-full" />
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  )
}
