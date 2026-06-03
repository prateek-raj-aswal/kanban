/**
 * test_plan:
 *   story_id: US-1305
 *   framework: vitest + @testing-library/react
 *   tests:
 *     - id: TC-1
 *       file: "src/test/columnColor.test.tsx"
 *       maps_to_ac: "AC-1: When a column already has a headerColor, the swatch button is present and can reopen the palette"
 *       type: acceptance
 *     - id: TC-2
 *       file: "src/test/columnColor.test.tsx"
 *       maps_to_ac: "AC-1: Clicking the swatch button opens the palette (paletteOpen → true)"
 *       type: acceptance
 *     - id: TC-3
 *       file: "src/test/columnColor.test.tsx"
 *       maps_to_ac: "AC-2: Selecting a new color calls api.patch with the new headerColor"
 *       type: acceptance
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useConfigStore } from '@/store/configStore'
import { useBoardStore } from '@/store/boardStore'

// ---------------------------------------------------------------------------
// Mock @dnd-kit — Column uses useSortable internally; we stub the whole kit
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
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue([]),
    post: vi.fn().mockResolvedValue({}),
    patch: (...args: unknown[]) => mockPatch(...args),
  },
  ApiError: class ApiError extends Error {
    constructor(public status: number, public code: string, message: string) {
      super(message)
    }
  },
}))

// ---------------------------------------------------------------------------
// Mock @/lib/theme — return plain string tokens to avoid CSS-in-JS issues
// ---------------------------------------------------------------------------
vi.mock('@/lib/theme', () => ({
  T: new Proxy({}, { get: (_t, prop) => String(prop) }),
}))

// ---------------------------------------------------------------------------
// Stub Icon — not relevant to this story
// ---------------------------------------------------------------------------
vi.mock('@/components/ui/Icon', () => ({
  default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}))

// ---------------------------------------------------------------------------
// Stub CardItem — not relevant to this story
// ---------------------------------------------------------------------------
vi.mock('@/components/board/CardItem', () => ({
  default: () => null,
}))

// ---------------------------------------------------------------------------
// Component import (after mocks)
// ---------------------------------------------------------------------------
import Column from '@/components/board/Column'
import type { ColumnResponse } from '@/types/api'

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

// ---------------------------------------------------------------------------
// Shared setup / teardown
// ---------------------------------------------------------------------------
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
// TC-1: When a column already has a headerColor, the swatch button is visible
//       so the user can re-open the picker to change it.
// ---------------------------------------------------------------------------
describe('TC-1: column with existing headerColor still shows color swatch button', () => {
  it('renders the swatch button when headerColor is already set', () => {
    const col = makeColumn('red')
    useBoardStore.setState({ board: makeBoard(col) })

    render(
      <Column
        column={col}
        onDeleteColumn={vi.fn()}
        onRenameColumn={vi.fn()}
      />
    )

    // The swatch button has title="Set header color"
    const swatch = screen.getByTitle('Set header color')
    expect(swatch).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TC-2: Clicking the swatch button opens the color palette (paletteOpen = true)
// ---------------------------------------------------------------------------
describe('TC-2: clicking the swatch button opens the palette', () => {
  it('shows the color palette when swatch button is clicked', () => {
    const col = makeColumn('red')
    useBoardStore.setState({ board: makeBoard(col) })

    render(
      <Column
        column={col}
        onDeleteColumn={vi.fn()}
        onRenameColumn={vi.fn()}
      />
    )

    const swatch = screen.getByTitle('Set header color')
    fireEvent.click(swatch)

    // The palette renders a "Header color" heading and color swatches
    expect(screen.getByText(/header color/i)).toBeInTheDocument()
    // Each color token is a button titled by its token name
    expect(screen.getByTitle('red')).toBeInTheDocument()
    expect(screen.getByTitle('blue')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TC-3: Selecting a new color calls api.patch with the new headerColor
// ---------------------------------------------------------------------------
describe('TC-3: selecting a new color from the palette calls api.patch', () => {
  it('calls api.patch /api/v1/columns/{id} with the new headerColor', async () => {
    const col = makeColumn('red')
    useBoardStore.setState({ board: makeBoard(col) })

    render(
      <Column
        column={col}
        onDeleteColumn={vi.fn()}
        onRenameColumn={vi.fn()}
      />
    )

    // Open palette
    fireEvent.click(screen.getByTitle('Set header color'))

    // Click the 'blue' color swatch
    fireEvent.click(screen.getByTitle('blue'))

    // api.patch should be called with the column path and new color
    expect(mockPatch).toHaveBeenCalledWith(
      '/api/v1/columns/col-1',
      { headerColor: 'blue' }
    )
  })
})
