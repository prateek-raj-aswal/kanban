'use client'
import { useState, useEffect, useRef } from 'react'
import {
  DndContext, DragOverlay,
  DragStartEvent, DragEndEvent, DragOverEvent,
  PointerSensor, useSensor, useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import type { ColumnResponse, CardResponse } from '@/types/api'
import { T } from '@/lib/theme'
import { api } from '@/lib/api'
import { computeNewPosition } from '@/lib/dnd'
import { useBoardStore } from '@/store/boardStore'
import Column from './Column'
import CardItem from './CardItem'

interface Props {
  boardId: string
  columns: ColumnResponse[]
  onDeleteColumn: (id: string) => void
  onSelectCard?: (card: CardResponse) => void
  onAddCard?: (columnId: string, card: CardResponse) => void
  onCardMoved?: (card: CardResponse) => void
  swimlanes?: boolean
}

function findCardColumnId(cardId: string, cols: ColumnResponse[]): string | null {
  return cols.find(c => (c.cards ?? []).some(card => card.id === cardId))?.id ?? null
}

function findContainerId(id: string, cols: ColumnResponse[]): string | null {
  if (cols.some(c => c.id === id)) return id
  return findCardColumnId(id, cols)
}

export default function ColumnList({ boardId, columns, onDeleteColumn, onSelectCard, onAddCard, onCardMoved, swimlanes }: Props) {
  const reorderColumns = useBoardStore(s => s.reorderColumns)
  const [localColumns, setLocalColumns] = useState<ColumnResponse[]>(columns)
  const [activeCard, setActiveCard] = useState<CardResponse | null>(null)
  const [activeColumn, setActiveColumn] = useState<ColumnResponse | null>(null)
  const [moving, setMoving] = useState(false)
  const localColumnsRef = useRef(localColumns)
  const originalColumnsRef = useRef<ColumnResponse[] | null>(null)

  useEffect(() => { localColumnsRef.current = localColumns }, [localColumns])

  // Sync from parent when not dragging
  useEffect(() => {
    if (!activeCard && !activeColumn) setLocalColumns(columns)
  }, [columns, activeCard, activeColumn])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function onDragStart({ active }: DragStartEvent) {
    if (moving) return
    originalColumnsRef.current = localColumnsRef.current
    if (active.data.current?.type === 'column') {
      setActiveColumn(localColumnsRef.current.find(c => c.id === active.id) ?? null)
    } else {
      const card = localColumnsRef.current.flatMap(c => c.cards ?? []).find(c => c.id === active.id)
      setActiveCard(card ?? null)
    }
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over || active.id === over.id) return

    // Column reorder (live preview)
    if (active.data.current?.type === 'column') {
      setLocalColumns(prev => {
        const activeIdx = prev.findIndex(c => c.id === active.id)
        const overIdx = prev.findIndex(c => c.id === over.id)
        if (activeIdx < 0 || overIdx < 0 || activeIdx === overIdx) return prev
        return arrayMove(prev, activeIdx, overIdx)
      })
      return
    }

    // Card cross-column move
    setLocalColumns(prev => {
      const activeColId = findCardColumnId(active.id as string, prev)
      const overColId = findContainerId(over.id as string, prev)
      if (!activeColId || !overColId || activeColId === overColId) return prev

      const newCols = prev.map(c => ({ ...c, cards: [...(c.cards ?? [])] }))
      const fromCol = newCols.find(c => c.id === activeColId)!
      const toCol = newCols.find(c => c.id === overColId)!
      const activeIdx = fromCol.cards!.findIndex(c => c.id === active.id)
      if (activeIdx < 0) return prev
      const [movedCard] = fromCol.cards!.splice(activeIdx, 1)
      const overCardIdx = toCol.cards!.findIndex(c => c.id === over.id)
      if (overCardIdx >= 0) toCol.cards!.splice(overCardIdx, 0, movedCard)
      else toCol.cards!.push(movedCard)
      return newCols
    })
  }

  async function onDragEnd({ active, over }: DragEndEvent) {
    const orig = originalColumnsRef.current
    originalColumnsRef.current = null

    if (!over || !orig) {
      setActiveCard(null)
      setActiveColumn(null)
      if (orig) setLocalColumns(orig)
      return
    }

    // Column reorder — persist to backend.
    // Active state is cleared in `finally` so the sync effect only fires AFTER
    // reorderColumns has updated the store, preventing the stale-prop overwrite.
    if (active.data.current?.type === 'column') {
      const finalCols = localColumnsRef.current
      const unchanged = finalCols.map(c => c.id).join() === orig.map(c => c.id).join()
      if (unchanged) {
        setActiveCard(null)
        setActiveColumn(null)
        return
      }
      try {
        await api.patch(`/api/v1/boards/${boardId}/columns/reorder`, {
          columnIds: finalCols.map(c => c.id),
        })
        reorderColumns(finalCols.map(c => c.id))
      } catch {
        setLocalColumns(orig)
      } finally {
        setActiveCard(null)
        setActiveColumn(null)
      }
      return
    }

    // For card moves clear active state before the async work (same as before)
    setActiveCard(null)
    setActiveColumn(null)

    // After onDragOver, card may already be in the target column in localColumnsRef
    let finalCols = localColumnsRef.current
    const currentColId = findCardColumnId(active.id as string, finalCols)
    const overColId = findContainerId(over.id as string, finalCols)

    if (!currentColId || !overColId) { setLocalColumns(orig); return }

    // Same-column reorder: onDragOver didn't move it, do arrayMove here
    if (currentColId === overColId) {
      const col = finalCols.find(c => c.id === currentColId)!
      const cards = col.cards ?? []
      const oldIdx = cards.findIndex(c => c.id === active.id)
      const newIdx = cards.findIndex(c => c.id === over.id)
      if (oldIdx >= 0 && newIdx >= 0 && oldIdx !== newIdx) {
        const moved = arrayMove(cards, oldIdx, newIdx)
        finalCols = finalCols.map(c => c.id === currentColId ? { ...c, cards: moved } : c)
        setLocalColumns(finalCols)
      }
    }

    // Compute new position from final state
    const targetCol = finalCols.find(c => c.id === currentColId)
    if (!targetCol) return
    const targetCards = targetCol.cards ?? []
    const insertIdx = targetCards.findIndex(c => c.id === active.id)
    const siblingPositions = targetCards.filter(c => c.id !== active.id).map(c => c.position)
    const newPosition = computeNewPosition(
      siblingPositions,
      insertIdx < 0 ? siblingPositions.length : insertIdx,
    )

    // Skip API call if card didn't move
    const origColId = findCardColumnId(active.id as string, orig)
    const origIdx = orig.find(c => c.id === origColId)?.cards?.findIndex(c => c.id === active.id) ?? -1
    const finalIdx = finalCols.find(c => c.id === currentColId)?.cards?.findIndex(c => c.id === active.id) ?? -1
    if (origColId === currentColId && origIdx === finalIdx) return

    setMoving(true)
    try {
      const updated = await api.patch<CardResponse>(`/api/v1/cards/${active.id}/move`, {
        targetColumnId: currentColId,
        position: newPosition,
      })
      onCardMoved?.(updated)
    } catch {
      setLocalColumns(orig)
    } finally {
      setMoving(false)
    }
  }

  function handleRenameColumn(id: string, name: string) {
    setLocalColumns(prev => prev.map(c => c.id === id ? { ...c, name } : c))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={localColumns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
        <div style={{
          display: 'flex', gap: 14, alignItems: 'flex-start',
          height: '100%', overflowX: 'auto', padding: '14px 18px',
        }}>
          {localColumns.map(col => (
            <Column
              key={col.id}
              column={col}
              onDeleteColumn={onDeleteColumn}
              onRenameColumn={handleRenameColumn}
              onSelectCard={onSelectCard}
              onAddCard={onAddCard}
              swimlanes={swimlanes}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeCard ? <CardItem card={activeCard} /> : null}
        {activeColumn ? (
          <div style={{
            width: 268, background: T.column, borderRadius: 8,
            padding: '10px 12px 14px', opacity: 0.9,
            boxShadow: '0 8px 24px rgba(0,0,0,.18)',
            fontSize: 12, fontWeight: 600, color: T.text,
          }}>
            {activeColumn.name}
            <span style={{ marginLeft: 6, fontWeight: 400, color: T.textFaint, fontSize: 11 }}>
              {activeColumn.cards?.length ?? 0}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
