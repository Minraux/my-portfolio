import Link from 'next/link'
import FadeIn from '@/components/FadeIn'
import { getAllPosts } from '@/sanity/lib/queries'

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="px-6 py-24 max-w-3xl mx-auto">
      <FadeIn>
        <h1 className="font-sans text-[clamp(2rem,6vw,6rem)] font-bold uppercase mb-16">Блог</h1>
      </FadeIn>
      <ul className="space-y-0 divide-y divide-white/10">
        {posts.map((post: any, i: number) => (
          <FadeIn key={post._id} delay={i * 0.04}>
            <li>
              <Link href={`/blog/${post.slug.current}`}
                className="group flex items-baseline justify-between py-6 hover:text-accent transition-colors duration-300">
                <span className="font-sans text-xl font-medium">{post.title}</span>
                <span className="font-sans text-sm text-white/40 ml-4 shrink-0">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('ru-RU') : ''}
                </span>
              </Link>
            </li>
          </FadeIn>
        ))}
      </ul>
    </div>
  )
}
