'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import { T } from '@/lib/theme'

function JoinContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = params.get('token')
    if (!token) {
      setError('No invitation token provided.')
      return
    }
    api.post('/api/v1/invitations/accept', { token })
      .then(() => router.replace('/boards'))
      .catch(err => {
        if (err instanceof ApiError) setError(err.message)
        else setError('Failed to accept invitation.')
      })
  }, [params, router])

  if (error) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: T.canvas,
        fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      }}>
        <div style={{
          background: T.card, border: `1px solid ${T.cardBorder}`,
          borderRadius: 12, padding: '32px 40px', maxWidth: 400, textAlign: 'center',
          boxShadow: '0 8px 40px rgba(0,0,0,.12)',
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: T.danger, marginBottom: 8 }}>
            Invitation error
          </div>
          <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>{error}</div>
          <a href="/boards" style={{
            display: 'inline-block', padding: '8px 18px',
            background: T.accent, color: T.accentText,
            borderRadius: 6, fontSize: 13, fontWeight: 600,
            textDecoration: 'none',
          }}>
            Go to boards
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: T.canvas,
      fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      fontSize: 13, color: T.textMuted,
    }}>
      Joining board…
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: T.canvas,
        fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        fontSize: 13, color: T.textMuted,
      }}>
        Loading…
      </div>
    }>
      <JoinContent />
    </Suspense>
  )
}
