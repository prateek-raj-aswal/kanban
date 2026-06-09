/**
 * test_plan:
 *   story_id: US-1612, US-1613, US-1614
 *   framework: vitest + @testing-library/react
 *   tests:
 *     - id: TC-1612-1
 *       maps_to_ac: "CardItem shows readableId badge when present"
 *     - id: TC-1612-2
 *       maps_to_ac: "CardItem falls back to UUID stub when readableId absent"
 *     - id: TC-1613-1
 *       maps_to_ac: "CardModal header shows readableId when present"
 *     - id: TC-1613-2
 *       maps_to_ac: "CardModal header falls back to UUID stub when readableId absent"
 *     - id: TC-1614-1
 *       maps_to_ac: "IssuesPanel rows show readableId badge before title"
 *     - id: TC-1614-2
 *       maps_to_ac: "IssuesPanel rows show no crash when readableId absent"
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import type { CardResponse, IssueResponse } from '@/types/api'

// ── dnd-kit mocks ─────────────────────────────────────────────────────────────
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
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

// ── api/theme/icon mocks ──────────────────────────────────────────────────────
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

vi.mock('@/lib/useIsMobile', () => ({
  useIsMobile: () => false,
}))

// ── Component imports (after mocks) ──────────────────────────────────────────
import CardItem from '@/components/board/CardItem'
import CardModal from '@/components/board/CardModal'
import IssuesPanel from '@/components/board/IssuesPanel'

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeCard(overrides: Partial<CardResponse> = {}): CardResponse {
  return {
    id: 'aaaaaaaa-0000-0000-0000-000000000000',
    columnId: 'col-1',
    title: 'Test Card',
    description: null,
    position: 1000,
    startDate: null,
    dueDate: null,
    priority: 'NONE',
    labels: [],
    assignees: [],
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

beforeEach(() => {
  vi.clearAllMocks()
  mockGet.mockResolvedValue([])
  mockPost.mockResolvedValue(makeIssue())
  mockPatch.mockResolvedValue(makeIssue())
})

// ── TC-1612: CardItem readableId chip ─────────────────────────────────────────
describe('TC-1612: CardItem readableId chip', () => {
  it('shows readableId when present', () => {
    render(<CardItem card={makeCard({ readableId: 'US-003' })} />)
    expect(screen.getByText('US-003')).toBeInTheDocument()
  })

  it('falls back to UUID stub when readableId absent', () => {
    render(<CardItem card={makeCard({ readableId: undefined })} />)
    // UUID stub: first 8 chars uppercased
    expect(screen.getByText('AAAAAAAA')).toBeInTheDocument()
  })
})

// ── TC-1613: CardModal header readableId ─────────────────────────────────────
describe('TC-1613: CardModal header readableId', () => {
  it('shows readableId in header when present', async () => {
    const card = makeCard({ readableId: 'FEAT-007' })
    render(
      <CardModal
        card={card}
        columnName="Backlog"
        boardId="board-1"
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    await waitFor(() => {
      expect(screen.getByText('FEAT-007')).toBeInTheDocument()
    })
  })

  it('falls back to UUID stub when readableId absent', async () => {
    const card = makeCard({ readableId: undefined })
    render(
      <CardModal
        card={card}
        columnName="Backlog"
        boardId="board-1"
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    await waitFor(() => {
      // shortId = first 8 chars of UUID uppercased
      expect(screen.getByText('AAAAAAAA')).toBeInTheDocument()
    })
  })
})

// ── TC-1614: IssuesPanel readableId badge ─────────────────────────────────────
describe('TC-1614: IssuesPanel readableId badge', () => {
  it('shows readableId badge before issue title', async () => {
    mockGet.mockResolvedValue([makeIssue({ readableId: 'BUG-002' })])
    render(<IssuesPanel />)
    await waitFor(() => {
      expect(screen.getByText('BUG-002')).toBeInTheDocument()
    })
  })

  it('does not crash when readableId is absent', async () => {
    mockGet.mockResolvedValue([makeIssue({ readableId: undefined })])
    render(<IssuesPanel />)
    await waitFor(() => {
      expect(screen.getByText('Test Issue')).toBeInTheDocument()
    })
  })
})
