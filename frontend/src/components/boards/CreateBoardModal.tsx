'use client'
import { useState } from 'react'
import { T } from '@/lib/theme'

interface Props {
  onClose: () => void
  onCreate: (name: string, description?: string) => Promise<void>
}

export default function CreateBoardModal({ onClose, onCreate }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onCreate(name, description.trim() || undefined)
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    height: 38, padding: '0 12px',
    border: `1px solid ${T.cardBorder}`, borderRadius: 7,
    fontSize: 13, background: T.card, color: T.text,
    outline: 'none', width: '100%', boxSizing: 'border-box',
  }

  const textareaStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: `1px solid ${T.cardBorder}`, borderRadius: 7,
    fontSize: 13, background: T.card, color: T.text,
    outline: 'none', width: '100%', boxSizing: 'border-box',
    resize: 'vertical', minHeight: 72,
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }}>
      <div style={{
        background: T.card, borderRadius: 12,
        border: `1px solid ${T.cardBorder}`,
        boxShadow: '0 4px 24px rgba(15,23,42,.12)',
        padding: '24px 28px', width: '100%', maxWidth: 420,
        margin: '0 16px',
      }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 700, color: T.text }}>
          Create Board
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: T.text }}>Name</label>
            <input
              type="text"
              placeholder="Board name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: T.text }}>
              Description <span style={{ color: T.textMuted, fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={textareaStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                height: 36, padding: '0 16px',
                background: 'transparent', color: T.text,
                border: `1px solid ${T.cardBorder}`, borderRadius: 7,
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              style={{
                height: 36, padding: '0 16px',
                background: loading ? T.accentSoft : T.accent,
                color: loading ? T.accent : T.accentText,
                border: 'none', borderRadius: 7,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'background .15s',
              }}
            >
              {loading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
