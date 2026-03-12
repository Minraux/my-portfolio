'use client'

import { useEffect, useRef, useState } from 'react'

export default function AnsPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const loadAns = async () => {
      try {
        const res = await fetch('/ans.html')
        const html = await res.text()
        
        if (iframeRef.current) {
          const iframe = iframeRef.current
          const doc = iframe.contentDocument || iframe.contentWindow?.document
          
          if (doc) {
            doc.open()
            doc.write(html)
            doc.close()
            
            // Wait for iframe to fully load
            await new Promise<void>((resolve) => {
              if (iframe.contentWindow?.document.readyState === 'complete') {
                resolve()
              } else {
                iframe.onload = () => resolve()
              }
            })
            
            setLoaded(true)
          }
        }
      } catch (err) {
        console.error('Error loading ANS:', err)
      }
    }

    loadAns()
  }, [])

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      {!loaded && (
        <div style={{ 
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontFamily: 'Barlow, Helvetica, Arial, sans-serif',
          color: '#1A1916',
          background: '#E8E4DC',
          zIndex: 10
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '16px', fontWeight: 500, letterSpacing: '0.2em' }}>АНС</div>
            <div style={{ fontSize: '12px', color: '#A4A09A', letterSpacing: '0.1em' }}>Загрузка синтезатора...</div>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: loaded ? 'block' : 'none'
        }}
        title="АНС Синтезатор"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  )
}
