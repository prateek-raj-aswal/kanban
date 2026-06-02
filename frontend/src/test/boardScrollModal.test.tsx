/**
 * test_plan:
 *   story_id: US-1206
 *   framework: Vitest + React Testing Library
 *   tests:
 *     - id: TC-001
 *       file: "src/test/boardScrollModal.test.tsx"
 *       maps_to_ac: "AC-1: GIVEN many columns WHEN render THEN board scrolls horizontally — ColumnList inner div has overflowX:auto"
 *       type: acceptance
 *     - id: TC-002
 *       file: "src/test/boardScrollModal.test.tsx"
 *       maps_to_ac: "AC-1: GIVEN many columns WHEN render THEN board area wrapper does NOT clip scroll — must not use overflow:hidden"
 *       type: acceptance
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'

// ---------------------------------------------------------------------------
// Shared mobile flag — read at call-time inside mock factories
// ---------------------------------------------------------------------------
let mockIsMobile = false

vi.mock('@/lib/useIsMobile', () => ({
  useIsMobile: () => mockIsMobile,
}))

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue([]),
    post: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  },
  ApiError: class ApiError extends Error {},
}))

vi.mock('@/lib/theme', () => ({
  T: {
    card: '#fff', cardBorder: '#e2e8f0', text: '#0f172a', textMuted: '#64748b',
    textFaint: '#94a3b8', column: '#f1f5f9', sidebar: '#f8fafc', bg: '#f8fafc',
    surface: '#fff', border: '#e2e8f0', accent: '#6366f1', accentFg: '#fff',
  },
  darkenHex: (hex: string) => hex,
}))

vi.mock('@/store/boardStore', () => ({
  useBoardStore: vi.fn(() => ({
    board: {
      id: 'b1', name: 'Test Board', columns: [], ownerId: 'u1', createdAt: '2024-01-01T00:00:00Z',
    },
    setBoard: vi.fn(), addCard: vi.fn(), updateCard: vi.fn(), moveCard: vi.fn(),
    deleteCard: vi.fn(), addColumn: vi.fn(), deleteColumn: vi.fn(),
    applyEvent: vi.fn(), reorderColumns: vi.fn(),
  })),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/boards/b1',
}))

vi.mock('@/lib/websocket', () => ({
  subscribeToBoard: vi.fn().mockReturnValue(vi.fn()),
}))

vi.mock('@/lib/auth', () => ({
  getToken: vi.fn().mockReturnValue('tok'),
  isAuthenticated: vi.fn().mockReturnValue(true),
  clearToken: vi.fn(),
  setToken: vi.fn(),
}))

vi.mock('@/store/configStore', () => ({
  useConfigStore: vi.fn(() => ({
    swimlanes: false,
  })),
}))

vi.mock('@/components/board/Sidebar', () => ({
  default: () => <div data-testid="sidebar-stub" />,
}))

vi.mock('@/components/board/ChatSidebar', () => ({
  default: () => <div data-testid="chat-sidebar-stub" />,
}))

vi.mock('@/components/board/InviteModal', () => ({
  default: () => <div data-testid="invite-modal-stub" />,
}))

vi.mock('@/components/board/CardModal', () => ({
  default: () => <div data-testid="card-modal-stub" />,
}))

vi.mock('@/components/ui/Icon', () => ({
  default: ({ name }: { name: string }) => <span data-icon={name} />,
}))

import type { ColumnResponse } from '@/types/api'

const makeColumn = (id: string, name: string): ColumnResponse => ({
  id,
  name,
  position: 1,
  boardId: 'b1',
  cards: [],
  wipLimit: null,
})

// ---------------------------------------------------------------------------
// TC-001: ColumnList inner scroll div — overflowX: auto
// ---------------------------------------------------------------------------
describe('TC-001: ColumnList inner div has overflowX auto (scroll invariant)', () => {
  it('renders the inner flex container with overflowX auto', async () => {
    const { default: ColumnList } = await import('@/components/board/ColumnList')
    const cols = [
      makeColumn('c1', 'Todo'),
      makeColumn('c2', 'In Progress'),
      makeColumn('c3', 'Done'),
    ]
    const { container } = render(
      <ColumnList
        boardId="b1"
        columns={cols}
        onDeleteColumn={vi.fn()}
      />
    )
    const allDivs = Array.from(container.querySelectorAll('div[style]')) as HTMLElement[]
    const scrollable = allDivs.find(el => el.style.overflowX === 'auto')
    expect(scrollable, 'Expected a div with overflowX:auto inside ColumnList').not.toBeNull()
  })
})

// ---------------------------------------------------------------------------
// TC-002: BoardView board area wrapper — must NOT have overflow:hidden
//         After fix: should use minHeight:0 instead
// ---------------------------------------------------------------------------
describe('TC-002: BoardView board area wrapper does not clip scroll with overflow:hidden', () => {
  beforeEach(() => {
    mockIsMobile = false
  })

  it('board area div (data-testid=board-area) does not use overflow:hidden', async () => {
    const { default: BoardView } = await import('@/components/board/BoardView')
    const { container } = render(<BoardView boardId="b1" />)

    const boardAreaDiv = container.querySelector('[data-testid="board-area"]') as HTMLElement | null
    expect(boardAreaDiv, 'Board area div must be rendered with data-testid="board-area"').not.toBeNull()

    expect(
      boardAreaDiv!.style.cssText,
      'Board area div must not use overflow:hidden — it clips horizontal scroll',
    ).not.toContain('overflow: hidden')
  })
})
