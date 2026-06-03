'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { LoginResponse } from '@/types/api'
import { T } from '@/lib/theme'

export default function LoginForm() {
  const router = useRouter()
  const storeSetTokenPair = useAuthStore(s => s.setTokenPair)
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.post<LoginResponse>('/api/v1/auth/login', form)
      storeSetTokenPair(res.accessToken, res.refreshToken, res.expiresIn)
      router.push('/boards')
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    height: 38, padding: '0 12px',
    border: `1px solid ${T.cardBorder}`, borderRadius: 7,
    fontSize: 13, background: T.card, color: T.text,
    outline: 'none', width: '100%',
  }

  return (
    <div style={{
      minHeight: '100vh', background: T.canvas,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 11,
            background: T.accent, color: T.accentText,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, marginBottom: 16,
          }}>K</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.text, letterSpacing: '-.02em' }}>
            Welcome back
          </div>
          <div style={{ fontSize: 13.5, color: T.textMuted, marginTop: 6 }}>
            Sign in to your account
          </div>
        </div>

        <div style={{
          background: T.card, borderRadius: 12,
          border: `1px solid ${T.cardBorder}`,
          boxShadow: '0 4px 24px rgba(15,23,42,.06)',
          padding: '28px 28px 24px',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div style={{
                padding: '10px 14px', background: '#fee2e2', borderRadius: 8,
                color: T.danger, fontSize: 13, border: '1px solid #fca5a5',
              }}>{error}</div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: T.text }}>Email</label>
              <input
                type="email" value={form.email} required
                placeholder="you@example.com"
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: T.text }}>Password</label>
              <input
                type="password" value={form.password} required
                placeholder="••••••••"
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                style={inputStyle}
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                height: 40, background: loading ? T.accentSoft : T.accent,
                color: loading ? T.accent : T.accentText,
                border: 'none', borderRadius: 8,
                fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                marginTop: 4, transition: 'background .15s',
              }}
            >{loading ? 'Signing in…' : 'Sign in'}</button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: T.textMuted }}>
          Don&apos;t have an account?{' '}
          <a href="/register" style={{ color: T.accent, fontWeight: 500 }}>Create one</a>
        </p>
      </div>
    </div>
  )
}
