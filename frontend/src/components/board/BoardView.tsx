'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import { useIsMobile } from '@/lib/useIsMobile'
import { getToken } from '@/lib/auth'
import { subscribeToBoard } from '@/lib/websocket'
import { useBoardStore } from '@/store/boardStore'
import { useConfigStore } from '@/store/configStore'
import type { ColumnResponse, CardResponse, Priority, MemberResponse } from '@/types/api'
import { T } from '@/lib/theme'
import Icon from '@/components/ui/Icon'
import Sidebar from './Sidebar'
import ColumnList from './ColumnList'
import SwimlaneView, { type GroupBy } from './SwimlaneView'
import CardModal from './CardModal'
import InviteModal from './InviteModal'
import ChatSidebar from './ChatSidebar'

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
  const router = useRouter()
  const isMobile = useIsMobile()
  const { board, setBoard, addCard, updateCard, moveCard, deleteCard, addColumn, deleteColumn, applyEvent } = useBoardStore()
  const [newColName, setNewColName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState<{ card: CardResponse; columnName: string } | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [filterPriority, setFilterPriority] = useState<Priority | ''>('')
  const [filterAssigneeId, setFilterAssigneeId] = useState('')
  const [members, setMembers] = useState<MemberResponse[]>([])
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board')
  const [groupBy, setGroupBy] = useState<GroupBy | 'NONE'>('NONE')
  const [activeColIdx, setActiveColIdx] = useState(0)
  const [starred, setStarred] = useState(false)
  const [editingBoardName, setEditingBoardName] = useState(false)
  const [boardNameVal, setBoardNameVal] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const boardNameRef = useRef<HTMLInputElement>(null)

  // Load board data and members
  useEffect(() => {
    setBoard(null)
    api.get<import('@/types/api').BoardResponse>(`/api/v1/boards/${boardId}`)
      .then(b => {
        setBoard(b)
        const validGroups: Array<GroupBy | 'NONE'> = ['NONE', 'ASSIGNEE', 'PRIORITY', 'MODULE']
        const incoming = b.groupBy as GroupBy | 'NONE' | undefined
        if (incoming && validGroups.includes(incoming)) setGroupBy(incoming)
      })
      .catch(err => { if (err instanceof ApiError) setError(err.message) })
    api.get<MemberResponse[]>(`/api/v1/boards/${boardId}/members`)
      .then(setMembers)
      .catch(() => {})
    api.get<import('@/types/api').BoardResponse[]>('/api/v1/me/starred-boards')
      .then(boards => setStarred(boards.some(b => b.id === boardId)))
      .catch(() => {})
    api.get<{ tokens: string[]; colorMap: Record<string, string> }>('/api/v1/column-colors')
      .then(data => {
        useConfigStore.getState().setColumnColors(data.tokens)
        useConfigStore.getState().setColumnColorMap(data.colorMap)
      })
      .catch(() => {})
  }, [boardId])

  // WebSocket subscription — reconnects when boardId changes
  useEffect(() => {
    const token = getToken()
    if (!token) return
    return subscribeToBoard(boardId, token, applyEvent)
  }, [boardId])

  async function toggleStar() {
    const next = !starred
    setStarred(next)
    try {
      if (next) await api.post(`/api/v1/boards/${boardId}/star`, {})
      else await api.delete(`/api/v1/boards/${boardId}/star`)
    } catch {
      setStarred(!next)
    }
  }

  async function handleBoardRename() {
    const name = boardNameVal.trim()
    setEditingBoardName(false)
    if (!name || name === board?.name) return
    try {
      await api.patch(`/api/v1/boards/${boardId}`, { name })
      setBoard({ ...board!, name })
    } catch { /* ignore */ }
  }

  async function addColumnHandler(e: React.FormEvent) {
    e.preventDefault()
    if (!newColName.trim()) return
    try {
      const col = await api.post<ColumnResponse>(`/api/v1/boards/${boardId}/columns`, { name: newColName })
      addColumn(col)
      setNewColName('')
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
    }
  }

  async function deleteColumnHandler(colId: string) {
    try {
      await api.delete(`/api/v1/columns/${colId}`)
      deleteColumn(colId)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
    }
  }

  function handleSelectCard(card: CardResponse) {
    const col = (board?.columns ?? []).find(c => c.id === card.columnId)
    setSelectedCard({ card, columnName: col?.name ?? '' })
  }

  function handleCardUpdate(updated: CardResponse) {
    updateCard(updated)
    setSelectedCard(prev => prev && prev.card.id === updated.id ? { ...prev, card: updated } : prev)
  }

  function handleCardDelete(cardId: string) {
    deleteCard(cardId)
    setSelectedCard(null)
  }

  const columns = (board?.columns ?? []).map(col => {
    let cards = col.cards ?? []
    if (searchQ.trim()) {
      cards = cards.filter(c => c.title.toLowerCase().includes(searchQ.toLowerCase()))
    }
    if (filterPriority) {
      cards = cards.filter(c => c.priority === filterPriority)
    }
    if (filterAssigneeId) {
      cards = cards.filter(c => (c.assignees ?? []).includes(filterAssigneeId))
    }
    return { ...col, cards }
  })
  const rawColumns = board?.columns ?? []
  const cardCount = rawColumns.reduce((n, c) => n + (c.cards?.length ?? 0), 0)

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
          <button
            onClick={toggleStar}
            title={starred ? 'Unstar board' : 'Star board'}
            style={{
              height: 28, padding: '0 8px',
              background: 'transparent', color: starred ? '#f59e0b' : T.textMuted,
              border: `1px solid ${T.cardBorder}`, borderRadius: 6,
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
            <Icon name="star" size={13} sw={starred ? 0 : 1.7} fill={starred ? '#f59e0b' : 'none'} />
          </button>
          <button
            onClick={() => setInviteOpen(true)}
            style={{
              height: 28, padding: '0 10px',
              background: 'transparent', color: T.text,
              border: `1px solid ${T.cardBorder}`, borderRadius: 6,
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
            <Icon name="user" size={13} sw={1.7} />
            Share
          </button>
          <button
            onClick={() => setChatOpen(o => !o)}
            aria-pressed={chatOpen}
            aria-label="AI chat"
            title="AI Assistant"
            style={{
              height: 28, padding: '0 10px',
              background: chatOpen ? T.accentSoft : 'transparent',
              color: chatOpen ? T.accent : T.textMuted,
              border: `1px solid ${chatOpen ? T.accent : T.cardBorder}`, borderRadius: 6,
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
            <Icon name="msg" size={13} sw={1.7} />
            AI
          </button>
        </div>

        {/* Board header */}
        <div style={{ padding: '14px 18px 0', flexShrink: 0, background: T.canvas }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              {editingBoardName ? (
                <input
                  ref={boardNameRef}
                  value={boardNameVal}
                  onChange={e => setBoardNameVal(e.target.value)}
                  onBlur={handleBoardRename}
                  onKeyDown={e => { if (e.key === 'Enter') boardNameRef.current?.blur(); if (e.key === 'Escape') setEditingBoardName(false) }}
                  style={{
                    fontSize: 20, fontWeight: 700, letterSpacing: '-.02em',
                    color: T.text, background: 'transparent',
                    border: 'none', borderBottom: `2px solid ${T.accent}`,
                    outline: 'none', fontFamily: 'inherit', padding: 0,
                    margin: '0 0 4px', width: '100%',
                  }}
                  autoFocus
                />
              ) : (
                <h1
                  onClick={() => { setBoardNameVal(board?.name ?? ''); setEditingBoardName(true) }}
                  title="Click to rename"
                  style={{
                    fontSize: 20, fontWeight: 700, letterSpacing: '-.02em',
                    color: T.text, margin: '0 0 4px', cursor: 'text',
                  }}>{board?.name ?? 'Loading…'}</h1>
              )}
              <div style={{ fontSize: 12.5, color: T.textMuted }}>
                {columns.length} column{columns.length !== 1 ? 's' : ''} · {cardCount} card{cardCount !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Add column */}
            <form onSubmit={addColumnHandler} style={{ display: 'flex', gap: 6 }}>
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

          {/* View tabs + swimlanes toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 2,
            padding: 2, background: T.chipBg, borderRadius: 7,
            width: 'fit-content',
          }}>
            {VIEW_TABS.map(tab => {
              const active = (tab.id === 'board' && viewMode === 'board') ||
                             (tab.id === 'list' && viewMode === 'list')
              return (
                <div
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'board') setViewMode('board')
                    else if (tab.id === 'list') setViewMode('list')
                    else if (tab.id === 'timeline') router.push(`/boards/${boardId}/timeline`)
                    else if (tab.id === 'cal') router.push(`/boards/${boardId}/calendar`)
                  }}
                  style={{
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
          {viewMode === 'board' && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Icon name="list" size={12} sw={1.7} style={{ color: T.textMuted }} />
              <select
                value={groupBy}
                onChange={async e => {
                  const next = e.target.value as GroupBy | 'NONE'
                  setGroupBy(next)
                  try {
                    await api.patch(`/api/v1/boards/${boardId}`, { groupBy: next })
                  } catch { /* ignore — local state already updated */ }
                }}
                style={{
                  height: 30, padding: '0 6px',
                  border: `1px solid ${groupBy !== 'NONE' ? T.accent : T.cardBorder}`,
                  borderRadius: 6, fontSize: 12,
                  background: groupBy !== 'NONE' ? T.accentSoft : T.card,
                  color: groupBy !== 'NONE' ? T.accent : T.textMuted,
                  cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
                }}
              >
                <option value="NONE">Group by: None</option>
                <option value="ASSIGNEE">Group by: Assignee</option>
                <option value="PRIORITY">Group by: Priority</option>
                <option value="MODULE">Group by: Module</option>
              </select>
            </div>
          )}
          </div>
        </div>

        {/* Filter bar */}
        <div style={{
          padding: '8px 18px 10px',
          display: 'flex', alignItems: 'center', gap: 8,
          flexShrink: 0, background: T.canvas,
          borderBottom: `1px solid ${T.topbarBorder}`,
          flexWrap: 'wrap',
        }}>
          {error && (
            <span style={{
              fontSize: 12, color: T.danger,
              background: '#fee2e2', padding: '4px 8px', borderRadius: 5,
            }}>{error}</span>
          )}
          {/* Search */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 9px', borderRadius: 5, fontSize: 12,
            background: T.card, border: `1px solid ${T.cardBorder}`,
          }}>
            <Icon name="search" size={11} sw={1.7} style={{ color: T.textMuted }} />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search cards…"
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontSize: 12, color: T.text, width: 130, fontFamily: 'inherit',
              }}
            />
            {searchQ && (
              <button onClick={() => setSearchQ('')} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: T.textFaint, fontSize: 14, padding: 0,
              }}>×</button>
            )}
          </div>
          {/* Assignee filter */}
          {members.length > 0 && (
            <select
              value={filterAssigneeId}
              onChange={e => setFilterAssigneeId(e.target.value)}
              style={{
                height: 28, padding: '0 6px',
                border: `1px solid ${T.cardBorder}`, borderRadius: 5,
                fontSize: 12, background: T.card, color: filterAssigneeId ? T.text : T.textMuted,
                cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
              }}
            >
              <option value="">All assignees</option>
              {members.map(m => (
                <option key={m.userId} value={m.userId}>{m.displayName || m.email}</option>
              ))}
            </select>
          )}
          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value as Priority | '')}
            style={{
              height: 28, padding: '0 6px',
              border: `1px solid ${T.cardBorder}`, borderRadius: 5,
              fontSize: 12, background: T.card, color: filterPriority ? T.text : T.textMuted,
              cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
            }}
          >
            <option value="">All priorities</option>
            {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as Priority[]).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {(searchQ || filterPriority || filterAssigneeId) && (
            <button
              onClick={() => { setSearchQ(''); setFilterPriority(''); setFilterAssigneeId('') }}
              style={{
                height: 28, padding: '0 9px',
                background: T.chipBg, color: T.textMuted,
                border: `1px solid ${T.cardBorder}`, borderRadius: 5,
                fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >Clear filters</button>
          )}
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 11.5, color: T.textFaint }}>
            {rawColumns.length} columns · {cardCount} cards
          </span>
        </div>

        {/* Board area */}
        <div data-testid="board-area" style={{ flex: 1, minHeight: 0, paddingBottom: isMobile ? 56 : 0 }}>
          {!board ? (
            <div style={{ padding: 24, color: T.textMuted, fontSize: 13 }}>Loading…</div>
          ) : isMobile ? (
            /* Mobile: column tabs + single column */
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{
                display: 'flex', overflowX: 'auto', flexShrink: 0,
                borderBottom: `1px solid ${T.cardBorder}`,
                background: T.sidebar,
                scrollbarWidth: 'none',
              }}>
                {columns.map((col, i) => (
                  <button key={col.id} onClick={() => setActiveColIdx(i)} style={{
                    padding: '8px 14px', border: 'none', cursor: 'pointer',
                    background: 'transparent', whiteSpace: 'nowrap',
                    fontSize: 13, fontWeight: activeColIdx === i ? 600 : 400,
                    color: activeColIdx === i ? T.text : T.textMuted,
                    borderBottom: activeColIdx === i ? `2px solid ${T.accent}` : '2px solid transparent',
                    fontFamily: 'inherit',
                  }}>
                    {col.name}
                    <span style={{ fontSize: 11, color: T.textFaint, marginLeft: 5 }}>
                      {col.cards?.length ?? 0}
                    </span>
                  </button>
                ))}
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
                {columns[activeColIdx] && (columns[activeColIdx].cards ?? []).map(card => (
                  <div
                    key={card.id}
                    onClick={() => handleSelectCard(card)}
                    style={{
                      padding: '12px 14px', marginBottom: 8,
                      background: T.card, border: `1px solid ${T.cardBorder}`,
                      borderRadius: 8, cursor: 'pointer', width: '100%', boxSizing: 'border-box',
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{card.title}</div>
                    {card.dueDate && (
                      <div style={{ fontSize: 12, color: T.textFaint, marginTop: 4 }}>
                        <Icon name="clock" size={10} sw={1.5} /> {card.dueDate}
                      </div>
                    )}
                  </div>
                ))}
                {(columns[activeColIdx]?.cards ?? []).length === 0 && (
                  <div style={{ fontSize: 13, color: T.textFaint, textAlign: 'center', paddingTop: 40 }}>
                    No cards in this column
                  </div>
                )}
              </div>
            </div>
          ) : viewMode === 'list' ? (
            <div style={{ overflowY: 'auto', height: '100%', padding: '14px 18px' }}>
              {columns.map(col => (
                <div key={col.id} style={{ marginBottom: 24 }}>
                  <div style={{
                    fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em',
                    color: T.textFaint, textTransform: 'uppercase',
                    marginBottom: 8, padding: '4px 0',
                    borderBottom: `1px solid ${T.cardBorder}`,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {col.name}
                    <span style={{ fontWeight: 500, fontSize: 11 }}>{col.cards?.length ?? 0}</span>
                  </div>
                  {(col.cards ?? []).length === 0 ? (
                    <div style={{ fontSize: 12, color: T.textFaint, padding: '6px 0' }}>No cards</div>
                  ) : (col.cards ?? []).map(card => (
                    <div
                      key={card.id}
                      onClick={() => handleSelectCard(card)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '8px 10px', marginBottom: 4,
                        background: T.card, border: `1px solid ${T.cardBorder}`,
                        borderRadius: 6, cursor: 'pointer',
                        boxShadow: T.cardShadow,
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 500, color: T.text, flex: 1 }}>
                        {card.title}
                      </span>
                      {card.priority && card.priority !== 'NONE' && (
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          color: { LOW: '#3b82f6', MEDIUM: '#eab308', HIGH: '#f97316', URGENT: '#ef4444' }[card.priority] ?? T.textFaint,
                        }}>{card.priority}</span>
                      )}
                      {card.dueDate && (
                        <span style={{ fontSize: 11, color: T.textFaint }}>
                          <Icon name="clock" size={10} sw={1.5} /> {card.dueDate}
                        </span>
                      )}
                      {(card.subtaskTotal ?? 0) > 0 && (
                        <span style={{ fontSize: 11, color: T.textMuted }}>
                          ✓ {card.subtaskDone}/{card.subtaskTotal}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : groupBy !== 'NONE' ? (
            <SwimlaneView
              boardId={boardId}
              columns={columns}
              groupBy={groupBy as GroupBy}
              members={members}
              onSelectCard={handleSelectCard}
              onCardMoved={card => { updateCard(card); moveCard(card) }}
              onDeleteColumn={deleteColumnHandler}
              onAddCard={addCard}
            />
          ) : (
            <ColumnList
              boardId={boardId}
              columns={columns}
              onDeleteColumn={deleteColumnHandler}
              onSelectCard={handleSelectCard}
              onAddCard={addCard}
              onCardMoved={moveCard}
            />
          )}
        </div>
      </div>

      {chatOpen && <ChatSidebar isOpen={chatOpen} />}

      {inviteOpen && (
        <InviteModal boardId={boardId} onClose={() => setInviteOpen(false)} currentUserRole={board?.role} />
      )}

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
