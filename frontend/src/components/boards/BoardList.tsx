'use client'
import { useEffect, useState } from 'react'
import { api, ApiError } from '@/lib/api'
import type { BoardResponse } from '@/types/api'
import { T } from '@/lib/theme'
import Icon from '@/components/ui/Icon'
import BoardCard from './BoardCard'
import CreateBoardModal from './CreateBoardModal'

export default function BoardList() {
  const [boards, setBoards] = useState<BoardResponse[]>([])
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set())
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    try {
      const [data, starred] = await Promise.all([
        api.get<BoardResponse[]>('/api/v1/boards'),
        api.get<BoardResponse[]>('/api/v1/me/starred-boards').catch(() => [] as BoardResponse[]),
      ])
      setBoards(data)
      setStarredIds(new Set(starred.map(b => b.id)))
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(name: string, description?: string) {
    try {
      const board = await api.post<BoardResponse>('/api/v1/boards', { name, description })
      setBoards(prev => [...prev, board])
      setShowModal(false)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/api/v1/boards/${id}`)
      setBoards(prev => prev.filter(b => b.id !== id))
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: T.canvas,
      fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      color: T.text,
    }}>
      {/* Top bar */}
      <div style={{
        height: 52, background: T.topbar,
        borderBottom: `1px solid ${T.topbarBorder}`,
        display: 'flex', alignItems: 'center',
        padding: '0 32px', gap: 12,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: T.accent, color: T.accentText,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 700, letterSpacing: '-.02em',
        }}>K</div>
        <span style={{ fontSize: 15, fontWeight: 700, color: T.text, letterSpacing: '-.01em' }}>
          Kanban
        </span>
        <span style={{ flex: 1 }} />
        <div style={{ fontSize: 12, color: T.textFaint }}>
          {boards.length} board{boards.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 32px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24,
        }}>
          <div>
            <h1 style={{
              fontSize: 22, fontWeight: 700, color: T.text, margin: 0, letterSpacing: '-.02em',
            }}>My Boards</h1>
            <p style={{ fontSize: 13, color: T.textMuted, margin: '4px 0 0' }}>
              All your kanban boards
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              height: 34, padding: '0 14px',
              background: T.accent, color: T.accentText,
              border: 'none', borderRadius: 7,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            <Icon name="plus" size={13} sw={2.2} />
            New board
          </button>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', background: '#fee2e2', borderRadius: 8,
            color: T.danger, fontSize: 13, marginBottom: 16,
            border: '1px solid #fca5a5',
          }}>{error}</div>
        )}

        {boards.length === 0 ? (
          <div style={{
            padding: '64px 24px', textAlign: 'center',
            background: T.card, borderRadius: 12,
            border: `1px solid ${T.cardBorder}`,
          }}>
            <div style={{ fontSize: 32, marginBottom: 14, color: T.textFaint }}>◇</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: T.textMuted, marginBottom: 6 }}>
              No boards yet
            </div>
            <div style={{ fontSize: 13, color: T.textFaint, marginBottom: 20 }}>
              Create your first board to get started.
            </div>
            <button
              onClick={() => setShowModal(true)}
              style={{
                height: 34, padding: '0 16px',
                background: T.accent, color: T.accentText,
                border: 'none', borderRadius: 7,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              <Icon name="plus" size={13} sw={2.2} />
              Create a board
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {boards.map(board => (
              <BoardCard key={board.id} board={board} onDelete={handleDelete} isStarred={starredIds.has(board.id)} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateBoardModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </div>
  )
}
