'use client'
import { useState } from 'react'
import { T } from '@/lib/theme'
import IssuesPanel from '@/components/board/IssuesPanel'
import type { IssueStatus } from '@/types/api'

type FilterValue = IssueStatus | 'ALL'

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'ALL',         label: 'All' },
  { value: 'OPEN',        label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'CLOSED',      label: 'Closed' },
]

export default function IssuesPage() {
  const [filter, setFilter] = useState<FilterValue>('ALL')

  return (
    <div style={{
      minHeight: '100vh',
      background: T.canvas,
      padding: '24px 20px 80px',
      maxWidth: 720,
      margin: '0 auto',
    }}>
      <h1 style={{
        fontSize: 20, fontWeight: 700, color: T.text,
        marginBottom: 16, letterSpacing: '-.01em',
      }}>
        Issues
      </h1>

      {/* Status filter tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 20,
        borderBottom: `1px solid ${T.cardBorder}`, paddingBottom: 0,
      }}>
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              padding: '6px 12px', fontSize: 12, fontWeight: 600,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: filter === f.value ? T.accent : T.textMuted,
              borderBottom: filter === f.value ? `2px solid ${T.accent}` : '2px solid transparent',
              marginBottom: -1,
              borderRadius: 0,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <IssuesPanel statusFilter={filter} />
    </div>
  )
}
