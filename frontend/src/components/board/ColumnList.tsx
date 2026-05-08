'use client'
import { useState, useEffect, useRef } from 'react'
import {
  DndContext, DragOverlay,
  DragStartEvent, DragEndEvent, DragOverEvent,
  PointerSensor, useSensor, useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import type { ColumnResponse, CardResponse } from '@/types/api'
import { api } from '@/lib/api'
import { computeNewPosition } from '@/lib/dnd'
import Column from './Column'
import CardItem from './CardItem'

interface Props {
  columns: ColumnResponse[]
  onDeleteColumn: (id: string) => void
  onSelectCard?: (card: CardResponse) => void
  onAddCard?: (columnId: string, card: CardResponse) => void
  onCardMoved?: (card: CardResponse) => void
}

function findCardColumnId(cardId: string, cols: ColumnResponse[]): string | null {
  return cols.find(c => (c.cards ?? []).some(card => card.id === cardId))?.id ?? null
}

function findContainerId(id: string, cols: ColumnResponse[]): string | null {
  if (cols.some(c => c.id === id)) return id
  return findCardColumnId(id, cols)
}

export default function ColumnList({ columns, onDeleteColumn, onSelectCard, onAddCard, onCardMoved }: Props) {
  const [localColumns, setLocalColumns] = useState<ColumnResponse[]>(columns)
  const [activeCard, setActiveCard] = useState<CardResponse | null>(null)
  const [moving, setMoving] = useState(false)
  const localColumnsRef = useRef(localColumns)
  const originalColumnsRef = useRef<ColumnResponse[] | null>(null)

  useEffect(() => { localColumnsRef.current = localColumns }, [localColumns])

  // Sync from parent when not dragging
  useEffect(() => {
    if (!activeCard) setLocalColumns(columns)
  }, [columns, activeCard])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function onDragStart({ active }: DragStartEvent) {
    if (moving) return
    originalColumnsRef.current = localColumnsRef.current
    const card = localColumnsRef.current.flatMap(c => c.cards ?? []).find(c => c.id === active.id)
    setActiveCard(card ?? null)
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over || active.id === over.id) return
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
    setActiveCard(null)
    const orig = originalColumnsRef.current
    originalColumnsRef.current = null

    if (!over || !orig) { if (orig) setLocalColumns(orig); return }

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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div style={{
        display: 'flex', gap: 14, alignItems: 'flex-start',
        height: '100%', overflowX: 'auto', padding: '14px 18px',
      }}>
        {localColumns.map(col => (
          <Column
            key={col.id}
            column={col}
            onDeleteColumn={onDeleteColumn}
            onSelectCard={onSelectCard}
            onAddCard={onAddCard}
          />
        ))}
      </div>
      <DragOverlay>
        {activeCard ? <CardItem card={activeCard} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
