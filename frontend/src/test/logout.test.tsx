/**
 * test_plan:
 *   story_id: US-1203
 *   framework: vitest + @testing-library/react
 *   tests:
 *     - id: TC-001
 *       file: "src/test/logout.test.tsx"
 *       maps_to_ac: "AC-1 + AC-3 desktop: Sidebar renders a logout button"
 *       type: acceptance
 *     - id: TC-002
 *       file: "src/test/logout.test.tsx"
 *       maps_to_ac: "AC-1 + AC-2: Clicking Sidebar logout calls authStore.logout() and navigates to /login"
 *       type: acceptance
 *     - id: TC-003
 *       file: "src/test/logout.test.tsx"
 *       maps_to_ac: "AC-1 + AC-3 mobile: BottomNav renders a logout affordance on mobile"
 *       type: acceptance
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useAuthStore } from '@/store/authStore'

// ---------------------------------------------------------------------------
// Shared navigation mock — must be hoisted before any component import
// ---------------------------------------------------------------------------
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockPush }),
  usePathname: () => '/boards',
}))

// ---------------------------------------------------------------------------
// Mock @/lib/api — Sidebar fires multiple GET calls in useEffect; we stub
// them all to resolve with empty arrays so the test doesn't hit the network.
// ---------------------------------------------------------------------------
// Sidebar calls api.get(...).catch(...) — the mock must return a real Promise.
// mockResolvedValue wraps the value in Promise.resolve(), so .catch() is available.
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue([]),
    post: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
  },
}))

// ---------------------------------------------------------------------------
// Stub heavy child components to keep the render surface minimal.
// ThemeSwitcher and NotificationPanel are unrelated to this story.
// ---------------------------------------------------------------------------
vi.mock('@/components/ui/ThemeSwitcher', () => ({
  default: () => <div data-testid="theme-switcher" />,
}))

vi.mock('@/components/ui/NotificationPanel', () => ({
  default: () => <div data-testid="notification-panel" />,
}))

// useIsMobile must be mocked at module level (vi.mock is hoisted — placing it
// inside beforeEach/describe is silently ignored by Vitest's transform).
// Returning true here lets BottomNav render instead of returning null.
vi.mock('@/lib/useIsMobile', () => ({
  useIsMobile: () => true,
}))

// ---------------------------------------------------------------------------
// Imports that depend on the mocks above
// ---------------------------------------------------------------------------
import Sidebar from '@/components/board/Sidebar'
import BottomNav from '@/components/ui/BottomNav'

// ---------------------------------------------------------------------------
// Shared store reset
// ---------------------------------------------------------------------------
beforeEach(() => {
  mockPush.mockReset()
  useAuthStore.setState({ token: null })
})

afterEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// TC-001 — AC-1 + AC-3 (desktop): Sidebar renders a "Log out" button
// ---------------------------------------------------------------------------
describe('TC-001: Sidebar renders a logout button', () => {
  it('has a button with accessible text "Log out"', () => {
    render(<Sidebar />)

    // The button must be present via accessible name (aria-label or visible text)
    const btn = screen.getByRole('button', { name: /log out/i })
    expect(btn).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TC-002 — AC-1 + AC-2: Clicking the logout button clears auth and navigates
// ---------------------------------------------------------------------------
describe('TC-002: Sidebar logout button wires to authStore.logout() and router.push', () => {
  it('clears the token and calls router.push("/login") on click', () => {
    // Pre-seed a token so logout has something to clear
    useAuthStore.setState({ token: 'test-token' })

    render(<Sidebar />)

    const btn = screen.getByRole('button', { name: /log out/i })
    fireEvent.click(btn)

    // AC-2: token must be null after logout
    expect(useAuthStore.getState().token).toBeNull()

    // AC-1: router must redirect to /login
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})

// ---------------------------------------------------------------------------
// TC-003 — AC-1 + AC-3 (mobile): BottomNav renders a logout affordance
// ---------------------------------------------------------------------------
describe('TC-003: BottomNav renders a logout affordance on mobile', () => {
  it('has a button with accessible text "Log out" when isMobile is true', () => {
    render(<BottomNav />)
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()
  })
})
