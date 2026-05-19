'use client'
import { useState } from 'react'
import type { BoardResponse } from '@/types/api'
import { api } from '@/lib/api'
import { T } from '@/lib/theme'
import Icon from '@/components/ui/Icon'

interface Props {
  board: BoardResponse
  onDelete: (id: string) => void
  isStarred?: boolean
}

const BOARD_COLORS = ['#6366f1', '#0ea5e9', '#f59e0b', '#ec4899', '#16a34a', '#dc2626', '#8b5cf6', '#0d9488']

function pickColor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h)
  return BOARD_COLORS[Math.abs(h) % BOARD_COLORS.length]
}

export default function BoardCard({ board, onDelete, isStarred: initialStarred = false }: Props) {
  const [starred, setStarred] = useState(initialStarred)
  const color = pickColor(board.id)
  const initial = board.name.charAt(0).toUpperCase()

  async function toggleStar(e: React.MouseEvent) {
    e.preventDefault()
    const next = !starred
    setStarred(next)
    try {
      if (next) await api.post(`/api/v1/boards/${board.id}/star`, {})
      else await api.delete(`/api/v1/boards/${board.id}/star`)
    } catch {
      setStarred(!next)
    }
  }

  return (
    <a
      href={`/boards/${board.id}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px',
        background: T.card,
        border: `1px solid ${T.cardBorder}`,
        borderRadius: 8,
        boxShadow: T.cardShadow,
        cursor: 'pointer',
        color: 'inherit',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: color + '20', color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 700, flexShrink: 0,
      }}>{initial}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{board.name}</div>
        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
          {board.role === 'OWNER' ? 'Owner' : 'Member'}
        </div>
      </div>

      <button
        onClick={toggleStar}
        title={starred ? 'Unstar board' : 'Star board'}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: starred ? '#f59e0b' : T.textFaint, padding: '4px',
          display: 'inline-flex', alignItems: 'center', borderRadius: 4,
        }}
      >
        <Icon name="star" size={14} sw={starred ? 0 : 1.8} fill={starred ? '#f59e0b' : 'none'} />
      </button>
      {board.role === 'OWNER' && (
        <button
          onClick={e => { e.preventDefault(); onDelete(board.id) }}
          title="Delete board"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: T.textFaint, padding: '4px',
            display: 'inline-flex', alignItems: 'center', borderRadius: 4,
          }}
        >
          <Icon name="more" size={14} sw={2} />
        </button>
      )}
      <Icon name="chevron" size={12} sw={2} style={{ color: T.textFaint, flexShrink: 0 }} />
    </a>
  )
}
