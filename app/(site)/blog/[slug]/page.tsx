import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import FadeIn from '@/components/FadeIn'
import { getPost, getAllPosts } from '@/sanity/lib/queries'

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((p: any) => ({ slug: p.slug.current }))
}

const components = {
  types: {
    image: ({ value }: any) => (
      <img src={value.url} alt="" className="w-full my-8" />
    ),
    embed: ({ value }: any) => (
      <div className="my-8" dangerouslySetInnerHTML={{ __html: value.code }} />
    ),
  },
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <article className="px-6 py-24 max-w-2xl mx-auto">
      <FadeIn>
        {post.publishedAt && (
          <p className="font-sans text-sm text-white/40 mb-4">
            {new Date(post.publishedAt).toLocaleDateString('ru-RU')}
          </p>
        )}
        <h1 className="font-sans text-[clamp(2rem,5vw,4rem)] font-bold uppercase mb-12">
          {post.title}
        </h1>
      </FadeIn>
      <FadeIn delay={0.1}>
        <div className="font-serif text-xl text-white/80 leading-relaxed [&_p]:mb-6 [&_h2]:font-sans [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-12 [&_h2]:mb-4">
          <PortableText value={post.body} components={components} />
        </div>
      </FadeIn>
      {post.tags?.length > 0 && (
        <FadeIn delay={0.15}>
          <div className="flex gap-2 mt-12">
            {post.tags.map((tag: string) => (
              <span key={tag} className="font-sans text-xs border border-white/20 px-3 py-1 text-white/40">
                {tag}
              </span>
            ))}
          </div>
        </FadeIn>
      )}
    </article>
  )
}
