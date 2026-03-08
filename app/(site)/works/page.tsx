import type { Metadata } from 'next'
import WorksCanvas from '@/components/WorksCanvas'
import { getAllWorks, getSettings } from '@/sanity/lib/queries'

export const metadata: Metadata = { title: 'Работы' }

export default async function WorksPage() {
  const [works, settings] = await Promise.all([getAllWorks(), getSettings()])
  return <WorksCanvas works={works} settings={settings} />
}
