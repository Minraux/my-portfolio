'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { urlFor } from '@/sanity/lib/image'

type Work = {
  _id: string
  title: string
  slug: { current: string }
  type: string
  year: number
  image?: any
}

export default function WorkCard({ work }: { work: Work }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/works/${work.slug.current}`} className="group block">
        <div className="overflow-hidden bg-white/5 aspect-video mb-3">
          {work.image && (
            <motion.img
              src={urlFor(work.image).width(800).url()}
              alt={work.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </div>
        <div className="flex items-baseline justify-between">
          <h3 className="font-sans text-lg group-hover:text-accent transition-colors duration-300">
            {work.title}
          </h3>
          <span className="font-sans text-sm text-white/40">{work.year}</span>
        </div>
        <p className="font-sans text-sm text-white/40 mt-1 uppercase tracking-wider">{work.type}</p>
      </Link>
    </motion.div>
  )
}
