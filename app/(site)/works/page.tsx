import WorksCanvas from '@/components/WorksCanvas'
import { getAllWorks, getSettings } from '@/sanity/lib/queries'

export default async function WorksPage() {
  const [works, settings] = await Promise.all([getAllWorks(), getSettings()])
  return <WorksCanvas works={works} settings={settings} />
}
