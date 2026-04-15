'use client'

import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('[SoomosNova] Global error boundary:', error)
  }, [error])

  return (
    <html lang="es-MX">
      <body style={{ margin: 0, background: '#0A0A0A', color: '#FFFFFF', fontFamily: 'Georgia, serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <span style={{ color: '#C9A84C', fontSize: '2rem', marginBottom: '1.5rem' }}>✦</span>

          <p style={{ color: '#ef4444', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Error crítico
          </p>

          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', color: '#FFFFFF' }}>
            SoomosNova no pudo cargar
          </h1>

          <div style={{ width: '4rem', height: '1px', background: 'rgba(201,168,76,0.4)', margin: '0 auto 1.5rem' }} />

          <p style={{ color: '#9CA3AF', maxWidth: '24rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Ocurrió un error crítico en la aplicación. Por favor, intentá de nuevo.
          </p>

          <button
            onClick={reset}
            style={{
              background: '#C9A84C',
              color: '#0A0A0A',
              fontWeight: '600',
              fontSize: '0.875rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  )
}
