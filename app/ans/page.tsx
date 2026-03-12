'use client'

import { useEffect, useRef, useState } from 'react'

export default function AnsPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const loadAns = async () => {
      try {
        const res = await fetch('/ans.html')
        const html = await res.text()
        
        if (containerRef.current) {
          // Parse HTML
          const parser = new DOMParser()
          const doc = parser.parseFromString(html, 'text/html')
          
          // Get styles and inject
          const styles = Array.from(doc.querySelectorAll('style'))
          styles.forEach(style => {
            const newStyle = document.createElement('style')
            newStyle.textContent = style.textContent
            document.head.appendChild(newStyle)
          })
          
          // Set body classes and styles
          document.body.style.margin = '0'
          document.body.style.padding = '0'
          document.body.style.boxSizing = 'border-box'
          
          // Get all scripts and execute in order
          const scripts = Array.from(doc.querySelectorAll('script'))
          
          for (const script of scripts) {
            const newScript = document.createElement('script')
            
            // Copy attributes
            for (const attr of script.attributes) {
              newScript.setAttribute(attr.name, attr.value)
            }
            
            if (script.src) {
              // External script - wait for load
              await new Promise((resolve, reject) => {
                newScript.onload = resolve
                newScript.onerror = reject
                document.head.appendChild(newScript)
              })
            } else {
              // Inline script
              newScript.textContent = script.textContent
              document.head.appendChild(newScript)
            }
          }
          
          setLoaded(true)
        }
      } catch (err) {
        console.error('Error loading ANS:', err)
      }
    }

    loadAns()
    
    return () => {
      // Cleanup on unmount
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [])

  return (
    <div ref={containerRef} style={{ minHeight: '100vh' }}>
      {!loaded && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          fontFamily: 'Barlow, Helvetica, Arial, sans-serif',
          color: '#1A1916',
          background: '#E8E4DC'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '16px', fontWeight: 500, letterSpacing: '0.2em' }}>АНС</div>
            <div style={{ fontSize: '12px', color: '#A4A09A', letterSpacing: '0.1em' }}>Загрузка синтезатора...</div>
          </div>
        </div>
      )}
    </div>
  )
}
