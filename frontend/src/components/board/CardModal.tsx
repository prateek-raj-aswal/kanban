'use client'
import { useEffect, useState } from 'react'
import { api, ApiError } from '@/lib/api'
import { T, darkenHex } from '@/lib/theme'
import type { CardResponse, LabelResponse } from '@/types/api'
import Icon from '@/components/ui/Icon'

interface Props {
  card: CardResponse
  columnName: string
  boardId: string
  onClose: () => void
  onUpdate: (updated: CardResponse) => void
  onDelete: (cardId: string) => void
}

function LabelPill({ name, color, selected, onClick }: {
  name: string; color: string; selected?: boolean; onClick?: () => void
}) {
  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center',
        fontSize: 10.5, fontWeight: 600, letterSpacing: '.02em',
        padding: '2px 7px', borderRadius: 4,
        background: selected ? color + '50' : color + '28',
        color: darkenHex(color, 0.12),
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        cursor: onClick ? 'pointer' : 'default',
        outline: selected ? `2px solid ${color}` : 'none',
        outlineOffset: 1,
        userSelect: 'none',
      }}
    >
      {name}
    </span>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em',
      color: T.textFaint, textTransform: 'uppercase', marginBottom: 8,
    }}>{children}</div>
  )
}

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{
        fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em',
        color: T.textFaint, textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{ fontSize: 12.5, color: T.text }}>{children}</div>
    </div>
  )
}

export default function CardModal({ card, columnName, boardId, onClose, onUpdate, onDelete }: Props) {
  const shortId = card.id.slice(0, 8).toUpperCase()

  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description ?? '')
  const [dueDate, setDueDate] = useState(card.dueDate ?? '')
  const [selectedLabelIds, setSelectedLabelIds] = useState<Set<string>>(
    new Set(card.labels.map(l => l.id))
  )
  const [boardLabels, setBoardLabels] = useState<LabelResponse[]>([])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [dirty, setDirty] = useState(false)

  const isOverdue = dueDate ? new Date(dueDate) < new Date() : false

  useEffect(() => {
    api.get<LabelResponse[]>(`/api/v1/boards/${boardId}/labels`)
      .then(setBoardLabels)
      .catch(() => {})
  }, [boardId])

  function toggleLabel(labelId: string) {
    setSelectedLabelIds(prev => {
      const next = new Set(prev)
      if (next.has(labelId)) next.delete(labelId)
      else next.add(labelId)
      return next
    })
    setDirty(true)
  }

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    try {
      const updated = await api.patch<CardResponse>(`/api/v1/cards/${card.id}`, {
        title: title.trim(),
        description: description || null,
        dueDate: dueDate || null,
        assigneeId: card.assigneeId,
        labelIds: Array.from(selectedLabelIds),
      })
      onUpdate(updated)
      setDirty(false)
    } catch (err) {
      if (err instanceof ApiError) alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this card?')) return
    setDeleting(true)
    try {
      await api.delete(`/api/v1/cards/${card.id}`)
      onDelete(card.id)
    } catch (err) {
      if (err instanceof ApiError) alert(err.message)
      setDeleting(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 50,
        backdropFilter: 'blur(2px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: 720,
        maxHeight: '88vh',
        background: T.card,
        color: T.text,
        borderRadius: 12,
        boxShadow: '0 24px 80px rgba(0,0,0,.2), 0 1px 0 rgba(255,255,255,.04) inset',
        border: `1px solid ${T.cardBorder}`,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        fontSize: 13,
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px 12px',
          borderBottom: `1px solid ${T.cardBorder}`,
          display: 'flex', alignItems: 'flex-start', gap: 12,
          flexShrink: 0,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, color: T.textFaint, marginBottom: 8,
            }}>
              <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, letterSpacing: '.04em' }}>
                {shortId}
              </span>
              <Icon name="chevron" size={9} sw={2} />
              <span>{columnName}</span>
            </div>
            <input
              value={title}
              onChange={e => { setTitle(e.target.value); setDirty(true) }}
              style={{
                width: '100%', boxSizing: 'border-box',
                fontSize: 18, fontWeight: 600,
                color: T.text, letterSpacing: '-.01em',
                background: 'transparent', border: 'none', outline: 'none',
                fontFamily: 'inherit', padding: 0,
                borderBottom: `1px solid transparent`,
              }}
              onFocus={e => { e.currentTarget.style.borderBottomColor = T.accent }}
              onBlur={e => { e.currentTarget.style.borderBottomColor = 'transparent' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            {dirty && (
              <button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                style={{
                  height: 28, padding: '0 10px',
                  background: T.accent, color: T.accentText,
                  border: 'none', borderRadius: 6,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >{saving ? 'Saving…' : 'Save'}</button>
            )}
            <button
              onClick={handleDelete}
              disabled={deleting}
              title="Delete card"
              style={{
                height: 28, padding: '0 9px',
                background: 'transparent', color: T.danger,
                border: `1px solid ${T.cardBorder}`, borderRadius: 6,
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}
            >
              <Icon name="trash" size={12} sw={1.6} />
            </button>
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
        </div>

        {/* Body */}
        <div style={{ display: 'flex', minHeight: 0, flex: 1, overflow: 'hidden' }}>
          {/* Left: description + labels */}
          <div style={{
            flex: 1, padding: '18px 22px', display: 'flex', flexDirection: 'column',
            gap: 22, minWidth: 0, overflowY: 'auto',
          }}>
            <div>
              <SectionLabel>Description</SectionLabel>
              <textarea
                value={description}
                onChange={e => { setDescription(e.target.value); setDirty(true) }}
                placeholder="Add a description…"
                rows={4}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  fontSize: 13.5, lineHeight: 1.55,
                  color: T.text, background: T.canvas,
                  border: `1px solid ${T.cardBorder}`, borderRadius: 6,
                  padding: '8px 10px', resize: 'vertical',
                  outline: 'none', fontFamily: 'inherit',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = T.accent }}
                onBlur={e => { e.currentTarget.style.borderColor = T.cardBorder }}
              />
            </div>

            {boardLabels.length > 0 && (
              <div>
                <SectionLabel>Labels</SectionLabel>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {boardLabels.map(l => (
                    <LabelPill
                      key={l.id}
                      name={l.name}
                      color={l.color}
                      selected={selectedLabelIds.has(l.id)}
                      onClick={() => toggleLabel(l.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: properties */}
          <div style={{
            width: 220, flexShrink: 0,
            padding: 18,
            background: T.canvas,
            borderLeft: `1px solid ${T.cardBorder}`,
            display: 'flex', flexDirection: 'column', gap: 16,
            fontSize: 12, overflowY: 'auto',
          }}>
            <PropRow label="Status">
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 8px', borderRadius: 4,
                background: T.selectedBg, color: T.selectedText,
                fontSize: 11.5, fontWeight: 600,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.selectedText }} />
                {columnName}
              </span>
            </PropRow>

            <PropRow label="Due date">
              <input
                type="date"
                value={dueDate}
                onChange={e => { setDueDate(e.target.value); setDirty(true) }}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  height: 28, padding: '0 6px',
                  fontSize: 12, fontWeight: 500,
                  color: isOverdue ? T.danger : T.text,
                  background: isOverdue ? '#fee2e2' : T.card,
                  border: `1px solid ${T.cardBorder}`, borderRadius: 4,
                  outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
                }}
              />
            </PropRow>

            {card.assigneeId && (
              <PropRow label="Assignee">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: T.accentSoft, color: T.accent,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon name="user" size={10} sw={1.5} />
                  </span>
                  <span style={{ color: T.text, fontSize: 12 }}>
                    {card.assigneeId.slice(0, 8)}…
                  </span>
                </span>
              </PropRow>
            )}

            {selectedLabelIds.size > 0 && (
              <PropRow label="Labels">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {boardLabels.filter(l => selectedLabelIds.has(l.id)).map(l => (
                    <LabelPill key={l.id} name={l.name} color={l.color} />
                  ))}
                </div>
              </PropRow>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
