'use client'
import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { T } from '@/lib/theme'
import type { NotificationResponse } from '@/types/api'
import Icon from './Icon'

interface Props {
  onClose: () => void
}

export default function NotificationPanel({ onClose }: Props) {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.get<NotificationResponse[]>('/api/v1/notifications').then(setNotifications).catch(() => {})
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  async function markAllRead() {
    await api.post('/api/v1/notifications/read-all', {}).catch(() => {})
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  async function markRead(id: string) {
    await api.patch(`/api/v1/notifications/${id}/read`, {}).catch(() => {})
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const unread = notifications.filter(n => !n.read).length

  return (
    <div ref={ref} style={{
      position: 'absolute', bottom: '100%', left: 0,
      width: 300, maxHeight: 380, marginBottom: 8,
      background: T.card, border: `1px solid ${T.cardBorder}`,
      borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.14)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      zIndex: 100,
    }}>
      <div style={{
        padding: '10px 14px',
        display: 'flex', alignItems: 'center',
        borderBottom: `1px solid ${T.cardBorder}`,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.text, flex: 1 }}>
          Notifications {unread > 0 ? `(${unread} unread)` : ''}
        </span>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            style={{
              fontSize: 11, color: T.accent, background: 'none',
              border: 'none', cursor: 'pointer', fontWeight: 600,
            }}
          >Mark all read</button>
        )}
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {notifications.length === 0 ? (
          <div style={{
            padding: 24, textAlign: 'center',
            fontSize: 12, color: T.textFaint,
          }}>No notifications</div>
        ) : notifications.map(n => (
          <div
            key={n.id}
            onClick={() => markRead(n.id)}
            style={{
              padding: '10px 14px',
              borderBottom: `1px solid ${T.cardBorder}`,
              background: n.read ? 'transparent' : T.accentSoft + '33',
              cursor: 'pointer',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}
          >
            {!n.read && (
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: T.accent, flexShrink: 0, marginTop: 5,
              }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: T.text, lineHeight: 1.4 }}>{n.message}</div>
              <div style={{ fontSize: 10.5, color: T.textFaint, marginTop: 2 }}>
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
