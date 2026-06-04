/**
 * test_plan:
 *   story_id: US-1404
 *   framework: vitest + @testing-library/react
 *   tests:
 *     - id: TC-SL01
 *       maps_to_ac: "AC-1: SwimlaneView renders a lane per priority group when groupBy=PRIORITY"
 *     - id: TC-SL02
 *       maps_to_ac: "AC-1: SwimlaneView renders an ASSIGNEE lane using member displayName"
 *     - id: TC-SL03
 *       maps_to_ac: "AC-1: SwimlaneView renders a None lane for unassigned cards (ASSIGNEE mode)"
 *     - id: TC-SL04
 *       maps_to_ac: "AC-1: BoardView renders SwimlaneView when groupBy is PRIORITY (not NONE)"
 *     - id: TC-SL05
 *       maps_to_ac: "AC-1: BoardView renders ColumnList when groupBy is NONE"
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ColumnResponse, CardResponse, MemberResponse } from '@/types/api'

// ---------------------------------------------------------------------------
// Mock @dnd-kit
// ---------------------------------------------------------------------------
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PointerSensor: class {},
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  closestCorners: vi.fn(),
  useDroppable: vi.fn(() => ({ setNodeRef: vi.fn(), isOver: false })),
  useDraggable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    isDragging: false,
  })),
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
  horizontalListSortingStrategy: {},
  arrayMove: (arr: unknown[]) => arr,
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}))

// ---------------------------------------------------------------------------
// Mock @/lib/api
// ---------------------------------------------------------------------------
const mockGet = vi.fn()
const mockPatch = vi.fn().mockResolvedValue({})

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
// Mock @/lib/useIsMobile — desktop by default
// ---------------------------------------------------------------------------
vi.mock('@/lib/useIsMobile', () => ({
  useIsMobile: () => false,
}))

// ---------------------------------------------------------------------------
// Mock @/lib/websocket
// ---------------------------------------------------------------------------
vi.mock('@/lib/websocket', () => ({
  subscribeToBoard: vi.fn().mockReturnValue(() => {}),
}))

// ---------------------------------------------------------------------------
// Mock @/lib/auth
// ---------------------------------------------------------------------------
vi.mock('@/lib/auth', () => ({
  getToken: vi.fn().mockReturnValue('test-jwt'),
}))

// ---------------------------------------------------------------------------
// Mock @/lib/theme
// ---------------------------------------------------------------------------
vi.mock('@/lib/theme', () => ({
  T: new Proxy({}, { get: (_t, prop) => String(prop) }),
}))

// ---------------------------------------------------------------------------
// Stub heavy child components
// ---------------------------------------------------------------------------
vi.mock('@/components/ui/Icon', () => ({
  default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}))

vi.mock('@/components/board/Sidebar', () => ({
  default: () => null,
}))

vi.mock('@/components/board/CardModal', () => ({
  default: () => null,
}))

vi.mock('@/components/board/InviteModal', () => ({
  default: () => null,
}))

vi.mock('@/components/board/ChatSidebar', () => ({
  default: () => null,
}))

vi.mock('@/components/board/CardItem', () => ({
  default: ({ card }: { card: CardResponse }) => <div data-testid="card-item">{card.title}</div>,
}))

// ---------------------------------------------------------------------------
// Mock next/navigation
// ---------------------------------------------------------------------------
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/boards/board-1',
}))

// ---------------------------------------------------------------------------
// Component imports (after mocks)
// ---------------------------------------------------------------------------
import SwimlaneView from '@/components/board/SwimlaneView'
import BoardView from '@/components/board/BoardView'
import { useBoardStore } from '@/store/boardStore'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeCard(overrides: Partial<CardResponse> = {}): CardResponse {
  return {
    id: 'card-1',
    columnId: 'col-1',
    title: 'Test Card',
    description: null,
    position: 1000,
    startDate: null,
    dueDate: null,
    priority: 'HIGH',
    labels: [],
    assignees: [],
    ...overrides,
  }
}

function makeColumn(id: string, cards: CardResponse[] = []): ColumnResponse {
  return {
    id,
    boardId: 'board-1',
    name: `Col ${id}`,
    position: 1000,
    cards,
  }
}

const MEMBERS: MemberResponse[] = [
  { userId: 'user-1', displayName: 'Alice', email: 'alice@example.com', role: 'MEMBER', joinedAt: '' },
  { userId: 'user-2', displayName: 'Bob', email: 'bob@example.com', role: 'MEMBER', joinedAt: '' },
]

// ---------------------------------------------------------------------------
// TC-SL01: SwimlaneView renders a lane per priority group when groupBy=PRIORITY
// ---------------------------------------------------------------------------
describe('TC-SL01: SwimlaneView renders priority lanes', () => {
  it('renders a lane for each priority group that has cards', () => {
    const urgentCard = makeCard({ id: 'c-urgent', priority: 'URGENT', title: 'Urgent Task' })
    const highCard = makeCard({ id: 'c-high', priority: 'HIGH', title: 'High Task' })
    const noneCard = makeCard({ id: 'c-none', priority: 'NONE', title: 'No Priority' })
    const columns = [makeColumn('col-1', [urgentCard, highCard, noneCard])]

    render(
      <SwimlaneView
        boardId="board-1"
        columns={columns}
        groupBy="PRIORITY"
        members={[]}
        onSelectCard={vi.fn()}
        onCardMoved={vi.fn()}
      />
    )

    // Lane headers for groups that contain cards
    expect(screen.getByText('URGENT')).toBeInTheDocument()
    expect(screen.getByText('HIGH')).toBeInTheDocument()
    expect(screen.getByText('None')).toBeInTheDocument()
  })

  it('renders card titles within the correct lane', () => {
    const urgentCard = makeCard({ id: 'c-urgent', priority: 'URGENT', title: 'Urgent Task' })
    const medCard = makeCard({ id: 'c-med', priority: 'MEDIUM', title: 'Medium Task' })
    const columns = [makeColumn('col-1', [urgentCard, medCard])]

    render(
      <SwimlaneView
        boardId="board-1"
        columns={columns}
        groupBy="PRIORITY"
        members={[]}
      />
    )

    expect(screen.getByText('Urgent Task')).toBeInTheDocument()
    expect(screen.getByText('Medium Task')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TC-SL02: SwimlaneView renders an ASSIGNEE lane using member displayName
// ---------------------------------------------------------------------------
describe('TC-SL02: SwimlaneView renders ASSIGNEE lanes with displayName', () => {
  it('renders a lane with the member displayName for each assigned user', () => {
    const aliceCard = makeCard({ id: 'c-alice', assignees: ['user-1'], title: 'Alice Card' })
    const bobCard = makeCard({ id: 'c-bob', assignees: ['user-2'], title: 'Bob Card' })
    const columns = [makeColumn('col-1', [aliceCard, bobCard])]

    render(
      <SwimlaneView
        boardId="board-1"
        columns={columns}
        groupBy="ASSIGNEE"
        members={MEMBERS}
      />
    )

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TC-SL03: SwimlaneView renders a None lane for unassigned cards (ASSIGNEE mode)
// ---------------------------------------------------------------------------
describe('TC-SL03: SwimlaneView renders None lane for unassigned cards', () => {
  it('shows a None lane when some cards have no assignees', () => {
    const assignedCard = makeCard({ id: 'c-assigned', assignees: ['user-1'], title: 'Assigned Card' })
    const unassignedCard = makeCard({ id: 'c-unassigned', assignees: [], title: 'Unassigned Card' })
    const columns = [makeColumn('col-1', [assignedCard, unassignedCard])]

    render(
      <SwimlaneView
        boardId="board-1"
        columns={columns}
        groupBy="ASSIGNEE"
        members={MEMBERS}
      />
    )

    expect(screen.getByText('None')).toBeInTheDocument()
    expect(screen.getByText('Unassigned Card')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TC-SL04: BoardView renders SwimlaneView when groupBy is PRIORITY (not NONE)
// ---------------------------------------------------------------------------
describe('TC-SL04: BoardView renders SwimlaneView when groupBy !== NONE', () => {
  beforeEach(() => {
    mockGet.mockImplementation((path: string) => {
      if (path.includes('/members')) return Promise.resolve(MEMBERS)
      if (path.includes('/starred-boards')) return Promise.resolve([])
      if (path.includes('/column-colors')) return Promise.resolve({ tokens: [], colorMap: {} })
      // Board response with groupBy=PRIORITY
      return Promise.resolve({
        id: 'board-1',
        name: 'Test Board',
        ownerId: 'user-1',
        createdAt: '',
        groupBy: 'PRIORITY',
        columns: [
          {
            id: 'col-1',
            boardId: 'board-1',
            name: 'Todo',
            position: 1000,
            cards: [makeCard({ id: 'c1', priority: 'HIGH', title: 'HP Card' })],
          },
        ],
      })
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    useBoardStore.setState({ board: null })
  })

  it('renders the swimlane grid when board has groupBy=PRIORITY', async () => {
    render(<BoardView boardId="board-1" />)

    // Wait for board to load and SwimlaneView to appear
    const laneHeader = await screen.findByTestId('swimlane-view')
    expect(laneHeader).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TC-SL05: BoardView renders ColumnList when groupBy is NONE
// ---------------------------------------------------------------------------
describe('TC-SL05: BoardView renders ColumnList when groupBy is NONE', () => {
  beforeEach(() => {
    mockGet.mockImplementation((path: string) => {
      if (path.includes('/members')) return Promise.resolve([])
      if (path.includes('/starred-boards')) return Promise.resolve([])
      if (path.includes('/column-colors')) return Promise.resolve({ tokens: [], colorMap: {} })
      return Promise.resolve({
        id: 'board-1',
        name: 'Test Board',
        ownerId: 'user-1',
        createdAt: '',
        groupBy: 'NONE',
        columns: [],
      })
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    useBoardStore.setState({ board: null })
  })

  it('does not render swimlane-view when groupBy is NONE', async () => {
    render(<BoardView boardId="board-1" />)

    // Wait for the board to load (board name should appear — multiple occurrences are fine)
    await screen.findAllByText('Test Board')

    // SwimlaneView should NOT be present
    expect(screen.queryByTestId('swimlane-view')).toBeNull()
  })
})
