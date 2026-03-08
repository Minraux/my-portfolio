import Header from '@/components/Header'
import ConditionalFooter from '@/components/ConditionalFooter'
import { getSettings } from '@/sanity/lib/queries'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()
  return (
    <>
      <Header />
      <main style={{ paddingTop: '3rem' }}>
        {children}
      </main>
      <ConditionalFooter name={settings?.name ?? ''} socials={settings?.socials ?? []} />
    </>
  )
}
