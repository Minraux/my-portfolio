import FadeIn from '@/components/FadeIn'
import WorkCard from '@/components/WorkCard'
import { getAllWorks } from '@/sanity/lib/queries'

export default async function WorksPage() {
  const works = await getAllWorks()

  return (
    <div className="px-6 py-24">
      <FadeIn>
        <h1 className="font-sans text-[clamp(2rem,6vw,6rem)] font-bold uppercase mb-16">
          Работы
        </h1>
      </FadeIn>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {works.map((work: any, i: number) => (
          <FadeIn key={work._id} delay={i * 0.05}>
            <WorkCard work={work} />
          </FadeIn>
        ))}
      </div>
    </div>
  )
}
