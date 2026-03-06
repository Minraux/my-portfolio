'use client'
import { useState } from 'react'
import FadeIn from '@/components/FadeIn'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ContactPage() {
  const [status, setStatus] = useState<Status>('idle')
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="px-6 py-24 max-w-xl mx-auto">
      <FadeIn>
        <h1 className="font-sans text-[clamp(1.5rem,4vw,3rem)] font-bold uppercase mb-12">
          Контакт
        </h1>
      </FadeIn>

      {status === 'success' ? (
        <FadeIn>
          <p className="font-serif text-lg text-white/70 italic">
            Сообщение отправлено. Отвечу в ближайшее время.
          </p>
        </FadeIn>
      ) : (
        <FadeIn delay={0.1}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <label className="flex flex-col gap-2">
              <span className="font-sans text-xs uppercase tracking-widest text-white/40">Имя</span>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="bg-transparent border-b border-white/20 py-2 font-sans text-base outline-none focus:border-white/60 transition-colors duration-300"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-sans text-xs uppercase tracking-widest text-white/40">Email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="bg-transparent border-b border-white/20 py-2 font-sans text-base outline-none focus:border-white/60 transition-colors duration-300"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-sans text-xs uppercase tracking-widest text-white/40">Сообщение</span>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="bg-transparent border-b border-white/20 py-2 font-sans text-base outline-none focus:border-white/60 transition-colors duration-300 resize-none"
              />
            </label>
            {status === 'error' && (
              <p className="font-sans text-sm text-red-400">Ошибка отправки. Попробуйте ещё раз.</p>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="font-sans text-sm uppercase tracking-widest border border-white/30 px-6 py-3 hover:border-white transition-colors duration-300 disabled:opacity-50 self-start"
            >
              {status === 'loading' ? 'Отправка...' : 'Отправить →'}
            </button>
          </form>
        </FadeIn>
      )}
    </div>
  )
}
