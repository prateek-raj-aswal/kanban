/**
 * test_plan:
 *   story_id: US-1407
 *   framework: vitest + @testing-library/react
 *   tests:
 *     - id: TC-1
 *       maps_to_ac: "AC-1: Issues list view renders and loads issues via GET /api/v1/issues"
 *     - id: TC-2
 *       maps_to_ac: "AC-1: Create issue form: submit -> api.post called -> issue appears in list"
 *     - id: TC-3
 *       maps_to_ac: "AC-2: CardModal shows attached issues for a card (loads GET /api/v1/issues?parentCardId=...)"
 *     - id: TC-4
 *       maps_to_ac: "AC-2: Attach issue: click attach -> api.patch called with parentCardId"
 *     - id: TC-5
 *       maps_to_ac: "AC-3: Close issue manually -> api.patch called with status=CLOSED -> status updates"
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { IssueResponse, CardResponse } from '@/types/api'

// ---------------------------------------------------------------------------
// Shared mock data
// ---------------------------------------------------------------------------
const MOCK_ISSUES: IssueResponse[] = [
  {
    id: 'issue-1',
    title: 'Fix login bug',
    description: null,
    status: 'OPEN',
    parentCardId: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'issue-2',
    title: 'Add dark mode',
    description: 'Implement dark theme',
    status: 'IN_PROGRESS',
    parentCardId: 'card-1',
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
]

const MOCK_CARD: CardResponse = {
  id: 'card-1',
  columnId: 'col-1',
  title: 'My Story Card',
  description: null,
  position: 1000,
  startDate: null,
  dueDate: null,
  priority: 'NONE',
  labels: [],
  assignees: [],
}

// ---------------------------------------------------------------------------
// Mock @/lib/api
// ---------------------------------------------------------------------------
const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPatch = vi.fn()
const mockDelete = vi.fn()

vi.mock('@/lib/api', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
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
// Mock @/components/ui/Icon
// ---------------------------------------------------------------------------
vi.mock('@/components/ui/Icon', () => ({
  default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}))

// ---------------------------------------------------------------------------
// Mock useIsMobile
// ---------------------------------------------------------------------------
vi.mock('@/lib/useIsMobile', () => ({
  useIsMobile: () => false,
}))

// ---------------------------------------------------------------------------
// Component imports (after mocks)
// ---------------------------------------------------------------------------
import IssuesPanel from '@/components/board/IssuesPanel'
import CardModal from '@/components/board/CardModal'

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------
beforeEach(() => {
  vi.clearAllMocks()
  // Default: GET /api/v1/issues returns all issues; per-card returns card-1 issues
  mockGet.mockImplementation((path: string) => {
    if (path === '/api/v1/issues') return Promise.resolve(MOCK_ISSUES)
    if (path === '/api/v1/issues?parentCardId=card-1') return Promise.resolve([MOCK_ISSUES[1]])
    return Promise.resolve([])
  })
  mockPost.mockResolvedValue({
    id: 'issue-new',
    title: 'New issue',
    description: null,
    status: 'OPEN',
    parentCardId: null,
    createdAt: '2026-01-03T00:00:00Z',
    updatedAt: '2026-01-03T00:00:00Z',
  })
  mockPatch.mockResolvedValue({ ...MOCK_ISSUES[0], status: 'CLOSED' })
  mockDelete.mockResolvedValue(undefined)
})

afterEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// TC-1: Issues list view renders and loads issues via GET /api/v1/issues
// ---------------------------------------------------------------------------
describe('TC-1: Issues list view loads and renders issues', () => {
  it('calls GET /api/v1/issues on mount and renders issue titles', async () => {
    render(<IssuesPanel />)

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/api/v1/issues')
    })

    // Both issue titles should appear
    expect(await screen.findByText('Fix login bug')).toBeInTheDocument()
    expect(await screen.findByText('Add dark mode')).toBeInTheDocument()
  })

  it('renders OPEN and IN_PROGRESS status badges', async () => {
    render(<IssuesPanel />)

    await waitFor(() => {
      expect(screen.getByText('OPEN')).toBeInTheDocument()
      expect(screen.getByText('IN_PROGRESS')).toBeInTheDocument()
    })
  })
})

// ---------------------------------------------------------------------------
// TC-2: Create issue form: submit -> api.post called -> issue appears in list
// ---------------------------------------------------------------------------
describe('TC-2: Create issue form submits and adds to list', () => {
  it('calls api.post with the new title and shows the new issue', async () => {
    render(<IssuesPanel />)

    // Wait for initial load
    await waitFor(() => expect(mockGet).toHaveBeenCalled())

    // Find and fill the create form
    const input = screen.getByPlaceholderText(/new issue title/i)
    fireEvent.change(input, { target: { value: 'New issue' } })

    // Submit
    const submitBtn = screen.getByRole('button', { name: /create/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/v1/issues', expect.objectContaining({ title: 'New issue' }))
    })

    // New issue should appear in the list
    expect(await screen.findByText('New issue')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TC-3: CardModal shows attached issues for a card
// ---------------------------------------------------------------------------
describe('TC-3: CardModal loads and shows attached issues', () => {
  it('calls GET /api/v1/issues?parentCardId=card-1 and shows attached issues', async () => {
    render(
      <CardModal
        card={MOCK_CARD}
        columnName="To Do"
        boardId="board-1"
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/api/v1/issues?parentCardId=card-1')
    })

    // The attached issue title should appear
    expect(await screen.findByText('Add dark mode')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TC-4: Attach issue: click attach -> api.patch called with parentCardId
// ---------------------------------------------------------------------------
describe('TC-4: Attach issue button calls api.patch with parentCardId', () => {
  it('calls api.patch with parentCardId when attach is clicked on a standalone issue', async () => {
    // Render IssuesPanel with card context for attachment
    render(<IssuesPanel attachToCardId="card-1" />)

    await waitFor(() => expect(mockGet).toHaveBeenCalled())

    // Find first issue (issue-1 is standalone, OPEN)
    const attachBtn = await screen.findByRole('button', { name: /attach/i })
    fireEvent.click(attachBtn)

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith(
        '/api/v1/issues/issue-1',
        expect.objectContaining({ parentCardId: 'card-1' })
      )
    })
  })
})

// ---------------------------------------------------------------------------
// TC-5: Close issue manually -> api.patch called with status=CLOSED -> status updates
// ---------------------------------------------------------------------------
describe('TC-5: Close issue manually updates status', () => {
  it('calls api.patch with status CLOSED and updates the displayed status', async () => {
    mockPatch.mockResolvedValueOnce({ ...MOCK_ISSUES[0], status: 'CLOSED' })

    render(<IssuesPanel />)

    await waitFor(() => expect(mockGet).toHaveBeenCalled())

    // Find the close button for the first OPEN issue (issue-1 is OPEN, issue-2 is IN_PROGRESS)
    const closeBtns = await screen.findAllByRole('button', { name: /close/i })
    fireEvent.click(closeBtns[0])

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith(
        '/api/v1/issues/issue-1',
        expect.objectContaining({ status: 'CLOSED' })
      )
    })

    // Status should update to CLOSED
    expect(await screen.findByText('CLOSED')).toBeInTheDocument()
  })
})
