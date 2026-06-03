'use client'
import { useState } from 'react'
import {
  DndContext, DragOverlay,
  DragStartEvent, DragEndEvent,
  PointerSensor, useSensor, useSensors,
  closestCorners, useDroppable, useDraggable,
} from '@dnd-kit/core'
import type { ColumnResponse, CardResponse, MemberResponse } from '@/types/api'
import { T } from '@/lib/theme'
import { api } from '@/lib/api'
import { useIsMobile } from '@/lib/useIsMobile'
import ColumnList from './ColumnList'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type GroupBy = 'ASSIGNEE' | 'PRIORITY' | 'MODULE'

interface Props {
  boardId: string
  columns: ColumnResponse[]
  groupBy: GroupBy
  members: MemberResponse[]
  onSelectCard?: (card: CardResponse) => void
  onCardMoved?: (card: CardResponse) => void
  onDeleteColumn?: (id: string) => void
  onAddCard?: (columnId: string, card: CardResponse) => void
}

// ---------------------------------------------------------------------------
// Priority order + colours
// ---------------------------------------------------------------------------
const PRIORITY_GROUPS = ['URGENT', 'HIGH', 'MEDIUM', 'LOW', 'NONE'] as const
const PRIORITY_COLOR: Record<string, string> = {
  URGENT: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#3b82f6',
  NONE: '',
}

// ---------------------------------------------------------------------------
// Helper: group keys for a set of cards
// ---------------------------------------------------------------------------
function getGroupKey(card: CardResponse, groupBy: GroupBy): string {
  if (groupBy === 'PRIORITY') return card.priority ?? 'NONE'
  if (groupBy === 'ASSIGNEE') return card.assignees?.[0] ?? 'NONE'
  if (groupBy === 'MODULE') return card.modules?.[0]?.name ?? 'NONE'
  return 'NONE'
}

function buildLaneOrder(columns: ColumnResponse[], groupBy: GroupBy, members: MemberResponse[]): string[] {
  if (groupBy === 'PRIORITY') return [...PRIORITY_GROUPS]

  // Collect unique group keys in order of first appearance
  const seen = new Set<string>()
  const keys: string[] = []
  for (const col of columns) {
    for (const card of col.cards ?? []) {
      const key = getGroupKey(card, groupBy)
      if (!seen.has(key) && key !== 'NONE') {
        seen.add(key)
        keys.push(key)
      }
    }
  }
  // Always append None lane last
  keys.push('NONE')
  return keys
}

function getLaneLabel(groupKey: string, groupBy: GroupBy, members: MemberResponse[]): string {
  if (groupKey === 'NONE') return 'None'
  if (groupBy === 'ASSIGNEE') {
    const m = members.find(m => m.userId === groupKey)
    return m ? m.displayName : groupKey
  }
  return groupKey
}

// ---------------------------------------------------------------------------
// Draggable card chip
// ---------------------------------------------------------------------------
function DraggableCardChip({
  card,
  onSelectCard,
}: {
  card: CardResponse
  onSelectCard?: (card: CardResponse) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: { card },
  })

  const style: React.CSSProperties = {
    padding: '5px 8px',
    marginBottom: 4,
    background: T.card,
    border: `1px solid ${T.cardBorder}`,
    borderRadius: 6,
    cursor: 'grab',
    fontSize: 12,
    color: T.text,
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    opacity: isDragging ? 0.4 : 1,
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    boxShadow: T.cardShadow,
    userSelect: 'none',
  }

  const priorityColor = card.priority !== 'NONE' ? PRIORITY_COLOR[card.priority] : undefined

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onSelectCard?.(card)}>
      {priorityColor && (
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: priorityColor, flexShrink: 0,
        }} />
      )}
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {card.title}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Droppable cell (one lane x column intersection)
// ---------------------------------------------------------------------------
function DroppableCell({
  droppableId,
  cards,
  onSelectCard,
}: {
  droppableId: string
  cards: CardResponse[]
  onSelectCard?: (card: CardResponse) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: droppableId })

  return (
    <div
      ref={setNodeRef}
      style={{
        minWidth: 200,
        minHeight: 60,
        padding: '6px 8px',
        background: isOver ? T.accentSoft : T.column,
        border: `1px solid ${isOver ? T.accent : T.cardBorder}`,
        borderRadius: 6,
        transition: 'background 0.15s, border-color 0.15s',
      }}
    >
      {cards.map(card => (
        <DraggableCardChip key={card.id} card={card} onSelectCard={onSelectCard} />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// SwimlaneView
// ---------------------------------------------------------------------------
export default function SwimlaneView({
  boardId,
  columns,
  groupBy,
  members,
  onSelectCard,
  onCardMoved,
  onDeleteColumn,
  onAddCard,
}: Props) {
  const isMobile = useIsMobile()
  const [localColumns, setLocalColumns] = useState<ColumnResponse[]>(columns)
  const [draggingCard, setDraggingCard] = useState<CardResponse | null>(null)

  // Sync from parent when not dragging
  if (!draggingCard && localColumns !== columns) {
    setLocalColumns(columns)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // Mobile fallback
  if (isMobile) {
    return (
      <ColumnList
        boardId={boardId}
        columns={columns}
        onDeleteColumn={onDeleteColumn ?? (() => {})}
        onSelectCard={onSelectCard}
        onAddCard={onAddCard}
        onCardMoved={onCardMoved}
      />
    )
  }

  const laneKeys = buildLaneOrder(localColumns, groupBy, members)

  // Build lookup: groupKey -> columnId -> cards[]
  const grid: Record<string, Record<string, CardResponse[]>> = {}
  for (const key of laneKeys) {
    grid[key] = {}
    for (const col of localColumns) {
      grid[key][col.id] = []
    }
  }
  for (const col of localColumns) {
    for (const card of col.cards ?? []) {
      const key = getGroupKey(card, groupBy)
      if (grid[key] && grid[key][col.id]) {
        grid[key][col.id].push(card)
      }
    }
  }

  // Only render lanes that have at least one card (or all lanes for PRIORITY)
  const visibleLanes = groupBy === 'PRIORITY'
    ? laneKeys
    : laneKeys.filter(key => laneKeys.includes(key) && (
        key === 'NONE'
          ? Object.values(grid[key] ?? {}).some(cards => cards.length > 0)
          : Object.values(grid[key] ?? {}).some(cards => cards.length > 0)
      ))

  function onDragStart({ active }: DragStartEvent) {
    const card = localColumns.flatMap(c => c.cards ?? []).find(c => c.id === active.id)
    setDraggingCard(card ?? null)
  }

  async function onDragEnd({ active, over }: DragEndEvent) {
    setDraggingCard(null)
    if (!over) return

    // over.id is `${groupKey}::${columnId}`
    const [newGroupKey, newColId] = String(over.id).split('::')
    if (!newGroupKey || !newColId) return

    // Find the card
    const card = localColumns.flatMap(c => c.cards ?? []).find(c => c.id === active.id)
    if (!card) return

    const currentGroupKey = getGroupKey(card, groupBy)
    const groupChanged = currentGroupKey !== newGroupKey
    const colChanged = card.columnId !== newColId

    if (!groupChanged && !colChanged) return

    // Optimistic local update
    setLocalColumns(prev => {
      const updated = prev.map(col => ({
        ...col,
        cards: (col.cards ?? []).filter(c => c.id !== card.id),
      }))
      return updated.map(col => {
        if (col.id !== newColId) return col
        const updatedCard = buildUpdatedCard(card, groupBy, newGroupKey)
        return { ...col, cards: [...(col.cards ?? []), updatedCard] }
      })
    })

    // Persist attribute change if group changed
    if (groupChanged) {
      if (groupBy === 'PRIORITY') {
        try {
          const updated = await api.patch<CardResponse>(`/api/v1/cards/${card.id}`, {
            priority: newGroupKey === 'NONE' ? 'NONE' : newGroupKey,
          })
          onCardMoved?.(updated)
        } catch {
          setLocalColumns(columns) // rollback
        }
      } else if (groupBy === 'ASSIGNEE') {
        try {
          const assignees = newGroupKey === 'NONE' ? [] : [newGroupKey]
          const updated = await api.patch<CardResponse>(`/api/v1/cards/${card.id}`, { assignees })
          onCardMoved?.(updated)
        } catch {
          setLocalColumns(columns)
        }
      } else if (groupBy === 'MODULE') {
        // Module assignment requires separate endpoints — skip API call
        console.warn('[SwimlaneView] MODULE group change: API call skipped (requires separate module endpoints)')
        onCardMoved?.({ ...card })
      }
    } else if (colChanged) {
      // Column change only — use move endpoint
      try {
        const updated = await api.patch<CardResponse>(`/api/v1/cards/${card.id}/move`, {
          targetColumnId: newColId,
          position: 65536,
        })
        onCardMoved?.(updated)
      } catch {
        setLocalColumns(columns)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div
        data-testid="swimlane-view"
        style={{
          height: '100%',
          overflowY: 'auto',
          overflowX: 'auto',
          padding: '14px 18px',
        }}
      >
        {/* Header row: empty corner + column names */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 8,
          position: 'sticky',
          top: 0,
          background: T.canvas,
          zIndex: 2,
          paddingBottom: 6,
          borderBottom: `1px solid ${T.cardBorder}`,
        }}>
          <div style={{ width: 120, flexShrink: 0 }} />
          {localColumns.map(col => (
            <div key={col.id} style={{
              minWidth: 200,
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: '.05em',
              color: T.textFaint,
              textTransform: 'uppercase',
              padding: '4px 8px',
            }}>
              {col.name}
              <span style={{ marginLeft: 5, fontWeight: 400, fontSize: 11, color: T.textFaint }}>
                {col.cards?.length ?? 0}
              </span>
            </div>
          ))}
        </div>

        {/* Lane rows */}
        {visibleLanes.map((laneKey, laneIdx) => {
          const label = getLaneLabel(laneKey, groupBy, members)
          const isLast = laneIdx === visibleLanes.length - 1
          const laneCardCount = Object.values(grid[laneKey] ?? {}).reduce(
            (sum, cards) => sum + cards.length, 0
          )

          return (
            <div
              key={laneKey}
              data-testid={`lane-${laneKey}`}
              style={{
                display: 'flex',
                gap: 8,
                marginBottom: isLast ? 0 : 12,
                paddingBottom: isLast ? 0 : 12,
                borderBottom: isLast ? 'none' : `1px solid ${T.cardBorder}`,
              }}
            >
              {/* Lane header — sticky left */}
              <div style={{
                width: 120,
                flexShrink: 0,
                paddingTop: 6,
                position: 'sticky',
                left: 0,
                background: T.canvas,
                zIndex: 1,
              }}>
                <div style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 2,
                }}>
                  {groupBy === 'PRIORITY' && laneKey !== 'NONE' && (
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: PRIORITY_COLOR[laneKey],
                      display: 'inline-block',
                      marginBottom: 2,
                    }} />
                  )}
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: T.text,
                    letterSpacing: '.01em',
                  }}>
                    {label}
                  </span>
                  <span style={{ fontSize: 11, color: T.textFaint }}>
                    {laneCardCount} card{laneCardCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Cells — one per column */}
              {localColumns.map(col => {
                const droppableId = `${laneKey}::${col.id}`
                const cellCards = grid[laneKey]?.[col.id] ?? []
                return (
                  <DroppableCell
                    key={droppableId}
                    droppableId={droppableId}
                    cards={cellCards}
                    onSelectCard={onSelectCard}
                  />
                )
              })}
            </div>
          )
        })}
      </div>

      <DragOverlay>
        {draggingCard ? (
          <div style={{
            padding: '5px 8px',
            background: T.card,
            border: `1px solid ${T.accent}`,
            borderRadius: 6,
            fontSize: 12,
            color: T.text,
            boxShadow: '0 4px 12px rgba(0,0,0,.2)',
            minWidth: 140,
            maxWidth: 220,
          }}>
            {draggingCard.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

// ---------------------------------------------------------------------------
// Helper: build updated card with new group attribute
// ---------------------------------------------------------------------------
function buildUpdatedCard(card: CardResponse, groupBy: GroupBy, newGroupKey: string): CardResponse {
  if (groupBy === 'PRIORITY') {
    return { ...card, priority: (newGroupKey === 'NONE' ? 'NONE' : newGroupKey) as CardResponse['priority'] }
  }
  if (groupBy === 'ASSIGNEE') {
    return { ...card, assignees: newGroupKey === 'NONE' ? [] : [newGroupKey] }
  }
  return card
}
