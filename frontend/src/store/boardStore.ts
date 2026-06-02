'use client'
import { create } from 'zustand'
import type { BoardResponse, CardResponse, ColumnResponse, LabelResponse, Priority } from '@/types/api'
import type { BoardEvent } from '@/lib/websocket'

interface BoardStore {
  board: BoardResponse | null
  setBoard: (board: BoardResponse | null) => void
  addCard: (columnId: string, card: CardResponse) => void
  updateCard: (card: CardResponse) => void
  moveCard: (card: CardResponse) => void
  deleteCard: (cardId: string) => void
  addColumn: (col: ColumnResponse) => void
  deleteColumn: (columnId: string) => void
  updateColumnColor: (columnId: string, headerColor: string | null) => void
  reorderColumns: (orderedIds: string[]) => void
  applyEvent: (event: BoardEvent) => void
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  board: null,

  setBoard: (board) => set({ board }),

  addCard: (columnId, card) => set(({ board }) => {
    if (!board) return {}
    const exists = (board.columns ?? []).flatMap(c => c.cards ?? []).some(c => c.id === card.id)
    if (exists) return {}
    return {
      board: {
        ...board,
        columns: (board.columns ?? []).map(col =>
          col.id === columnId
            ? { ...col, cards: [...(col.cards ?? []), card] }
            : col
        ),
      },
    }
  }),

  updateCard: (updated) => set(({ board }) => board ? {
    board: {
      ...board,
      columns: (board.columns ?? []).map(col => ({
        ...col,
        cards: (col.cards ?? []).map(c => c.id === updated.id ? updated : c),
      })),
    },
  } : {}),

  moveCard: (updated) => set(({ board }) => {
    if (!board) return {}
    const cols = (board.columns ?? []).map(col => {
      const filtered = (col.cards ?? []).filter(c => c.id !== updated.id)
      if (col.id === updated.columnId) {
        return { ...col, cards: [...filtered, updated].sort((a, b) => a.position - b.position) }
      }
      return { ...col, cards: filtered }
    })
    return { board: { ...board, columns: cols } }
  }),

  deleteCard: (cardId) => set(({ board }) => board ? {
    board: {
      ...board,
      columns: (board.columns ?? []).map(col => ({
        ...col,
        cards: (col.cards ?? []).filter(c => c.id !== cardId),
      })),
    },
  } : {}),

  addColumn: (col) => set(({ board }) => {
    if (!board) return {}
    if ((board.columns ?? []).some(c => c.id === col.id)) return {}
    return { board: { ...board, columns: [...(board.columns ?? []), col] } }
  }),

  deleteColumn: (columnId) => set(({ board }) => board ? {
    board: {
      ...board,
      columns: (board.columns ?? []).filter(c => c.id !== columnId),
    },
  } : {}),

  updateColumnColor: (columnId, headerColor) =>
    set(({ board }) =>
      board
        ? {
            board: {
              ...board,
              columns: (board.columns ?? []).map((col) =>
                col.id === columnId ? { ...col, headerColor } : col
              ),
            },
          }
        : {}
    ),

  reorderColumns: (orderedIds) => set(({ board }) => {
    if (!board) return {}
    const colMap = new Map((board.columns ?? []).map(c => [c.id, c]))
    const reordered = orderedIds
      .map((id, idx) => {
        const col = colMap.get(id)
        return col ? { ...col, position: idx } : null
      })
      .filter((c): c is ColumnResponse => c !== null)
    return { board: { ...board, columns: reordered } }
  }),

  applyEvent: (event) => {
    const { board } = get()
    if (!board) return

    switch (event.eventType) {
      case 'CARD_CREATED': {
        const d = event.data as {
          id: string; columnId: string; title: string; position: number
          assignees: string[]; dueDate: string | null; priority: Priority; labels: LabelResponse[]
        }
        get().addCard(d.columnId, {
          id: d.id, columnId: d.columnId, title: d.title, description: null,
          position: d.position, startDate: null, assignees: d.assignees ?? [], dueDate: d.dueDate,
          priority: d.priority ?? 'NONE', labels: d.labels ?? [],
        })
        break
      }
      case 'CARD_UPDATED': {
        const d = event.data as {
          id: string; columnId: string; title: string; description: string | null
          assignees: string[]; dueDate: string | null; priority: Priority; labels: LabelResponse[]
          updatedAt: string
        }
        get().updateCard({
          id: d.id, columnId: d.columnId, title: d.title, description: d.description,
          position: (board.columns ?? []).flatMap(c => c.cards ?? []).find(c => c.id === d.id)?.position ?? 0,
          startDate: null, assignees: d.assignees ?? [], dueDate: d.dueDate, priority: d.priority ?? 'NONE',
          labels: d.labels ?? [], updatedAt: d.updatedAt,
        })
        break
      }
      case 'CARD_MOVED': {
        const d = event.data as {
          id: string; fromColumnId: string; toColumnId: string
          newPosition: number; updatedAt: string
        }
        const existing = (board.columns ?? []).flatMap(c => c.cards ?? []).find(c => c.id === d.id)
        if (!existing) break
        get().moveCard({ ...existing, columnId: d.toColumnId, position: d.newPosition, updatedAt: d.updatedAt })
        break
      }
      case 'CARD_DELETED': {
        const d = event.data as { id: string; columnId: string }
        get().deleteCard(d.id)
        break
      }
      case 'COLUMN_CREATED': {
        const d = event.data as { id: string; name: string; position: number }
        if ((board.columns ?? []).some(c => c.id === d.id)) break
        get().addColumn({ id: d.id, boardId: board.id, name: d.name, position: d.position, cards: [] })
        break
      }
      case 'COLUMN_UPDATED': {
        const d = event.data as { id: string; name: string }
        set(({ board: b }) => b ? {
          board: {
            ...b,
            columns: (b.columns ?? []).map(col =>
              col.id === d.id ? { ...col, name: d.name } : col
            ),
          },
        } : {})
        break
      }
      case 'COLUMN_REORDERED': {
        const d = event.data as { columns: { id: string; position: number }[] }
        set(({ board: b }) => {
          if (!b) return {}
          const posMap = new Map(d.columns.map(c => [c.id, c.position]))
          const reordered = (b.columns ?? [])
            .map(col => ({ ...col, position: posMap.get(col.id) ?? col.position }))
            .sort((a, b) => a.position - b.position)
          return { board: { ...b, columns: reordered } }
        })
        break
      }
      case 'COLUMN_DELETED': {
        const d = event.data as { id: string }
        get().deleteColumn(d.id)
        break
      }
      case 'COLUMN_COLOR_UPDATED': {
        const d = event.data as { id: string; headerColor: string | null }
        get().updateColumnColor(d.id, d.headerColor)
        break
      }
    }
  },
}))
