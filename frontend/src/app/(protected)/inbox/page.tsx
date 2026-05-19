'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { T } from '@/lib/theme'
import type { SmartCardResponse } from '@/types/api'
import Sidebar from '@/components/board/Sidebar'
import SmartCardList from '@/components/board/SmartCardList'

export default function InboxPage() {
  const [cards, setCards] = useState<SmartCardResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<SmartCardResponse[]>('/api/v1/me/inbox')
      .then(setCards)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      background: T.canvas,
    }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          padding: '14px 20px', borderBottom: `1px solid ${T.topbarBorder}`,
          background: T.topbar, flexShrink: 0,
        }}>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: T.text }}>Inbox</h1>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
            Cards assigned to you across all boards
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: T.textFaint, fontSize: 13 }}>
              Loading…
            </div>
          ) : (
            <SmartCardList cards={cards} emptyMessage="You have no assigned cards." />
          )}
        </div>
      </div>
    </div>
  )
}
