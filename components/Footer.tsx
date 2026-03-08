export default function Footer({ name, socials }: { name: string; socials: { label: string; url: string }[] }) {
  return (
    <footer style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="footer-inner">
        <span className="footer-copy" style={{ fontSize: 13 }}>
          {name} © {new Date().getFullYear()}
        </span>
        <div className="footer-socials" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {socials?.map(s => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-pill"
              style={{ fontSize: 13, padding: '4px 12px' }}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
