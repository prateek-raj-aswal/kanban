'use client'
import { T } from '@/lib/theme'
import type { SmartCardResponse } from '@/types/api'
import Icon from '@/components/ui/Icon'
import { useIsMobile } from '@/lib/useIsMobile'

const PRIORITY_COLOR: Record<string, string> = {
  URGENT: '#dc2626',
  HIGH: '#d97706',
  MEDIUM: '#2563eb',
  LOW: '#16a34a',
  NONE: '',
}

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

interface Props {
  cards: SmartCardResponse[]
  emptyMessage: string
}

export default function SmartCardList({ cards, emptyMessage }: Props) {
  const isMobile = useIsMobile()

  if (cards.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        paddingTop: 60, paddingLeft: 60, paddingRight: 60,
        paddingBottom: isMobile ? 56 : 60,
        color: T.textFaint, fontSize: 13,
      }}>
        <Icon name="check" size={32} sw={1.5} style={{ marginBottom: 12, opacity: 0.4 }} />
        {emptyMessage}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, paddingBottom: isMobile ? 56 : 0 }}>
      {cards.map(card => (
        <a
          key={card.id}
          href={`/boards/${card.boardId}`}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 16px', background: T.card,
            borderBottom: `1px solid ${T.cardBorder}`,
            textDecoration: 'none', color: T.text,
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = T.hover)}
          onMouseLeave={e => (e.currentTarget.style.background = T.card)}
        >
          {card.priority && card.priority !== 'NONE' && (
            <div style={{
              width: 3, height: 32, borderRadius: 2, flexShrink: 0,
              background: PRIORITY_COLOR[card.priority] || T.textFaint,
            }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 500, color: T.text,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{card.title}</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
              {card.boardName} · {card.columnName}
            </div>
          </div>
          {card.dueDate && (
            <div style={{
              fontSize: 11, fontWeight: 500,
              color: T.textMuted, flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Icon name="clock" size={11} sw={1.5} />
              {formatDate(card.dueDate)}
            </div>
          )}
        </a>
      ))}
    </div>
  )
}
