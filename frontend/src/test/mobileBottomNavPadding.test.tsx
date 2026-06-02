/**
 * test_plan:
 *   story_id: US-1204
 *   framework: vitest + @testing-library/react
 *   tests:
 *     - id: TC-001
 *       file: "src/test/mobileBottomNavPadding.test.tsx"
 *       maps_to_ac: "AC-1: GIVEN viewport < 768px WHEN ThemeSwitcher is opened THEN Sidebar aside has paddingBottom 56px so it is not occluded by BottomNav"
 *       type: acceptance
 *     - id: TC-002
 *       file: "src/test/mobileBottomNavPadding.test.tsx"
 *       maps_to_ac: "AC-3: Desktop layout unchanged — Sidebar aside does NOT have 56px paddingBottom when isMobile=false"
 *       type: acceptance
 *     - id: TC-003
 *       file: "src/test/mobileBottomNavPadding.test.tsx"
 *       maps_to_ac: "AC-2: GIVEN BottomNav is fixed WHEN scrollable content reaches the bottom THEN SmartCardList root div has paddingBottom 56px"
 *       type: acceptance
 *     - id: TC-004
 *       file: "src/test/mobileBottomNavPadding.test.tsx"
 *       maps_to_ac: "AC-3: Desktop layout unchanged — SmartCardList root div does NOT have 56px paddingBottom when isMobile=false"
 *       type: acceptance
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import type { SmartCardResponse } from '@/types/api'

// ---------------------------------------------------------------------------
// Shared mutable flag — vi.mock factories are evaluated once (hoisted), so we
// read this variable at call-time inside the factory to vary between tests.
// ---------------------------------------------------------------------------
let mockIsMobile = false

vi.mock('@/lib/useIsMobile', () => ({
  useIsMobile: () => mockIsMobile,
}))

// ---------------------------------------------------------------------------
// next/navigation — Sidebar uses usePathname and useRouter
// ---------------------------------------------------------------------------
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/boards',
}))

// ---------------------------------------------------------------------------
// @/lib/api — Sidebar fires multiple api.get calls in useEffect
// ---------------------------------------------------------------------------
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue([]),
    post: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
  },
}))

// ---------------------------------------------------------------------------
// Stub heavy child components irrelevant to this story
// ---------------------------------------------------------------------------
vi.mock('@/components/ui/ThemeSwitcher', () => ({
  default: () => <div data-testid="theme-switcher" />,
}))

vi.mock('@/components/ui/NotificationPanel', () => ({
  default: () => <div data-testid="notification-panel" />,
}))

// ---------------------------------------------------------------------------
// Lazy imports so mocks are in place first
// ---------------------------------------------------------------------------
import Sidebar from '@/components/board/Sidebar'
import SmartCardList from '@/components/board/SmartCardList'

// ---------------------------------------------------------------------------
// Minimal SmartCardResponse fixture
// ---------------------------------------------------------------------------
const mockCard: SmartCardResponse = {
  id: 'card-1',
  title: 'Test Card',
  boardId: 'board-1',
  boardName: 'Test Board',
  columnId: 'col-1',
  columnName: 'To Do',
  dueDate: null,
  startDate: null,
  priority: 'NONE',
}

afterEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// TC-001 — AC-1 (mobile): Sidebar <aside> has paddingBottom: '56px'
// ---------------------------------------------------------------------------
describe('TC-001: Sidebar aside has paddingBottom 56px on mobile', () => {
  beforeEach(() => {
    mockIsMobile = true
  })

  it('renders <aside> with inline style paddingBottom equal to 56px', () => {
    const { container } = render(<Sidebar />)
    const aside = container.querySelector('aside')
    expect(aside).not.toBeNull()
    expect(aside!.style.paddingBottom).toBe('56px')
  })
})

// ---------------------------------------------------------------------------
// TC-002 — AC-3 (desktop): Sidebar <aside> does NOT have 56px paddingBottom
// ---------------------------------------------------------------------------
describe('TC-002: Sidebar aside does not have 56px paddingBottom on desktop', () => {
  beforeEach(() => {
    mockIsMobile = false
  })

  it('renders <aside> without 56px paddingBottom', () => {
    const { container } = render(<Sidebar />)
    const aside = container.querySelector('aside')
    expect(aside).not.toBeNull()
    expect(aside!.style.paddingBottom).toBe('0px')
  })
})

// ---------------------------------------------------------------------------
// TC-003 — AC-2 (mobile): SmartCardList root div has paddingBottom: '56px'
// ---------------------------------------------------------------------------
describe('TC-003: SmartCardList root div has paddingBottom 56px on mobile', () => {
  beforeEach(() => {
    mockIsMobile = true
  })

  it('renders root div with inline style paddingBottom equal to 56px', () => {
    const { container } = render(
      <SmartCardList cards={[mockCard]} emptyMessage="none" />
    )
    const root = container.firstElementChild as HTMLElement | null
    expect(root).not.toBeNull()
    expect(root!.style.paddingBottom).toBe('56px')
  })
})

// ---------------------------------------------------------------------------
// TC-004 — AC-3 (desktop): SmartCardList root div does NOT have 56px padding
// ---------------------------------------------------------------------------
describe('TC-004: SmartCardList root div does not have 56px paddingBottom on desktop', () => {
  beforeEach(() => {
    mockIsMobile = false
  })

  it('renders root div without 56px paddingBottom', () => {
    const { container } = render(
      <SmartCardList cards={[mockCard]} emptyMessage="none" />
    )
    const root = container.firstElementChild as HTMLElement | null
    expect(root).not.toBeNull()
    expect(root!.style.paddingBottom).toBe('0px')
  })
})
