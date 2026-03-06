export default function Footer({ name, socials }: { name: string; socials: { label: string; url: string }[] }) {
  return (
    <footer className="border-t border-white/10 px-6 py-8 flex items-center justify-between">
      <span className="font-sans text-sm text-white/40">{name} © {new Date().getFullYear()}</span>
      <div className="flex gap-4">
        {socials?.map(s => (
          <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer"
            className="font-sans text-sm text-white/40 hover:text-white transition-colors duration-300">
            {s.label}
          </a>
        ))}
      </div>
    </footer>
  )
}
