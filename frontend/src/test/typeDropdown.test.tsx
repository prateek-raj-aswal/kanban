/**
 * test_plan:
 *   story_id: US-1615, US-1616
 *   framework: vitest + @testing-library/react
 *   tests:
 *     - id: TC-1615-1
 *       maps_to_ac: "Card create form has Story/Feature/Bug dropdown defaulting Story"
 *     - id: TC-1615-2
 *       maps_to_ac: "Selecting Bug in card create sends type=BUG in POST"
 *     - id: TC-1616-1
 *       maps_to_ac: "Issue create form has Story/Feature/Bug dropdown defaulting Bug"
 *     - id: TC-1616-2
 *       maps_to_ac: "Selecting Story in issue create sends type=STORY in POST"
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { CardResponse, IssueResponse, ColumnResponse } from '@/types/api'

// ── dnd-kit mocks ─────────────────────────────────────────────────────────────
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PointerSensor: class {},
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  closestCorners: vi.fn(),
  useDroppable: vi.fn(() => ({ setNodeRef: vi.fn(), isOver: false })),
}))

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

// ── api/theme/icon/store mocks ─────────────────────────────────────────────────
const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPatch = vi.fn()

vi.mock('@/lib/api', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: vi.fn().mockResolvedValue({}),
  },
  ApiError: class ApiError extends Error {
    constructor(public status: number, public code: string, message: string) {
      super(message)
    }
  },
}))

vi.mock('@/lib/theme', () => ({
  T: new Proxy({}, { get: (_t, prop) => String(prop) }),
  darkenHex: (hex: string) => hex,
}))

vi.mock('@/components/ui/Icon', () => ({
  default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}))

vi.mock('@/store/configStore', () => ({
  useConfigStore: () => ({ colorTokens: [], colorHexMap: {} }),
}))

vi.mock('@/store/boardStore', () => ({
  useBoardStore: () => ({
    moveCard: vi.fn(),
    addCard: vi.fn(),
    updateColumnName: vi.fn(),
    deleteColumn: vi.fn(),
  }),
}))

// ── Component imports (after mocks) ──────────────────────────────────────────
import Column from '@/components/board/Column'
import IssuesPanel from '@/components/board/IssuesPanel'

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeColumn(overrides: Partial<ColumnResponse> = {}): ColumnResponse {
  return {
    id: 'col-1',
    boardId: 'board-1',
    name: 'Backlog',
    position: 1000,
    cards: [],
    ...overrides,
  }
}

function makeIssue(overrides: Partial<IssueResponse> = {}): IssueResponse {
  return {
    id: 'issue-1',
    title: 'Test Issue',
    description: null,
    status: 'OPEN',
    parentCardId: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

const newCard: CardResponse = {
  id: 'card-new',
  columnId: 'col-1',
  title: 'New Card',
  description: null,
  position: 2000,
  startDate: null,
  dueDate: null,
  priority: 'NONE',
  labels: [],
  assignees: [],
  type: 'BUG',
  readableId: 'BUG-001',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGet.mockResolvedValue([])
  mockPost.mockResolvedValue(newCard)
  mockPatch.mockResolvedValue(makeIssue())
})

// ── TC-1615: Card type dropdown ───────────────────────────────────────────────
describe('TC-1615: Card create type dropdown', () => {
  it('shows type selector with Story default when add card form is open', async () => {
    render(
      <Column
        column={makeColumn()}
        onDeleteColumn={vi.fn()}
        onSelectCard={vi.fn()}
        onAddCard={vi.fn()}
      />
    )

    // Open the add card form
    fireEvent.click(screen.getByText(/add card/i))

    // Type selector should be visible with default 'STORY'
    await waitFor(() => {
      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
      expect((select as HTMLSelectElement).value).toBe('STORY')
    })

    // All three options should be present
    expect(screen.getByRole('option', { name: /story/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /feature/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /bug/i })).toBeInTheDocument()
  })

  it('includes selected type in POST when form is submitted', async () => {
    const onAddCard = vi.fn()
    render(
      <Column
        column={makeColumn()}
        onDeleteColumn={vi.fn()}
        onSelectCard={vi.fn()}
        onAddCard={onAddCard}
      />
    )

    fireEvent.click(screen.getByText(/add card/i))

    // Fill in title
    const textarea = screen.getByPlaceholderText(/card title/i)
    fireEvent.change(textarea, { target: { value: 'New Card' } })

    // Select Bug type
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'BUG' } })

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /add card/i }))

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        '/api/v1/columns/col-1/cards',
        expect.objectContaining({ title: 'New Card', type: 'BUG' })
      )
    })
  })
})

// ── TC-1616: Issue type dropdown ─────────────────────────────────────────────
describe('TC-1616: Issue create type dropdown', () => {
  it('shows type selector with Bug default in issue create form', async () => {
    render(<IssuesPanel />)

    // Type selector should be present with Bug as default
    await waitFor(() => {
      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
      expect((select as HTMLSelectElement).value).toBe('BUG')
    })

    expect(screen.getByRole('option', { name: /story/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /feature/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /bug/i })).toBeInTheDocument()
  })

  it('includes selected type in POST when issue is created', async () => {
    render(<IssuesPanel />)

    const input = screen.getByPlaceholderText(/new issue title/i)
    fireEvent.change(input, { target: { value: 'My Story' } })

    // Select Story type
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'STORY' } })

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        '/api/v1/issues',
        expect.objectContaining({ title: 'My Story', type: 'STORY' })
      )
    })
  })
})
