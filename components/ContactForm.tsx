'use client'
import { useState } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'error'

const inputStyle = {
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid #2a2a2a',
  padding: '10px 0',
  fontSize: 15,
  color: 'white',
  outline: 'none',
  width: '100%',
  fontFamily: 'var(--font-sans)',
  transition: 'border-color 0.1s',
}

export default function ContactForm() {
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

  if (status === 'success') {
    return <p style={{ fontSize: 15, color: '#666' }}>Сообщение отправлено. Отвечу в ближайшее время.</p>
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.15em', color: '#555', textTransform: 'uppercase' }}>Имя</span>
        <input
          type="text"
          required
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          style={inputStyle}
          onFocus={e => { e.currentTarget.style.borderBottomColor = '#666' }}
          onBlur={e => { e.currentTarget.style.borderBottomColor = '#2a2a2a' }}
        />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.15em', color: '#555', textTransform: 'uppercase' }}>Email</span>
        <input
          type="email"
          required
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          style={inputStyle}
          onFocus={e => { e.currentTarget.style.borderBottomColor = '#666' }}
          onBlur={e => { e.currentTarget.style.borderBottomColor = '#2a2a2a' }}
        />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.15em', color: '#555', textTransform: 'uppercase' }}>Сообщение</span>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          style={{ ...inputStyle, resize: 'none' }}
          onFocus={e => { e.currentTarget.style.borderBottomColor = '#666' }}
          onBlur={e => { e.currentTarget.style.borderBottomColor = '#2a2a2a' }}
        />
      </label>
      {status === 'error' && (
        <p style={{ fontSize: 13, color: '#ff4444' }}>Ошибка отправки. Попробуйте ещё раз.</p>
      )}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="nav-pill"
        style={{
          alignSelf: 'flex-start',
          background: 'var(--color-accent)',
          borderColor: 'var(--color-accent)',
          color: 'black',
          opacity: status === 'loading' ? 0.5 : 1,
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
        }}
      >
        {status === 'loading' ? 'Отправка...' : 'Отправить →'}
      </button>
    </form>
  )
}
