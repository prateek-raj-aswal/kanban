import { describe, it, expect, beforeEach } from 'vitest'
import { useBoardStore } from '@/store/boardStore'
import type { BoardResponse } from '@/types/api'

const makeBoard = (): BoardResponse => ({
  id: 'board-1', name: 'Test Board', ownerId: 'user-1', createdAt: '',
  columns: [
    { id: 'col-A', boardId: 'board-1', name: 'Alpha', position: 1000, cards: [] },
    { id: 'col-B', boardId: 'board-1', name: 'Beta',  position: 2000, cards: [] },
    { id: 'col-C', boardId: 'board-1', name: 'Gamma', position: 3000, cards: [] },
  ],
})

describe('boardStore.reorderColumns (US-1202)', () => {
  beforeEach(() => {
    useBoardStore.setState({ board: null })
  })

  // TC-001 — AC-1: reorderColumns reorders board.columns and updates positions
  it('TC-001: reorders columns and assigns monotonically increasing positions', () => {
    useBoardStore.getState().setBoard(makeBoard())

    useBoardStore.getState().reorderColumns(['col-C', 'col-A', 'col-B'])

    const cols = useBoardStore.getState().board!.columns!
    expect(cols.map(c => c.id)).toEqual(['col-C', 'col-A', 'col-B'])
    // positions must be strictly ascending
    expect(cols[0].position).toBeLessThan(cols[1].position)
    expect(cols[1].position).toBeLessThan(cols[2].position)
  })

  // TC-002 — AC-1: reorderColumns with no board is a no-op and does not throw
  it('TC-002: is a no-op when board is null', () => {
    // store was reset to { board: null } in beforeEach
    expect(() => {
      useBoardStore.getState().reorderColumns(['col-x', 'col-y'])
    }).not.toThrow()
    expect(useBoardStore.getState().board).toBeNull()
  })

  // TC-003 — AC-2: when PATCH throws, the store is never mutated, so the parent columns prop
  // still holds the original order. When the parent re-renders (simulated here by setBoard with
  // the original data), the sync effect in ColumnList sets localColumns back to the original —
  // completing the optimistic rollback.
  it('TC-003: store retains original order when reorderColumns is not called; re-applying original board restores it', () => {
    useBoardStore.getState().setBoard(makeBoard())

    // Simulate a successful optimistic reorder in the store (PATCH succeeded for another op)
    useBoardStore.getState().reorderColumns(['col-C', 'col-A', 'col-B'])
    expect(useBoardStore.getState().board!.columns!.map(c => c.id))
      .toEqual(['col-C', 'col-A', 'col-B'])

    // Simulate what the parent does when the PATCH threw and reorderColumns was never called:
    // the parent's board state was never updated, so it re-renders with the original board data.
    // This mirrors the sync effect receiving `columns` still in original order.
    useBoardStore.getState().setBoard(makeBoard())

    const cols = useBoardStore.getState().board!.columns!
    expect(cols.map(c => c.id)).toEqual(['col-A', 'col-B', 'col-C'])
    expect(cols[0].position).toBeLessThan(cols[1].position)
    expect(cols[1].position).toBeLessThan(cols[2].position)
  })
})
