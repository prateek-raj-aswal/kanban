'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { T } from '@/lib/theme'
import type { IssueResponse, IssueStatus } from '@/types/api'

interface Props {
  /** When set, shows an Attach button per unattached issue */
  attachToCardId?: string
  /** When set, only shows issues attached to this card */
  filterByCardId?: string
  /** When set, only shows issues with this status ('ALL' shows everything) */
  statusFilter?: IssueStatus | 'ALL'
}

const STATUS_COLOR: Record<IssueStatus, string> = {
  OPEN: '#3b82f6',
  IN_PROGRESS: '#eab308',
  CLOSED: '#94a3b8',
}

export default function IssuesPanel({ attachToCardId, filterByCardId, statusFilter }: Props) {
  const [issues, setIssues] = useState<IssueResponse[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState('BUG')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const path = filterByCardId
      ? `/api/v1/issues?parentCardId=${filterByCardId}`
      : '/api/v1/issues'
    api.get<IssueResponse[]>(path)
      .then(setIssues)
      .catch(() => {})
  }, [filterByCardId])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title) return
    setCreating(true)
    try {
      const created = await api.post<IssueResponse>('/api/v1/issues', {
        title,
        type: newType,
        ...(filterByCardId ? { parentCardId: filterByCardId } : {}),
      })
      setIssues(prev => [...prev, created])
      setNewTitle('')
      setNewType('BUG')
    } catch { /* ignore */ } finally {
      setCreating(false)
    }
  }

  async function handleClose(issue: IssueResponse) {
    try {
      const updated = await api.patch<IssueResponse>(`/api/v1/issues/${issue.id}`, { status: 'CLOSED' })
      setIssues(prev => prev.map(i => i.id === issue.id ? updated : i))
    } catch { /* ignore */ }
  }

  async function handleAttach(issue: IssueResponse) {
    if (!attachToCardId) return
    try {
      const updated = await api.patch<IssueResponse>(`/api/v1/issues/${issue.id}`, { parentCardId: attachToCardId })
      setIssues(prev => prev.map(i => i.id === issue.id ? updated : i))
    } catch { /* ignore */ }
  }

  async function handleDetach(issue: IssueResponse) {
    try {
      const updated = await api.patch<IssueResponse>(`/api/v1/issues/${issue.id}`, { parentCardId: null })
      setIssues(prev => prev.map(i => i.id === issue.id ? updated : i))
    } catch { /* ignore */ }
  }

  const visibleIssues = statusFilter && statusFilter !== 'ALL'
    ? issues.filter(i => i.status === statusFilter)
    : issues

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Issue list */}
      {visibleIssues.length === 0 ? (
        <div style={{ fontSize: 12, color: T.textFaint }}>No issues yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {visibleIssues.map(issue => (
            <div
              key={issue.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 8px', borderRadius: 6,
                background: T.canvas, border: `1px solid ${T.cardBorder}`,
                fontSize: 12,
              }}
            >
              {/* Readable ID badge */}
              {issue.readableId && (
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '.04em',
                  padding: '2px 5px', borderRadius: 4,
                  background: T.chipBg, color: T.textMuted,
                  flexShrink: 0, fontVariantNumeric: 'tabular-nums',
                }}>
                  {issue.readableId}
                </span>
              )}

              {/* Status badge */}
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '.04em',
                padding: '2px 5px', borderRadius: 4,
                background: STATUS_COLOR[issue.status] + '28',
                color: STATUS_COLOR[issue.status],
                flexShrink: 0,
              }}>
                {issue.status}
              </span>

              {/* Title */}
              <span style={{
                flex: 1, color: issue.status === 'CLOSED' ? T.textFaint : T.text,
                textDecoration: issue.status === 'CLOSED' ? 'line-through' : 'none',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {issue.title}
              </span>

              {/* Attach button (only when attachToCardId provided and issue not yet attached) */}
              {attachToCardId && issue.parentCardId !== attachToCardId && issue.status !== 'CLOSED' && (
                <button
                  onClick={() => handleAttach(issue)}
                  title="Attach to card"
                  style={{
                    padding: '2px 7px', fontSize: 10.5, fontWeight: 600,
                    background: T.accentSoft, color: T.accent,
                    border: 'none', borderRadius: 4, cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  Attach
                </button>
              )}

              {/* Detach button (when this issue is attached) */}
              {issue.parentCardId && (attachToCardId ? issue.parentCardId === attachToCardId : true) && (
                <button
                  onClick={() => handleDetach(issue)}
                  title="Detach from card"
                  style={{
                    padding: '2px 7px', fontSize: 10.5, fontWeight: 600,
                    background: T.chipBg, color: T.textMuted,
                    border: 'none', borderRadius: 4, cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  Detach
                </button>
              )}

              {/* Close button (only for non-closed issues) */}
              {issue.status !== 'CLOSED' && (
                <button
                  onClick={() => handleClose(issue)}
                  title="Close issue"
                  style={{
                    padding: '2px 7px', fontSize: 10.5, fontWeight: 600,
                    background: 'transparent', color: T.textMuted,
                    border: `1px solid ${T.cardBorder}`, borderRadius: 4,
                    cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  Close
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create form */}
      <form onSubmit={handleCreate} style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="New issue title…"
          style={{
            flex: 1, minWidth: 0, height: 28, padding: '0 8px',
            fontSize: 12, border: `1px solid ${T.cardBorder}`,
            borderRadius: 5, background: T.card, color: T.text,
            outline: 'none', fontFamily: 'inherit',
          }}
        />
        <select
          value={newType}
          onChange={e => setNewType(e.target.value)}
          style={{
            height: 28, padding: '0 6px',
            fontSize: 11, border: `1px solid ${T.cardBorder}`,
            borderRadius: 5, background: T.card, color: T.text,
            fontFamily: 'inherit', cursor: 'pointer', flexShrink: 0,
          }}
        >
          <option value="STORY">Story</option>
          <option value="FEATURE">Feature</option>
          <option value="BUG">Bug</option>
        </select>
        <button
          type="submit"
          disabled={!newTitle.trim() || creating}
          style={{
            height: 28, padding: '0 10px',
            background: newTitle.trim() ? T.accent : T.chipBg,
            color: newTitle.trim() ? T.accentText : T.textFaint,
            border: 'none', borderRadius: 5,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Create
        </button>
      </form>
    </div>
  )
}
