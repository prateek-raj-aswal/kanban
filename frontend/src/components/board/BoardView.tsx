'use client'
import { useEffect, useState } from 'react'
import { api, ApiError } from '@/lib/api'
import type { BoardResponse, ColumnResponse, CardResponse } from '@/types/api'
import { T } from '@/lib/theme'
import Icon from '@/components/ui/Icon'
import Sidebar from './Sidebar'
import ColumnList from './ColumnList'
import CardModal from './CardModal'

interface Props {
  boardId: string
}

const VIEW_TABS = [
  { id: 'board', icon: 'grid',     label: 'Board' },
  { id: 'list', icon: 'list',      label: 'List' },
  { id: 'timeline', icon: 'timeline', label: 'Timeline' },
  { id: 'cal', icon: 'cal',        label: 'Calendar' },
] as const

export default function BoardView({ boardId }: Props) {
  const [board, setBoard] = useState<BoardResponse | null>(null)
  const [newColName, setNewColName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState<{ card: CardResponse; columnName: string } | null>(null)

  async function load() {
    try {
      const data = await api.get<BoardResponse>(`/api/v1/boards/${boardId}`)
      setBoard(data)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
    }
  }

  useEffect(() => { load() }, [boardId])

  async function addColumn(e: React.FormEvent) {
    e.preventDefault()
    if (!newColName.trim()) return
    try {
      const col = await api.post<ColumnResponse>(`/api/v1/boards/${boardId}/columns`, { name: newColName })
      setBoard(prev => prev ? { ...prev, columns: [...(prev.columns ?? []), col] } : prev)
      setNewColName('')
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
    }
  }

  async function deleteColumn(colId: string) {
    try {
      await api.delete(`/api/v1/columns/${colId}`)
      setBoard(prev => prev ? {
        ...prev,
        columns: (prev.columns ?? []).filter(c => c.id !== colId)
      } : prev)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
    }
  }

  function handleSelectCard(card: CardResponse) {
    const col = (board?.columns ?? []).find(c => c.id === card.columnId)
    setSelectedCard({ card, columnName: col?.name ?? '' })
  }

  function handleAddCard(columnId: string, newCard: CardResponse) {
    setBoard(prev => prev ? {
      ...prev,
      columns: (prev.columns ?? []).map(col =>
        col.id === columnId
          ? { ...col, cards: [...(col.cards ?? []), newCard] }
          : col
      )
    } : prev)
  }

  function handleCardUpdate(updated: CardResponse) {
    setBoard(prev => prev ? {
      ...prev,
      columns: (prev.columns ?? []).map(col =>
        col.id === updated.columnId
          ? { ...col, cards: (col.cards ?? []).map(c => c.id === updated.id ? updated : c) }
          : col
      )
    } : prev)
    setSelectedCard(prev => prev && prev.card.id === updated.id
      ? { ...prev, card: updated }
      : prev
    )
  }

  function handleCardMove(updated: CardResponse) {
    setBoard(prev => {
      if (!prev) return prev
      const cols = prev.columns ?? []
      const newCols = cols.map(col => {
        const filtered = (col.cards ?? []).filter(c => c.id !== updated.id)
        if (col.id === updated.columnId) {
          return { ...col, cards: [...filtered, updated].sort((a, b) => a.position - b.position) }
        }
        return { ...col, cards: filtered }
      })
      return { ...prev, columns: newCols }
    })
  }

  function handleCardDelete(cardId: string) {
    setBoard(prev => prev ? {
      ...prev,
      columns: (prev.columns ?? []).map(col => ({
        ...col,
        cards: (col.cards ?? []).filter(c => c.id !== cardId)
      }))
    } : prev)
    setSelectedCard(null)
  }

  const columns = board?.columns ?? []
  const cardCount = columns.reduce((n, c) => n + (c.cards?.length ?? 0), 0)

  return (
    <div style={{
      display: 'flex', height: '100vh',
      background: T.canvas, overflow: 'hidden',
      fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      color: T.text,
    }}>
      <Sidebar currentBoardId={boardId} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{
          height: 44, flexShrink: 0,
          display: 'flex', alignItems: 'center',
          padding: '0 14px', gap: 14,
          borderBottom: `1px solid ${T.topbarBorder}`,
          background: T.topbar,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: T.textMuted }}>
            <a href="/boards" style={{ color: T.textMuted }}>My Boards</a>
            <Icon name="chevron" size={10} sw={2} />
            <span style={{ color: T.text, fontWeight: 600 }}>{board?.name ?? '…'}</span>
          </div>
          <span style={{ flex: 1 }} />
          <button style={{
            height: 28, padding: '0 10px',
            background: 'transparent', color: T.text,
            border: `1px solid ${T.cardBorder}`, borderRadius: 6,
            fontSize: 12, fontWeight: 500, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <Icon name="user" size={13} sw={1.7} />
            Share
          </button>
        </div>

        {/* Board header */}
        <div style={{ padding: '14px 18px 0', flexShrink: 0, background: T.canvas }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: 20, fontWeight: 700, letterSpacing: '-.02em',
                color: T.text, margin: '0 0 4px',
              }}>{board?.name ?? 'Loading…'}</h1>
              <div style={{ fontSize: 12.5, color: T.textMuted }}>
                {columns.length} column{columns.length !== 1 ? 's' : ''} · {cardCount} card{cardCount !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Add column */}
            <form onSubmit={addColumn} style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                placeholder="Column name"
                value={newColName}
                onChange={e => setNewColName(e.target.value)}
                style={{
                  height: 30, padding: '0 10px',
                  border: `1px solid ${T.cardBorder}`, borderRadius: 6,
                  fontSize: 12, background: T.card, color: T.text,
                  outline: 'none', width: 150,
                }}
              />
              <button
                type="submit"
                disabled={!newColName.trim()}
                style={{
                  height: 30, padding: '0 10px',
                  background: newColName.trim() ? T.accent : T.chipBg,
                  color: newColName.trim() ? T.accentText : T.textFaint,
                  border: 'none', borderRadius: 6,
                  fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
              >
                <Icon name="plus" size={11} sw={2} />
                Add
              </button>
            </form>
          </div>

          {/* View tabs */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 2,
            padding: 2, background: T.chipBg, borderRadius: 7,
            width: 'fit-content',
          }}>
            {VIEW_TABS.map(tab => {
              const active = tab.id === 'board'
              return (
                <div key={tab.id} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '6px 9px', borderRadius: 5,
                  fontSize: 12, fontWeight: 500,
                  color: active ? T.text : T.textMuted,
                  background: active ? T.card : 'transparent',
                  border: active ? `1px solid ${T.cardBorder}` : '1px solid transparent',
                  boxShadow: active ? T.cardShadow : 'none',
                  cursor: 'pointer',
                }}>
                  <Icon name={tab.icon} size={12} sw={1.7} />
                  {tab.label}
                </div>
              )
            })}
          </div>
        </div>

        {/* Filter bar */}
        <div style={{
          padding: '10px 18px 12px',
          display: 'flex', alignItems: 'center', gap: 8,
          flexShrink: 0, background: T.canvas,
          borderBottom: `1px solid ${T.topbarBorder}`,
        }}>
          {error && (
            <span style={{
              fontSize: 12, color: T.danger,
              background: '#fee2e2', padding: '4px 8px', borderRadius: 5,
            }}>{error}</span>
          )}
          {[
            { icon: 'filter', label: 'Filter' },
            { icon: 'sort',   label: 'Sort' },
          ].map(({ icon, label }) => (
            <div key={label} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 9px', borderRadius: 5, fontSize: 12, fontWeight: 500,
              color: T.textMuted, background: T.card, border: `1px solid ${T.cardBorder}`,
              cursor: 'pointer',
            }}>
              <Icon name={icon as 'filter'} size={11} sw={1.7} />
              {label}
            </div>
          ))}
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 11.5, color: T.textFaint }}>
            {columns.length} columns · {cardCount} cards
          </span>
        </div>

        {/* Board area */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {!board ? (
            <div style={{ padding: 24, color: T.textMuted, fontSize: 13 }}>Loading…</div>
          ) : (
            <ColumnList
              columns={columns}
              onDeleteColumn={deleteColumn}
              onSelectCard={handleSelectCard}
              onAddCard={handleAddCard}
              onCardMoved={handleCardMove}
            />
          )}
        </div>
      </div>

      {selectedCard && (
        <CardModal
          card={selectedCard.card}
          columnName={selectedCard.columnName}
          boardId={boardId}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleCardUpdate}
          onDelete={handleCardDelete}
        />
      )}
    </div>
  )
}
