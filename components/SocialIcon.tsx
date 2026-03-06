type IconType = 'telegram' | 'instagram' | 'youtube'

const icons: Record<IconType, React.FC<{ size: number }>> = {
  telegram: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 5L2 12.5l7 1M21 5l-5 15-4.5-6.5M21 5L9 13.5m0 0L9.5 19.5" />
    </svg>
  ),
  instagram: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  ),
  youtube: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <polygon points="10,9 10,15 16,12" fill="currentColor" stroke="none" />
    </svg>
  ),
}

export default function SocialIcon({ icon, size = 20 }: { icon: string; size?: number }) {
  const Icon = icons[icon as IconType]
  if (!Icon) return null
  return <Icon size={size} />
}
