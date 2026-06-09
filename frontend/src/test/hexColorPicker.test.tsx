/**
 * test_plan:
 *   story_id: US-1313
 *   framework: vitest + @testing-library/react
 *   tests:
 *     - id: TC-1
 *       maps_to_ac: "AC-1: Column picker renders a hex text input"
 *     - id: TC-2
 *       maps_to_ac: "AC-1: Typing valid hex in column picker and pressing Enter calls api.patch for headerColor"
 *     - id: TC-3
 *       maps_to_ac: "AC-1: Typing invalid hex does NOT call api.patch"
 *     - id: TC-4
 *       maps_to_ac: "AC-2: Card color picker renders in CardModal with hex input"
 *     - id: TC-5
 *       maps_to_ac: "AC-2: Setting card color calls api.patch for card color"
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useConfigStore } from '@/store/configStore'
import { useBoardStore } from '@/store/boardStore'

// ---------------------------------------------------------------------------
// Mock @dnd-kit — Column uses useSortable internally
// ---------------------------------------------------------------------------
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    setActivatorNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}))

// ---------------------------------------------------------------------------
// Mock @/lib/api
// ---------------------------------------------------------------------------
const mockPatch = vi.fn().mockResolvedValue({})
const mockGet = vi.fn().mockResolvedValue([])
vi.mock('@/lib/api', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: vi.fn().mockResolvedValue({}),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: vi.fn().mockResolvedValue({}),
  },
  ApiError: class ApiError extends Error {
    constructor(public status: number, public code: string, message: string) {
      super(message)
    }
  },
}))

// ---------------------------------------------------------------------------
// Mock @/lib/theme
// ---------------------------------------------------------------------------
vi.mock('@/lib/theme', () => ({
  T: new Proxy({}, { get: (_t, prop) => String(prop) }),
  darkenHex: (hex: string) => hex,
}))

// ---------------------------------------------------------------------------
// Stub Icon
// ---------------------------------------------------------------------------
vi.mock('@/components/ui/Icon', () => ({
  default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}))

// ---------------------------------------------------------------------------
// Stub CardItem
// ---------------------------------------------------------------------------
vi.mock('@/components/board/CardItem', () => ({
  default: () => null,
}))

// ---------------------------------------------------------------------------
// Mock useIsMobile (CardModal uses it)
// ---------------------------------------------------------------------------
vi.mock('@/lib/useIsMobile', () => ({
  useIsMobile: () => false,
}))

// ---------------------------------------------------------------------------
// Component imports (after mocks)
// ---------------------------------------------------------------------------
import Column from '@/components/board/Column'
import CardModal from '@/components/board/CardModal'
import type { ColumnResponse, CardResponse } from '@/types/api'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const COLOR_MAP: Record<string, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
}
const COLOR_TOKENS = Object.keys(COLOR_MAP)

function makeColumn(headerColor?: string): ColumnResponse {
  return {
    id: 'col-1',
    boardId: 'board-1',
    name: 'To Do',
    position: 1000,
    headerColor: headerColor ?? null,
    cards: [],
  }
}

function makeBoard(col: ColumnResponse) {
  return {
    id: 'board-1',
    name: 'Test Board',
    ownerId: 'user-1',
    createdAt: '',
    role: 'MEMBER',
    columns: [col],
  }
}

function makeCard(color?: string | null): CardResponse {
  return {
    id: 'card-1',
    columnId: 'col-1',
    title: 'Test Card',
    description: null,
    position: 1000,
    startDate: null,
    dueDate: null,
    priority: 'NONE',
    labels: [],
    assignees: [],
    color: color ?? null,
  }
}

beforeEach(() => {
  useConfigStore.setState({
    columnColors: COLOR_TOKENS,
    columnColorMap: COLOR_MAP,
  })
})

afterEach(() => {
  vi.clearAllMocks()
  useBoardStore.setState({ board: null })
})

// ---------------------------------------------------------------------------
// TC-1: Column picker renders a hex text input
// ---------------------------------------------------------------------------
describe('TC-1: Column picker has a hex text input', () => {
  it('shows a hex input when the color palette is opened', () => {
    const col = makeColumn()
    useBoardStore.setState({ board: makeBoard(col) })

    render(
      <Column
        column={col}
        onDeleteColumn={vi.fn()}
        onRenameColumn={vi.fn()}
      />
    )

    // Open the picker
    fireEvent.click(screen.getByTitle('Set header color'))

    // Should have a hex text input (placeholder or label containing '#' or 'hex')
    const hexInput = screen.getByPlaceholderText(/^#[0-9a-fA-F]{0,6}$|hex/i)
    expect(hexInput).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TC-2: Typing valid hex and pressing Enter calls api.patch for headerColor
// ---------------------------------------------------------------------------
describe('TC-2: Valid hex in column picker calls api.patch', () => {
  it('calls api.patch with the typed hex when Enter is pressed', async () => {
    const col = makeColumn()
    useBoardStore.setState({ board: makeBoard(col) })

    render(
      <Column
        column={col}
        onDeleteColumn={vi.fn()}
        onRenameColumn={vi.fn()}
      />
    )

    // Open the picker
    fireEvent.click(screen.getByTitle('Set header color'))

    // Type a valid hex
    const hexInput = screen.getByPlaceholderText(/^#[0-9a-fA-F]{0,6}$|hex/i)
    fireEvent.change(hexInput, { target: { value: '#ff0000' } })
    fireEvent.keyDown(hexInput, { key: 'Enter' })

    expect(mockPatch).toHaveBeenCalledWith(
      '/api/v1/columns/col-1',
      { headerColor: '#ff0000' }
    )
  })
})

// ---------------------------------------------------------------------------
// TC-3: Typing invalid hex does NOT call api.patch
// ---------------------------------------------------------------------------
describe('TC-3: Invalid hex in column picker does not call api.patch', () => {
  it('does not call api.patch when hex is invalid', () => {
    const col = makeColumn()
    useBoardStore.setState({ board: makeBoard(col) })

    render(
      <Column
        column={col}
        onDeleteColumn={vi.fn()}
        onRenameColumn={vi.fn()}
      />
    )

    // Open the picker
    fireEvent.click(screen.getByTitle('Set header color'))

    // Type an invalid hex
    const hexInput = screen.getByPlaceholderText(/^#[0-9a-fA-F]{0,6}$|hex/i)
    fireEvent.change(hexInput, { target: { value: 'notacolor' } })
    fireEvent.keyDown(hexInput, { key: 'Enter' })

    expect(mockPatch).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// TC-4: CardModal renders color trigger button for card color
// ---------------------------------------------------------------------------
describe('TC-4: Card color picker renders in CardModal', () => {
  it('shows a Card color section and a trigger button to open the picker', () => {
    const card = makeCard()

    render(
      <CardModal
        card={card}
        columnName="To Do"
        boardId="board-1"
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    // Should render a "Card color" section label
    expect(screen.getByText(/card color/i)).toBeInTheDocument()

    // Should have a trigger button to open the color palette
    expect(screen.getByTitle(/set card color/i)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TC-5: Setting card color via popup hex input calls api.patch
// ---------------------------------------------------------------------------
describe('TC-5: Card color picker calls api.patch', () => {
  it('calls api.patch with the typed hex when palette is open and Enter pressed', async () => {
    const card = makeCard()

    render(
      <CardModal
        card={card}
        columnName="To Do"
        boardId="board-1"
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    // Open the color palette popup
    fireEvent.click(screen.getByTitle(/set card color/i))

    const hexInput = screen.getByPlaceholderText('#ff0000')
    fireEvent.change(hexInput, { target: { value: '#3b82f6' } })
    fireEvent.keyDown(hexInput, { key: 'Enter' })

    expect(mockPatch).toHaveBeenCalledWith(
      '/api/v1/cards/card-1',
      { color: '#3b82f6' }
    )
  })
})
