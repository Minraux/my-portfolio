export const revalidate = 300

import type { Metadata } from 'next'
import { getAllPosts, getSettings } from '@/sanity/lib/queries'
import PublicationsCanvas from '@/components/PublicationsCanvas'

export const metadata: Metadata = { title: 'Публикации' }

export default async function PublicationsPage() {
  const [posts, settings] = await Promise.all([getAllPosts(), getSettings()])
  return <PublicationsCanvas posts={posts} settings={settings} />
}
