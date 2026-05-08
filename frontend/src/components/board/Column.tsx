'use client'
import { useState, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { api, ApiError } from '@/lib/api'
import { T } from '@/lib/theme'
import type { ColumnResponse, CardResponse } from '@/types/api'
import CardItem from './CardItem'
import Icon from '@/components/ui/Icon'

interface Props {
  column: ColumnResponse
  onDeleteColumn: (id: string) => void
  onSelectCard?: (card: CardResponse) => void
  onAddCard?: (columnId: string, card: CardResponse) => void
}

export default function Column({ column, onDeleteColumn, onSelectCard, onAddCard }: Props) {
  const cards = column.cards ?? []
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { setNodeRef } = useDroppable({ id: column.id })

  useEffect(() => {
    if (showAdd) textareaRef.current?.focus()
  }, [showAdd])

  function handleDelete() {
    if (window.confirm(`Delete column "${column.name}" and all its cards?`)) {
      onDeleteColumn(column.id)
    }
  }

  async function handleAddCard(e: React.FormEvent) {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title) return
    setSubmitting(true)
    try {
      const card = await api.post<CardResponse>(`/api/v1/columns/${column.id}/cards`, { title })
      onAddCard?.(column.id, card)
      setNewTitle('')
      setShowAdd(false)
    } catch (err) {
      if (err instanceof ApiError) alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleCancelAdd() {
    setNewTitle('')
    setShowAdd(false)
  }

  return (
    <div style={{
      width: 268, flexShrink: 0,
      background: T.column,
      borderRadius: 8,
      display: 'flex', flexDirection: 'column',
      maxHeight: '100%',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 12px 8px',
        display: 'flex', alignItems: 'center', gap: 8,
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 12, fontWeight: 600,
          color: T.text, letterSpacing: '-.005em',
        }}>{column.name}</span>
        <span style={{
          fontSize: 11, color: T.textFaint,
          fontVariantNumeric: 'tabular-nums', fontWeight: 500,
        }}>{cards.length}</span>
        <span style={{ flex: 1 }} />
        <Icon
          name="plus" size={13} sw={2}
          style={{ color: T.textMuted, cursor: 'pointer' }}
          onClick={() => setShowAdd(true)}
        />
        <button
          onClick={handleDelete}
          title={`Delete "${column.name}"`}
          style={{
            background: 'none', border: 'none', padding: 0,
            cursor: 'pointer', color: T.textMuted,
            display: 'flex', alignItems: 'center',
          }}
        >
          <Icon name="more" size={14} sw={2} />
        </button>
      </div>

      {/* Cards */}
      <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          style={{
            padding: '0 10px 10px',
            display: 'flex', flexDirection: 'column',
            gap: 8,
            overflowY: 'auto',
            flex: 1,
            minHeight: 40,
          }}
        >
          {cards.length === 0 && !showAdd && (
            <div style={{
              padding: '20px 8px',
              fontSize: 11.5, color: T.textFaint,
              textAlign: 'center',
            }}>No cards</div>
          )}
          {cards.map(card => (
            <CardItem
              key={card.id}
              card={card}
              onClick={() => onSelectCard?.(card)}
            />
          ))}

          {/* Inline add card form */}
          {showAdd ? (
            <form onSubmit={handleAddCard} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <textarea
                ref={textareaRef}
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard(e as unknown as React.FormEvent) }
                  if (e.key === 'Escape') handleCancelAdd()
                }}
                placeholder="Card title…"
                rows={2}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '8px 10px',
                  fontSize: 13, lineHeight: 1.4,
                  border: `1px solid ${T.accent}`,
                  borderRadius: 6,
                  background: T.card, color: T.text,
                  resize: 'none', outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="submit"
                  disabled={!newTitle.trim() || submitting}
                  style={{
                    flex: 1, height: 28,
                    background: newTitle.trim() ? T.accent : T.chipBg,
                    color: newTitle.trim() ? T.accentText : T.textFaint,
                    border: 'none', borderRadius: 6,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >Add card</button>
                <button
                  type="button"
                  onClick={handleCancelAdd}
                  style={{
                    width: 28, height: 28,
                    background: 'transparent', color: T.textMuted,
                    border: `1px solid ${T.cardBorder}`, borderRadius: 6,
                    fontSize: 16, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >×</button>
              </div>
            </form>
          ) : (
            <div
              onClick={() => setShowAdd(true)}
              style={{
                padding: '6px 8px',
                fontSize: 12, color: T.textMuted,
                cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 5,
                borderRadius: 6, marginTop: 2,
              }}
            >
              <Icon name="plus" size={12} sw={1.8} />
              Add card
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}
