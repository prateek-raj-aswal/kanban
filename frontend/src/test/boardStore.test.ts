import { describe, it, expect, beforeEach } from 'vitest'
import { useBoardStore } from '@/store/boardStore'
import type { BoardResponse, CardResponse } from '@/types/api'
import type { BoardEvent } from '@/lib/websocket'

const makeBoard = (): BoardResponse => ({
  id: 'board-1', name: 'Test Board', ownerId: 'user-1', createdAt: '',
  columns: [
    {
      id: 'col-1', boardId: 'board-1', name: 'Todo', position: 1000,
      cards: [
        { id: 'card-1', columnId: 'col-1', title: 'Card 1', description: null,
          position: 1000, startDate: null, assignees: [], dueDate: null, priority: 'NONE', labels: [] },
      ],
    },
    {
      id: 'col-2', boardId: 'board-1', name: 'Done', position: 2000,
      cards: [],
    },
  ],
})

describe('boardStore', () => {
  beforeEach(() => {
    useBoardStore.setState({ board: null })
  })

  it('setBoard stores board', () => {
    useBoardStore.getState().setBoard(makeBoard())
    expect(useBoardStore.getState().board?.id).toBe('board-1')
  })

  it('addCard appends to correct column', () => {
    useBoardStore.getState().setBoard(makeBoard())
    const newCard: CardResponse = {
      id: 'card-2', columnId: 'col-1', title: 'New', description: null,
      position: 2000, startDate: null, assignees: [], dueDate: null, priority: 'NONE', labels: [],
    }
    useBoardStore.getState().addCard('col-1', newCard)
    const cards = useBoardStore.getState().board!.columns![0].cards!
    expect(cards).toHaveLength(2)
    expect(cards[1].id).toBe('card-2')
  })

  it('updateCard replaces card in-place', () => {
    useBoardStore.getState().setBoard(makeBoard())
    const updated: CardResponse = {
      id: 'card-1', columnId: 'col-1', title: 'Updated', description: 'desc',
      position: 1000, startDate: null, assignees: [], dueDate: null, priority: 'NONE', labels: [],
    }
    useBoardStore.getState().updateCard(updated)
    const card = useBoardStore.getState().board!.columns![0].cards![0]
    expect(card.title).toBe('Updated')
    expect(card.description).toBe('desc')
  })

  it('moveCard moves card between columns', () => {
    useBoardStore.getState().setBoard(makeBoard())
    const moved: CardResponse = {
      id: 'card-1', columnId: 'col-2', title: 'Card 1', description: null,
      position: 500, startDate: null, assignees: [], dueDate: null, priority: 'NONE', labels: [],
    }
    useBoardStore.getState().moveCard(moved)
    const cols = useBoardStore.getState().board!.columns!
    expect(cols[0].cards).toHaveLength(0)
    expect(cols[1].cards).toHaveLength(1)
    expect(cols[1].cards![0].columnId).toBe('col-2')
  })

  it('deleteCard removes card from its column', () => {
    useBoardStore.getState().setBoard(makeBoard())
    useBoardStore.getState().deleteCard('card-1')
    expect(useBoardStore.getState().board!.columns![0].cards).toHaveLength(0)
  })

  it('deleteColumn removes column from board', () => {
    useBoardStore.getState().setBoard(makeBoard())
    useBoardStore.getState().deleteColumn('col-1')
    expect(useBoardStore.getState().board!.columns).toHaveLength(1)
    expect(useBoardStore.getState().board!.columns![0].id).toBe('col-2')
  })

  // ── applyEvent ───────────────────────────────────────────────────────────

  it('applyEvent CARD_CREATED adds card to column', () => {
    useBoardStore.getState().setBoard(makeBoard())
    const event: BoardEvent = {
      eventType: 'CARD_CREATED', boardId: 'board-1', timestamp: '',
      data: { id: 'card-new', columnId: 'col-2', title: 'WS Card', position: 1000,
              assignees: [], dueDate: null, labels: [] },
    }
    useBoardStore.getState().applyEvent(event)
    expect(useBoardStore.getState().board!.columns![1].cards).toHaveLength(1)
  })

  it('applyEvent CARD_UPDATED updates card fields', () => {
    useBoardStore.getState().setBoard(makeBoard())
    const event: BoardEvent = {
      eventType: 'CARD_UPDATED', boardId: 'board-1', timestamp: '',
      data: { id: 'card-1', columnId: 'col-1', title: 'WS Updated', description: 'new desc',
              assignees: [], dueDate: null, labels: [], updatedAt: '' },
    }
    useBoardStore.getState().applyEvent(event)
    const card = useBoardStore.getState().board!.columns![0].cards![0]
    expect(card.title).toBe('WS Updated')
  })

  it('applyEvent CARD_MOVED moves card across columns', () => {
    useBoardStore.getState().setBoard(makeBoard())
    const event: BoardEvent = {
      eventType: 'CARD_MOVED', boardId: 'board-1', timestamp: '',
      data: { id: 'card-1', fromColumnId: 'col-1', toColumnId: 'col-2',
              newPosition: 1000, updatedAt: '' },
    }
    useBoardStore.getState().applyEvent(event)
    expect(useBoardStore.getState().board!.columns![0].cards).toHaveLength(0)
    expect(useBoardStore.getState().board!.columns![1].cards).toHaveLength(1)
  })

  it('applyEvent CARD_DELETED removes card', () => {
    useBoardStore.getState().setBoard(makeBoard())
    const event: BoardEvent = {
      eventType: 'CARD_DELETED', boardId: 'board-1', timestamp: '',
      data: { id: 'card-1', columnId: 'col-1' },
    }
    useBoardStore.getState().applyEvent(event)
    expect(useBoardStore.getState().board!.columns![0].cards).toHaveLength(0)
  })

  it('applyEvent COLUMN_CREATED adds column (deduplicates)', () => {
    useBoardStore.getState().setBoard(makeBoard())
    const event: BoardEvent = {
      eventType: 'COLUMN_CREATED', boardId: 'board-1', timestamp: '',
      data: { id: 'col-3', name: 'In Review', position: 3000 },
    }
    useBoardStore.getState().applyEvent(event)
    expect(useBoardStore.getState().board!.columns).toHaveLength(3)
    // Applying same event again must not duplicate
    useBoardStore.getState().applyEvent(event)
    expect(useBoardStore.getState().board!.columns).toHaveLength(3)
  })

  it('applyEvent COLUMN_UPDATED renames column', () => {
    useBoardStore.getState().setBoard(makeBoard())
    const event: BoardEvent = {
      eventType: 'COLUMN_UPDATED', boardId: 'board-1', timestamp: '',
      data: { id: 'col-1', name: 'Renamed' },
    }
    useBoardStore.getState().applyEvent(event)
    expect(useBoardStore.getState().board!.columns![0].name).toBe('Renamed')
  })

  it('applyEvent COLUMN_REORDERED updates positions and sorts', () => {
    useBoardStore.getState().setBoard(makeBoard())
    const event: BoardEvent = {
      eventType: 'COLUMN_REORDERED', boardId: 'board-1', timestamp: '',
      data: { columns: [{ id: 'col-2', position: 1000 }, { id: 'col-1', position: 2000 }] },
    }
    useBoardStore.getState().applyEvent(event)
    const cols = useBoardStore.getState().board!.columns!
    expect(cols[0].id).toBe('col-2')
    expect(cols[1].id).toBe('col-1')
  })

  it('applyEvent COLUMN_DELETED removes column', () => {
    useBoardStore.getState().setBoard(makeBoard())
    const event: BoardEvent = {
      eventType: 'COLUMN_DELETED', boardId: 'board-1', timestamp: '',
      data: { id: 'col-1' },
    }
    useBoardStore.getState().applyEvent(event)
    expect(useBoardStore.getState().board!.columns).toHaveLength(1)
  })

  it('applyEvent is a no-op when board is null', () => {
    const event: BoardEvent = {
      eventType: 'CARD_DELETED', boardId: 'board-1', timestamp: '',
      data: { id: 'x', columnId: 'y' },
    }
    // Should not throw
    useBoardStore.getState().applyEvent(event)
    expect(useBoardStore.getState().board).toBeNull()
  })
})
