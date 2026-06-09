'use client'
import { useState, useRef, useEffect } from 'react'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { api, ApiError } from '@/lib/api'
import { T } from '@/lib/theme'
import type { ColumnResponse, CardResponse } from '@/types/api'
import CardItem from './CardItem'
import Icon from '@/components/ui/Icon'
import { ColorPalette } from '@/components/ui/ColorPalette'
import { useConfigStore } from '@/store/configStore'
import { useBoardStore } from '@/store/boardStore'

function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const lin = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function headerTextColors(hex: string | undefined) {
  if (!hex) return { text: T.text, faint: T.textFaint, muted: T.textMuted }
  const light = relativeLuminance(hex) > 0.179
  return {
    text:  light ? 'rgba(0,0,0,0.85)'  : '#ffffff',
    faint: light ? 'rgba(0,0,0,0.50)'  : 'rgba(255,255,255,0.65)',
    muted: light ? 'rgba(0,0,0,0.45)'  : 'rgba(255,255,255,0.55)',
  }
}

function ColorSwatchButton({
  color,
  colorHexMap,
  onClick,
}: {
  color: string | null | undefined
  colorHexMap: Record<string, string>
  onClick: () => void
}) {
  const hex = color && colorHexMap[color] ? colorHexMap[color] : null
  return (
    <button
      onClick={onClick}
      title="Set header color"
      style={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: hex ?? 'transparent',
        border: hex ? 'none' : `1.5px dashed ${T.textFaint}`,
        cursor: 'pointer',
        padding: 0,
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  )
}

function ColumnMenu({ onDelete, onRename, iconColor }: { onDelete: () => void; onRename: () => void; iconColor?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const menuItem = (label: string, icon: string, color: string, action: () => void) => (
    <button
      onClick={() => { setOpen(false); action() }}
      style={{
        width: '100%', textAlign: 'left',
        padding: '7px 12px', background: 'none', border: 'none',
        fontSize: 13, color, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 8,
      }}
    >
      <Icon name={icon as never} size={13} sw={1.8} />
      {label}
    </button>
  )

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: 'none', padding: 2,
          cursor: 'pointer', color: iconColor ?? T.textMuted,
          display: 'flex', alignItems: 'center', borderRadius: 4,
        }}
      >
        <Icon name="more" size={14} sw={2} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, zIndex: 50,
          background: T.card, border: `1px solid ${T.cardBorder}`,
          borderRadius: 7, boxShadow: '0 4px 12px rgba(0,0,0,.12)',
          minWidth: 140, padding: '4px 0', marginTop: 4,
        }}>
          {menuItem('Rename', 'flag', T.textMuted, onRename)}
          {menuItem('Delete column', 'trash', T.danger, onDelete)}
        </div>
      )}
    </div>
  )
}

interface Props {
  column: ColumnResponse
  onDeleteColumn: (id: string) => void
  onRenameColumn?: (id: string, name: string) => void
  onSelectCard?: (card: CardResponse) => void
  onAddCard?: (columnId: string, card: CardResponse) => void
  swimlanes?: boolean
}

export default function Column({ column, onDeleteColumn, onRenameColumn, onSelectCard, onAddCard, swimlanes }: Props) {
  const cards = column.cards ?? []
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState('STORY')
  const [submitting, setSubmitting] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [renameVal, setRenameVal] = useState(column.name)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const renameRef = useRef<HTMLInputElement>(null)

  const colorHexMap = useConfigStore(s => s.columnColorMap)
  const colorTokens = useConfigStore(s => s.columnColors)
  // Support both token names ('red') and raw hex values ('#ff0000')
  const activeHex = column.headerColor
    ? (column.headerColor.startsWith('#') ? column.headerColor : colorHexMap[column.headerColor])
    : undefined
  const hc = headerTextColors(activeHex)
  const board = useBoardStore(s => s.board)
  const updateColumnColor = useBoardStore(s => s.updateColumnColor)
  const canEdit = board?.role !== 'VIEWER'

  async function handleColorSelect(newColor: string | null) {
    const prevColor = column.headerColor ?? null
    setPaletteOpen(false)
    updateColumnColor(column.id, newColor)
    try {
      await api.patch(`/api/v1/columns/${column.id}`, { headerColor: newColor })
    } catch {
      updateColumnColor(column.id, prevColor)
    }
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, data: { type: 'column' } })

  useEffect(() => {
    if (showAdd) textareaRef.current?.focus()
  }, [showAdd])

  useEffect(() => {
    if (renaming) {
      setRenameVal(column.name)
      renameRef.current?.focus()
      renameRef.current?.select()
    }
  }, [renaming, column.name])

  function handleDelete() {
    if (window.confirm(`Delete column "${column.name}" and all its cards?`)) {
      onDeleteColumn(column.id)
    }
  }

  async function handleRename() {
    const name = renameVal.trim()
    if (!name || name === column.name) { setRenaming(false); return }
    try {
      await api.patch<ColumnResponse>(`/api/v1/columns/${column.id}`, { name })
      onRenameColumn?.(column.id, name)
    } catch (err) {
      if (err instanceof ApiError) alert(err.message)
    } finally {
      setRenaming(false)
    }
  }

  async function handleAddCard(e: React.FormEvent) {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title) return
    setSubmitting(true)
    try {
      const card = await api.post<CardResponse>(`/api/v1/columns/${column.id}/cards`, { title, type: newType })
      onAddCard?.(column.id, card)
      setNewTitle('')
      setNewType('STORY')
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
    <div
      ref={setNodeRef}
      style={{
        width: 268, flexShrink: 0,
        background: T.column,
        borderRadius: 8,
        display: 'flex', flexDirection: 'column',
        maxHeight: '100%',
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        touchAction: 'none',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '10px 12px 8px',
        display: 'flex', alignItems: 'center', gap: 8,
        flexShrink: 0,
        borderRadius: '8px 8px 0 0',
        backgroundColor: activeHex ?? undefined,
        position: 'relative',
      }}>
        {/* Drag handle */}
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            color: hc.faint,
            display: 'flex', alignItems: 'center', flexShrink: 0,
            padding: '2px 1px',
            borderRadius: 3,
          }}
        >
          <Icon name="grip" size={12} sw={2.5} />
        </div>
        {renaming ? (
          <input
            ref={renameRef}
            value={renameVal}
            onChange={e => setRenameVal(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') setRenaming(false)
            }}
            style={{
              flex: 1, fontSize: 12, fontWeight: 600,
              color: T.text, letterSpacing: '-.005em',
              background: T.card, border: `1px solid ${T.accent}`,
              borderRadius: 4, padding: '2px 6px', outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        ) : (
          <>
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: hc.text, letterSpacing: '-.005em',
            }}>{column.name}</span>
            <span style={{
              fontSize: 11, color: hc.faint,
              fontVariantNumeric: 'tabular-nums', fontWeight: 500,
            }}>{cards.length}</span>
          </>
        )}
        <span style={{ flex: 1 }} />
        {!renaming && canEdit && (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <ColorSwatchButton
              color={column.headerColor}
              colorHexMap={colorHexMap}
              onClick={() => setPaletteOpen(o => !o)}
            />
            {paletteOpen && colorTokens.length > 0 && (
              <ColorPalette
                tokens={colorTokens}
                colorHexMap={colorHexMap}
                currentColor={column.headerColor}
                onSelect={handleColorSelect}
                onClose={() => setPaletteOpen(false)}
              />
            )}
          </div>
        )}
        {!renaming && (
          <Icon
            name="plus" size={13} sw={2}
            style={{ color: hc.muted, cursor: 'pointer' }}
            onClick={() => setShowAdd(true)}
          />
        )}
        <ColumnMenu onDelete={handleDelete} onRename={() => setRenaming(true)} iconColor={hc.muted} />
      </div>

      {/* Cards */}
      <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div
          style={{
            padding: '0 10px 10px',
            display: 'flex', flexDirection: 'column',
            gap: swimlanes ? 0 : 8,
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
          {swimlanes ? (() => {
            const groups = new Map<string, CardResponse[]>()
            for (const card of cards) {
              const label = card.labels?.[0]?.name ?? 'Unlabeled'
              const g = groups.get(label)
              if (g) g.push(card)
              else groups.set(label, [card])
            }
            if (!groups.has('Unlabeled') && cards.some(c => !c.labels?.length)) {
              groups.set('Unlabeled', cards.filter(c => !c.labels?.length))
            }
            return Array.from(groups.entries()).map(([label, groupCards]) => (
              <div key={label}>
                <div style={{
                  fontSize: 10.5, fontWeight: 700, letterSpacing: '.05em',
                  textTransform: 'uppercase', color: T.textFaint,
                  padding: '8px 2px 4px',
                  borderBottom: `1px solid ${T.cardBorder}`, marginBottom: 6,
                }}>
                  {label}
                  <span style={{ fontWeight: 500, marginLeft: 5 }}>{groupCards.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                  {groupCards.map(card => (
                    <CardItem key={card.id} card={card} onClick={() => onSelectCard?.(card)} />
                  ))}
                </div>
              </div>
            ))
          })() : cards.map(card => (
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
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  style={{
                    height: 28, padding: '0 6px',
                    fontSize: 11, border: `1px solid ${T.cardBorder}`,
                    borderRadius: 6, background: T.card, color: T.text,
                    fontFamily: 'inherit', cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  <option value="STORY">Story</option>
                  <option value="FEATURE">Feature</option>
                  <option value="BUG">Bug</option>
                </select>
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
