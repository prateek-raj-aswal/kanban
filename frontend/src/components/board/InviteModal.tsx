'use client'
import { useState } from 'react'
import { api, ApiError } from '@/lib/api'
import type { InvitationResponse } from '@/types/api'
import { T } from '@/lib/theme'
import Icon from '@/components/ui/Icon'
import MemberList from './MemberList'

interface Props {
  boardId: string
  onClose: () => void
  currentUserRole?: string
}

export default function InviteModal({ boardId, onClose, currentUserRole }: Props) {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<InvitationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSending(true)
    setError(null)
    try {
      const inv = await api.post<InvitationResponse>(
        `/api/v1/boards/${boardId}/invitations`,
        { email: email.trim() },
      )
      setResult(inv)
      setEmail('')
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const inviteLink = result
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/join?token=${result.token}`
    : null

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 50, backdropFilter: 'blur(2px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: 480,
        background: T.card, color: T.text,
        borderRadius: 12,
        boxShadow: '0 24px 80px rgba(0,0,0,.2)',
        border: `1px solid ${T.cardBorder}`,
        overflow: 'hidden',
        fontSize: 13,
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px 12px',
          borderBottom: `1px solid ${T.cardBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="user" size={14} sw={1.7} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Invite to board</span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, background: 'transparent',
              color: T.textMuted, border: 'none', borderRadius: 6,
              fontSize: 18, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
        </div>

        {/* Body */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Invite form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
            <input
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setResult(null); setError(null) }}
              style={{
                flex: 1, height: 34, padding: '0 10px',
                border: `1px solid ${T.cardBorder}`, borderRadius: 6,
                fontSize: 13, background: T.canvas, color: T.text,
                outline: 'none', fontFamily: 'inherit',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = T.accent }}
              onBlur={e => { e.currentTarget.style.borderColor = T.cardBorder }}
            />
            <button
              type="submit"
              disabled={sending || !email.trim()}
              style={{
                height: 34, padding: '0 14px',
                background: email.trim() ? T.accent : T.chipBg,
                color: email.trim() ? T.accentText : T.textFaint,
                border: 'none', borderRadius: 6,
                fontSize: 12.5, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
              }}
            >
              {sending ? 'Sending…' : 'Send invite'}
            </button>
          </form>

          {/* Error */}
          {error && (
            <div style={{
              fontSize: 12, color: T.danger,
              background: '#fee2e2', padding: '8px 10px', borderRadius: 6,
            }}>
              {error}
            </div>
          )}

          {/* Success: show copy-able link */}
          {inviteLink && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #86efac',
              borderRadius: 8, padding: '10px 12px',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.ok, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="check" size={12} sw={2.2} />
                Invitation sent to {result!.inviteeEmail}
              </div>
              <div style={{ fontSize: 11, color: T.textMuted }}>
                Share this link (expires {new Date(result!.expiresAt).toLocaleDateString()}):
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  readOnly
                  value={inviteLink}
                  style={{
                    flex: 1, height: 28, padding: '0 8px',
                    fontSize: 11, color: T.textMuted,
                    background: T.canvas, border: `1px solid ${T.cardBorder}`,
                    borderRadius: 4, fontFamily: 'monospace', outline: 'none',
                  }}
                  onFocus={e => e.currentTarget.select()}
                />
                <button
                  onClick={() => navigator.clipboard.writeText(inviteLink)}
                  style={{
                    height: 28, padding: '0 8px',
                    background: T.chipBg, color: T.textMuted,
                    border: `1px solid ${T.cardBorder}`, borderRadius: 4,
                    fontSize: 11, cursor: 'pointer', flexShrink: 0,
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <Icon name="link" size={11} sw={1.7} />
                  Copy
                </button>
              </div>
            </div>
          )}

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${T.cardBorder}` }} />

          {/* Members */}
          <MemberList boardId={boardId} currentUserRole={currentUserRole} />
        </div>
      </div>
    </div>
  )
}
