import { getAllPosts, getSettings } from '@/sanity/lib/queries'
import PublicationsCanvas from '@/components/PublicationsCanvas'

export default async function PublicationsPage() {
  const [posts, settings] = await Promise.all([getAllPosts(), getSettings()])
  return <PublicationsCanvas posts={posts} settings={settings} />
}
