'use client'
import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { T } from '@/lib/theme'
import type { TimelineCardResponse } from '@/types/api'
import Icon from '@/components/ui/Icon'
import Sidebar from './Sidebar'

const DAY_W = 34
const ROW_H = 38
const LABEL_W = 180
const HEADER_H1 = 28
const HEADER_H2 = 24

const BAR_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4',
  '#ec4899', '#ef4444', '#84cc16', '#f97316', '#6366f1',
]

function hashColor(str: string): string {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return BAR_COLORS[Math.abs(h) % BAR_COLORS.length]
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function addDays(base: Date, n: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}

function dayDiff(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

interface Props {
  boardId: string
}

export default function TimelineView({ boardId }: Props) {
  const [cards, setCards] = useState<TimelineCardResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [boardName, setBoardName] = useState('')
  const [tooltip, setTooltip] = useState<{ card: TimelineCardResponse; x: number; y: number } | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const viewStart = addDays(today, -30)
  const viewEnd = addDays(today, 92)
  const totalDays = dayDiff(viewStart, viewEnd)
  const todayOffset = dayDiff(viewStart, today)

  useEffect(() => {
    Promise.all([
      api.get<TimelineCardResponse[]>(`/api/v1/boards/${boardId}/timeline`).catch(() => []),
      api.get<{ name: string }>(`/api/v1/boards/${boardId}`).catch(() => ({ name: '' })),
    ]).then(([c, b]) => {
      setCards(c)
      setBoardName((b as any)?.name ?? '')
      setLoading(false)
    })
  }, [boardId])

  function dateToOffset(dateStr: string | null): number | null {
    if (!dateStr) return null
    const d = new Date(dateStr)
    d.setHours(0, 0, 0, 0)
    return dayDiff(viewStart, d)
  }

  // Build month segments for header
  const months: { label: string; startDay: number; days: number }[] = []
  {
    let cur = new Date(viewStart)
    while (cur < viewEnd) {
      const yr = cur.getFullYear()
      const mo = cur.getMonth()
      const start = dayDiff(viewStart, cur)
      const lastInMonth = new Date(yr, mo + 1, 0)
      const end = Math.min(dayDiff(viewStart, lastInMonth), totalDays - 1)
      months.push({
        label: cur.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
        startDay: start,
        days: end - start + 1,
      })
      cur = new Date(yr, mo + 1, 1)
    }
  }

  const totalW = totalDays * DAY_W
  const totalH = cards.length * ROW_H + HEADER_H1 + HEADER_H2

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
            <span style={{ color: T.textMuted }}>Timeline</span>
          </div>
        </div>

        {/* View tab strip */}
        <div style={{
          padding: '10px 18px 8px', flexShrink: 0,
          background: T.canvas, borderBottom: `1px solid ${T.topbarBorder}`,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-.02em', flex: 1 }}>
            {boardName || '…'}
          </h1>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 2,
            padding: 2, background: T.chipBg, borderRadius: 7,
          }}>
            {([
              { id: 'board', icon: 'grid', label: 'Board', href: `/boards/${boardId}` },
              { id: 'timeline', icon: 'timeline', label: 'Timeline', href: `/boards/${boardId}/timeline` },
              { id: 'cal', icon: 'cal', label: 'Calendar', href: `/boards/${boardId}/calendar` },
            ] as const).map(tab => {
              const active = tab.id === 'timeline'
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

        {/* Timeline grid */}
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, color: T.textFaint }}>Loading…</div>
        ) : (
          <div ref={gridRef} style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
            <div style={{ display: 'flex', minWidth: LABEL_W + totalW }}>

              {/* Fixed label column */}
              <div style={{
                width: LABEL_W, flexShrink: 0,
                position: 'sticky', left: 0, zIndex: 10,
                background: T.sidebar, borderRight: `1px solid ${T.cardBorder}`,
              }}>
                {/* Header spacer */}
                <div style={{ height: HEADER_H1 + HEADER_H2, borderBottom: `1px solid ${T.cardBorder}` }} />
                {cards.map((card, i) => (
                  <div key={card.id} style={{
                    height: ROW_H, display: 'flex', alignItems: 'center',
                    padding: '0 10px', fontSize: 12, color: T.text, fontWeight: 500,
                    borderBottom: `1px solid ${T.cardBorder}`,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    background: i % 2 === 0 ? T.sidebar : T.hover,
                  }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.title}</span>
                  </div>
                ))}
                {cards.length === 0 && (
                  <div style={{ padding: '30px 10px', fontSize: 12, color: T.textFaint, textAlign: 'center' }}>
                    No cards with dates
                  </div>
                )}
              </div>

              {/* Scrollable grid */}
              <div style={{ flex: 1, position: 'relative', minWidth: totalW }}>

                {/* Month header row */}
                <div style={{
                  height: HEADER_H1, display: 'flex',
                  position: 'sticky', top: 0, zIndex: 9,
                  background: T.sidebar, borderBottom: `1px solid ${T.cardBorder}`,
                }}>
                  {months.map((m, i) => (
                    <div key={i} style={{
                      width: m.days * DAY_W, flexShrink: 0,
                      fontSize: 11, fontWeight: 600, color: T.textMuted,
                      display: 'flex', alignItems: 'center', paddingLeft: 6,
                      borderRight: `1px solid ${T.cardBorder}`,
                    }}>
                      {m.label}
                    </div>
                  ))}
                </div>

                {/* Day header row */}
                <div style={{
                  height: HEADER_H2, display: 'flex',
                  position: 'sticky', top: HEADER_H1, zIndex: 9,
                  background: T.sidebar, borderBottom: `2px solid ${T.cardBorder}`,
                }}>
                  {Array.from({ length: totalDays }, (_, i) => {
                    const d = addDays(viewStart, i)
                    const dom = d.getDate()
                    const isToday = i === todayOffset
                    const isFirst = dom === 1
                    const show = dom === 1 || dom % 7 === 0
                    return (
                      <div key={i} style={{
                        width: DAY_W, flexShrink: 0,
                        fontSize: 10, fontWeight: isToday ? 700 : 400,
                        color: isToday ? T.accent : isFirst ? T.text : T.textFaint,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isToday ? T.accentSoft : 'transparent',
                        borderRight: isFirst ? `1px solid ${T.cardBorder}` : 'none',
                      }}>
                        {show || isToday ? dom : ''}
                      </div>
                    )
                  })}
                </div>

                {/* Row grid + bars */}
                <div style={{ position: 'relative' }}>
                  {/* Today line */}
                  <div style={{
                    position: 'absolute', top: 0, bottom: 0,
                    left: todayOffset * DAY_W + DAY_W / 2,
                    width: 2, background: T.accent, opacity: 0.5, zIndex: 5,
                    pointerEvents: 'none',
                  }} />

                  {cards.map((card, rowIdx) => {
                    const rawStart = dateToOffset(card.startDate)
                    const rawEnd = dateToOffset(card.dueDate)
                    const barStart = rawStart ?? rawEnd ?? 0
                    const barEnd = rawEnd ?? rawStart ?? 0
                    const clampedStart = Math.max(0, Math.min(barStart, totalDays - 1))
                    const clampedEnd = Math.max(clampedStart, Math.min(barEnd, totalDays - 1))
                    const barLeft = clampedStart * DAY_W
                    const barWidth = (clampedEnd - clampedStart + 1) * DAY_W
                    const color = hashColor(card.columnName)

                    return (
                      <div key={card.id} style={{
                        height: ROW_H, position: 'relative',
                        background: rowIdx % 2 === 0 ? T.canvas : T.hover,
                        borderBottom: `1px solid ${T.cardBorder}`,
                      }}>
                        {/* Day grid lines */}
                        {Array.from({ length: totalDays }, (_, i) => {
                          const d = addDays(viewStart, i)
                          if (d.getDate() === 1) {
                            return (
                              <div key={i} style={{
                                position: 'absolute', top: 0, bottom: 0,
                                left: i * DAY_W, width: 1,
                                background: T.cardBorder, zIndex: 1,
                              }} />
                            )
                          }
                          return null
                        })}

                        {/* Bar */}
                        <div
                          style={{
                            position: 'absolute', top: 6, height: ROW_H - 12,
                            left: barLeft, width: Math.max(barWidth, DAY_W),
                            background: color, borderRadius: 4,
                            zIndex: 3, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', paddingLeft: 6, overflow: 'hidden',
                          }}
                          onMouseEnter={e => {
                            const rect = (e.target as HTMLElement).getBoundingClientRect()
                            setTooltip({ card, x: rect.left, y: rect.top - 36 })
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        >
                          <span style={{
                            fontSize: 11, fontWeight: 500, color: '#fff',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>{barWidth > 60 ? card.title : ''}</span>
                        </div>
                      </div>
                    )
                  })}

                  {cards.length === 0 && (
                    <div style={{
                      height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, color: T.textFaint,
                    }}>
                      No cards have dates set. Add start or due dates to cards to see them here.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'fixed', left: tooltip.x, top: tooltip.y,
          background: 'rgba(15,23,42,.92)', color: '#fff',
          padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
          zIndex: 9999, pointerEvents: 'none', maxWidth: 240,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {tooltip.card.title}
          {(tooltip.card.startDate || tooltip.card.dueDate) && (
            <span style={{ color: 'rgba(255,255,255,.6)', marginLeft: 6, fontSize: 11 }}>
              {tooltip.card.startDate ?? '?'} → {tooltip.card.dueDate ?? '?'}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
