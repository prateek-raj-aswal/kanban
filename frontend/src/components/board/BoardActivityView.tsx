'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { T } from '@/lib/theme'
import type { ActivityLogResponse } from '@/types/api'
import Icon from '@/components/ui/Icon'
import Sidebar from './Sidebar'

interface Props {
  boardId: string
}

export default function BoardActivityView({ boardId }: Props) {
  const [activity, setActivity] = useState<ActivityLogResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<ActivityLogResponse[]>(`/api/v1/boards/${boardId}/activity`)
      .then(setActivity)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [boardId])

  const EVENT_ICON: Record<string, string> = {
    CARD_CREATED: 'plus',
    CARD_UPDATED: 'flag',
    CARD_DELETED: 'trash',
    CARD_MOVED: 'list',
  }

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
          <a href={`/boards/${boardId}`} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12.5, color: T.textMuted, cursor: 'pointer',
          }}>
            <Icon name="chevron" size={10} sw={2} style={{ transform: 'rotate(180deg)' }} />
            Back to board
          </a>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Board Activity</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
          <h2 style={{
            fontSize: 18, fontWeight: 700, color: T.text,
            letterSpacing: '-.01em', marginBottom: 20,
          }}>Activity log</h2>

          {loading ? (
            <div style={{ color: T.textMuted, fontSize: 13 }}>Loading…</div>
          ) : activity.length === 0 ? (
            <div style={{ color: T.textFaint, fontSize: 13 }}>No activity recorded yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {activity.map(entry => (
                <div key={entry.id} style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  padding: '12px 16px', borderRadius: 8,
                  background: T.card, border: `1px solid ${T.cardBorder}`,
                  marginBottom: 6,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: T.accentSoft, color: T.accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon
                      name={(EVENT_ICON[entry.eventType] ?? 'flag') as never}
                      size={13} sw={1.8}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: T.text, lineHeight: 1.4 }}>
                      {entry.summary}
                      {entry.actorName && (
                        <span style={{ color: T.textMuted }}> — by {entry.actorName}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: T.textFaint, marginTop: 3 }}>
                      {new Date(entry.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '.04em',
                    color: T.textFaint, textTransform: 'uppercase',
                    padding: '2px 6px', borderRadius: 4, background: T.chipBg,
                  }}>{entry.eventType.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
