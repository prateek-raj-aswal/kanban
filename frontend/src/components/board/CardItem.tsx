'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { T, darkenHex } from '@/lib/theme'
import type { CardResponse } from '@/types/api'
import Icon from '@/components/ui/Icon'

interface Props {
  card: CardResponse
  onClick?: () => void
}

function LabelPill({ name, color }: { name: string; color: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 10.5, fontWeight: 600, letterSpacing: '.02em',
      padding: '2px 7px', borderRadius: 4,
      background: color + '28',
      color: darkenHex(color, 0.12),
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {name}
    </span>
  )
}

export default function CardItem({ card, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id })

  const isOverdue = card.dueDate ? new Date(card.dueDate) < new Date() : false
  const hasMeta = card.dueDate || card.assigneeId

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      style={{
        background: T.card,
        border: `1px solid ${T.cardBorder}`,
        borderRadius: 8,
        boxShadow: isDragging ? 'none' : T.cardShadow,
        padding: 12,
        display: 'flex', flexDirection: 'column', gap: 8,
        cursor: isDragging ? 'grabbing' : 'pointer',
        position: 'relative',
        transition: transition || 'box-shadow .12s',
        transform: CSS.Transform.toString(transform) ?? undefined,
        opacity: isDragging ? 0.4 : 1,
        touchAction: 'none',
      }}
    >
      {/* Labels */}
      {card.labels.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {card.labels.map(l => <LabelPill key={l.id} name={l.name} color={l.color} />)}
        </div>
      )}

      {/* Title */}
      <div style={{
        fontSize: 13, lineHeight: 1.4, fontWeight: 500,
        color: T.text,
      }}>{card.title}</div>

      {/* Meta row */}
      {hasMeta && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 11.5, color: T.textMuted,
        }}>
          {card.dueDate && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontWeight: 500,
              color: isOverdue ? T.danger : T.textMuted,
              background: isOverdue ? '#fee2e2' : 'transparent',
              padding: isOverdue ? '1px 6px' : 0,
              borderRadius: 4,
            }}>
              <Icon name="clock" size={11} sw={1.6} />
              {card.dueDate}
            </span>
          )}
          <span style={{ flex: 1 }} />
          {card.assigneeId && (
            <span style={{
              width: 20, height: 20, borderRadius: '50%',
              background: T.accentSoft, color: T.accent,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon name="user" size={10} sw={1.5} />
            </span>
          )}
        </div>
      )}

      {/* Card short ID */}
      <span style={{
        position: 'absolute', top: 6, right: 8,
        fontSize: 9.5, color: T.textFaint,
        fontVariantNumeric: 'tabular-nums', fontWeight: 500, letterSpacing: '.04em',
      }}>{card.id.slice(0, 8).toUpperCase()}</span>
    </div>
  )
}
