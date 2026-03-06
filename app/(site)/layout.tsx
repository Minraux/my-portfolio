import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getSettings } from '@/sanity/lib/queries'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()
  return (
    <>
      <Header name={settings?.name ?? 'Portfolio'} />
      <main className="min-h-screen pt-16">{children}</main>
      <Footer name={settings?.name ?? ''} socials={settings?.socials ?? []} />
    </>
  )
}
