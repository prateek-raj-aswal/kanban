'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { T } from '@/lib/theme'
import type { BoardResponse, CardResponse } from '@/types/api'
import Icon from '@/components/ui/Icon'
import Sidebar from './Sidebar'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface Props {
  boardId: string
}

function parseLocalDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export default function CalendarView({ boardId }: Props) {
  const [boardName, setBoardName] = useState('')
  const [cards, setCards] = useState<CardResponse[]>([])
  const [loading, setLoading] = useState(true)

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth()) // 0-indexed

  useEffect(() => {
    api.get<BoardResponse>(`/api/v1/boards/${boardId}`)
      .then(b => {
        setBoardName(b.name)
        const all: CardResponse[] = []
        for (const col of b.columns ?? []) all.push(...(col.cards ?? []))
        setCards(all)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [boardId])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7

  // Map dueDate -> cards
  const byDate = new Map<string, CardResponse[]>()
  for (const card of cards) {
    if (!card.dueDate) continue
    const key = card.dueDate.slice(0, 10)
    const m = byDate.get(key)
    if (m) m.push(card)
    else byDate.set(key, [card])
  }

  const monthLabel = new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      background: T.canvas, color: T.text,
    }}>
      <Sidebar currentBoardId={boardId} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{
          height: 44, flexShrink: 0, display: 'flex', alignItems: 'center',
          padding: '0 14px', gap: 14,
          borderBottom: `1px solid ${T.topbarBorder}`, background: T.topbar,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: T.textMuted }}>
            <a href="/boards" style={{ color: T.textMuted, textDecoration: 'none' }}>My Boards</a>
            <Icon name="chevron" size={10} sw={2} />
            <a href={`/boards/${boardId}`} style={{ color: T.text, fontWeight: 600, textDecoration: 'none' }}>
              {boardName || '…'}
            </a>
            <Icon name="chevron" size={10} sw={2} />
            <span style={{ color: T.textMuted }}>Calendar</span>
          </div>
        </div>

        {/* Header: title + view toggle + month nav */}
        <div style={{
          padding: '10px 18px 8px', flexShrink: 0,
          background: T.canvas, borderBottom: `1px solid ${T.topbarBorder}`,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-.02em', flex: 1 }}>
            {boardName || '…'}
          </h1>

          {/* Month navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={prevMonth}
              style={{
                width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 5,
                cursor: 'pointer', color: T.text,
              }}
            >
              <Icon name="chevron" size={10} sw={2} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 130, textAlign: 'center' }}>{monthLabel}</span>
            <button
              onClick={nextMonth}
              style={{
                width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 5,
                cursor: 'pointer', color: T.text,
              }}
            >
              <Icon name="chevron" size={10} sw={2} />
            </button>
          </div>

          {/* View toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 2,
            padding: 2, background: T.chipBg, borderRadius: 7,
          }}>
            {([
              { id: 'board', icon: 'grid', label: 'Board', href: `/boards/${boardId}` },
              { id: 'timeline', icon: 'timeline', label: 'Timeline', href: `/boards/${boardId}/timeline` },
              { id: 'cal', icon: 'cal', label: 'Calendar', href: `/boards/${boardId}/calendar` },
            ] as const).map(tab => {
              const active = tab.id === 'cal'
              return (
                <a key={tab.id} href={tab.href} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '6px 9px', borderRadius: 5,
                  fontSize: 12, fontWeight: 500, textDecoration: 'none',
                  color: active ? T.text : T.textMuted,
                  background: active ? T.card : 'transparent',
                  border: active ? `1px solid ${T.cardBorder}` : '1px solid transparent',
                  boxShadow: active ? T.cardShadow : 'none',
                }}>
                  <Icon name={tab.icon as any} size={12} sw={1.7} />
                  {tab.label}
                </a>
              )
            })}
          </div>
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, color: T.textFaint }}>Loading…</div>
        ) : (
          <div style={{ flex: 1, overflow: 'auto', padding: '12px 18px' }}>
            {/* Day-of-week header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 1 }}>
              {DAY_LABELS.map(d => (
                <div key={d} style={{
                  padding: '6px 8px', fontSize: 11, fontWeight: 700,
                  color: T.textFaint, textTransform: 'uppercase', letterSpacing: '.06em',
                  textAlign: 'center',
                }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 1, background: T.cardBorder, border: `1px solid ${T.cardBorder}`, borderRadius: 8,
              overflow: 'hidden',
            }}>
              {Array.from({ length: totalCells }, (_, i) => {
                const dayNum = i - firstDay + 1
                const inMonth = dayNum >= 1 && dayNum <= daysInMonth
                const dateStr = inMonth
                  ? `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                  : ''
                const isToday = dateStr === todayStr
                const dayCards = dateStr ? (byDate.get(dateStr) ?? []) : []

                return (
                  <div key={i} style={{
                    minHeight: 90, padding: 6,
                    background: inMonth ? T.card : T.sidebar,
                    opacity: inMonth ? 1 : 0.4,
                  }}>
                    {inMonth && (
                      <>
                        <div style={{
                          fontSize: 11, fontWeight: isToday ? 700 : 500,
                          color: isToday ? '#fff' : T.textMuted,
                          background: isToday ? T.accent : 'transparent',
                          width: 22, height: 22, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginBottom: 4,
                        }}>
                          {dayNum}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {dayCards.slice(0, 3).map(card => (
                            <div key={card.id} style={{
                              fontSize: 10.5, fontWeight: 500,
                              background: T.accentSoft, color: T.accent,
                              padding: '2px 5px', borderRadius: 3,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              cursor: 'pointer',
                            }} title={card.title}>
                              {card.title}
                            </div>
                          ))}
                          {dayCards.length > 3 && (
                            <div style={{ fontSize: 10, color: T.textFaint, paddingLeft: 4 }}>
                              +{dayCards.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
