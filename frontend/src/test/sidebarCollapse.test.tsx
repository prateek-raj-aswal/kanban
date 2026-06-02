/**
 * test_plan:
 *   story_id: US-1205
 *   framework: vitest + @testing-library/react
 *   tests:
 *     - id: TC-001
 *       file: "src/test/sidebarCollapse.test.tsx"
 *       maps_to_ac: "AC-1 + AC-2: Toggle button cycles collapsed state in sidebarStore"
 *       type: acceptance
 *     - id: TC-002
 *       file: "src/test/sidebarCollapse.test.tsx"
 *       maps_to_ac: "AC-1: When collapsed=true, <aside> width is 48px (rail)"
 *       type: acceptance
 *     - id: TC-003
 *       file: "src/test/sidebarCollapse.test.tsx"
 *       maps_to_ac: "AC-2: When collapsed=false, <aside> width is 232px (full)"
 *       type: acceptance
 *     - id: TC-004
 *       file: "src/test/sidebarCollapse.test.tsx"
 *       maps_to_ac: "AC-3: sidebarStore persists collapsed state to localStorage via Zustand persist"
 *       type: acceptance
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// jsdom provides localStorage natively — no custom mock needed here.
// Zustand persist captures jsdom's localStorage at module-evaluation time
// (before any Object.defineProperty override could run due to ESM hoisting),
// so we must use jsdom's localStorage directly for TC-004.

// ---------------------------------------------------------------------------
// Navigation mock — hoisted before component imports by Vitest transform.
// ---------------------------------------------------------------------------
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/boards',
}))

// ---------------------------------------------------------------------------
// API mock — Sidebar fires multiple GET calls in useEffect; stub them all.
// ---------------------------------------------------------------------------
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue([]),
    post: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
  },
}))

// ---------------------------------------------------------------------------
// Stub heavy child components unrelated to this story.
// ---------------------------------------------------------------------------
vi.mock('@/components/ui/ThemeSwitcher', () => ({ default: () => null }))
vi.mock('@/components/ui/NotificationPanel', () => ({ default: () => null }))
vi.mock('@/components/board/WorkspaceSwitcher', () => ({ default: () => null }))
vi.mock('@/lib/useIsMobile', () => ({ useIsMobile: () => false }))

// ---------------------------------------------------------------------------
// Component + store imports (after mocks).
// ---------------------------------------------------------------------------
import Sidebar from '@/components/board/Sidebar'
import { useSidebarStore } from '@/store/sidebarStore'

// ---------------------------------------------------------------------------
// Shared reset
// ---------------------------------------------------------------------------
beforeEach(() => {
  localStorage.clear()
  useSidebarStore.setState({ collapsed: false })
})

afterEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// TC-001 — AC-1 + AC-2: toggle button cycles the store's collapsed value
// ---------------------------------------------------------------------------
describe('TC-001: toggle button cycles collapsed state', () => {
  it('expands → collapses → expands via the toggle button', () => {
    useSidebarStore.setState({ collapsed: false })
    render(<Sidebar />)

    const toggleBtn = screen.getByRole('button', { name: /collapse sidebar|expand sidebar/i })

    // First click: should collapse
    fireEvent.click(toggleBtn)
    expect(useSidebarStore.getState().collapsed).toBe(true)

    // Second click: should restore
    fireEvent.click(toggleBtn)
    expect(useSidebarStore.getState().collapsed).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// TC-002 — AC-1: collapsed=true → <aside> has width 48px (rail)
// ---------------------------------------------------------------------------
describe('TC-002: collapsed=true renders <aside> at rail width 48px', () => {
  it('sets aside style.width to 48px when store is collapsed', () => {
    useSidebarStore.setState({ collapsed: true })
    render(<Sidebar />)

    const aside = document.querySelector('aside')
    expect(aside).not.toBeNull()
    expect(aside!.style.width).toBe('48px')
  })
})

// ---------------------------------------------------------------------------
// TC-003 — AC-2: collapsed=false → <aside> has width 232px (full)
// ---------------------------------------------------------------------------
describe('TC-003: collapsed=false renders <aside> at full width 232px', () => {
  it('sets aside style.width to 232px when store is expanded', () => {
    useSidebarStore.setState({ collapsed: false })
    render(<Sidebar />)

    const aside = document.querySelector('aside')
    expect(aside).not.toBeNull()
    expect(aside!.style.width).toBe('232px')
  })
})

// ---------------------------------------------------------------------------
// TC-004 — AC-3: sidebarStore persists to localStorage via Zustand persist
// ---------------------------------------------------------------------------
describe('TC-004: sidebarStore persists collapsed state to localStorage', () => {
  it('writes collapsed:true into localStorage under key "kanban_sidebar"', () => {
    useSidebarStore.getState().setCollapsed(true)

    const raw = localStorage.getItem('kanban_sidebar')
    expect(raw).not.toBeNull()

    const parsed = JSON.parse(raw!)
    // Zustand persist v4 wraps state under a "state" key by default.
    expect(parsed?.state?.collapsed).toBe(true)
  })
})
