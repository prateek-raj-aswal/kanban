/**
 * test_plan:
 *   story_id: US-1501, US-1502, US-1503
 *   framework: vitest + @testing-library/react
 *   tests:
 *     - id: TC-1501-1
 *       maps_to_ac: "US-1501 AC-1: Issues nav item appears in sidebar linking to /issues"
 *     - id: TC-1501-2
 *       maps_to_ac: "US-1501 AC-2: Issues nav item is active/highlighted when on /issues"
 *     - id: TC-1501-3
 *       maps_to_ac: "US-1501 AC-3: Issues nav item is not active when on /boards"
 *     - id: TC-1502-1
 *       maps_to_ac: "US-1502 AC-1: Issues tab appears in BottomNav on mobile linking to /issues"
 *     - id: TC-1502-2
 *       maps_to_ac: "US-1502 AC-2: Issues tab is active in BottomNav when pathname is /issues"
 *     - id: TC-1503-1
 *       maps_to_ac: "US-1503 AC-1: Status filter tabs render on Issues page (ALL, OPEN, IN_PROGRESS, CLOSED)"
 *     - id: TC-1503-2
 *       maps_to_ac: "US-1503 AC-2: Default filter is ALL — all issues shown initially"
 *     - id: TC-1503-3
 *       maps_to_ac: "US-1503 AC-3: IssuesPanel filters visible issues by statusFilter prop"
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { IssueResponse } from '@/types/api'

// ---------------------------------------------------------------------------
// Shared mock data
// ---------------------------------------------------------------------------
const MOCK_ISSUES: IssueResponse[] = [
  {
    id: 'issue-1', title: 'Login bug', description: null, status: 'OPEN',
    parentCardId: null, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'issue-2', title: 'Dark mode', description: null, status: 'IN_PROGRESS',
    parentCardId: 'card-1', createdAt: '2026-01-02T00:00:00Z', updatedAt: '2026-01-02T00:00:00Z',
  },
  {
    id: 'issue-3', title: 'Old bug fixed', description: null, status: 'CLOSED',
    parentCardId: null, createdAt: '2026-01-03T00:00:00Z', updatedAt: '2026-01-03T00:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// Shared mocks
// ---------------------------------------------------------------------------
let mockPathname = '/boards'
let mockIsMobile = false

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => mockPathname,
}))

vi.mock('@/lib/useIsMobile', () => ({
  useIsMobile: () => mockIsMobile,
}))

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue([]),
    post: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
  },
  ApiError: class ApiError extends Error {
    constructor(public status: number, public code: string, message: string) { super(message) }
  },
}))

vi.mock('@/lib/theme', () => ({
  T: new Proxy({}, { get: (_t, prop) => String(prop) }),
  ICONS: new Proxy({}, { get: (_t, prop) => String(prop) }),
  darkenHex: (hex: string) => hex,
}))

vi.mock('@/components/ui/Icon', () => ({
  default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}))

vi.mock('@/components/ui/ThemeSwitcher', () => ({
  default: () => <div data-testid="theme-switcher" />,
}))

vi.mock('@/components/ui/NotificationPanel', () => ({
  default: () => <div data-testid="notification-panel" />,
}))

vi.mock('@/store/workspaceStore', () => ({
  useWorkspaceStore: () => ({ workspaces: [], activeWorkspaceId: null, setWorkspaces: vi.fn() }),
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({ logout: vi.fn() }),
}))

vi.mock('@/store/sidebarStore', () => ({
  useSidebarStore: () => ({ collapsed: false, setCollapsed: vi.fn() }),
}))

vi.mock('@/lib/auth', () => ({
  getRefreshToken: () => null,
}))

vi.mock('@/components/board/WorkspaceSwitcher', () => ({
  default: () => <div data-testid="workspace-switcher" />,
}))

// ---------------------------------------------------------------------------
// Component imports (after mocks)
// ---------------------------------------------------------------------------
import Sidebar from '@/components/board/Sidebar'
import BottomNav from '@/components/ui/BottomNav'
import IssuesPanel from '@/components/board/IssuesPanel'

afterEach(() => {
  vi.clearAllMocks()
  mockPathname = '/boards'
  mockIsMobile = false
})

// ===========================================================================
// US-1501: Desktop Sidebar — Issues nav link
// ===========================================================================

describe('TC-1501-1: Sidebar renders Issues link to /issues', () => {
  it('has a nav link with href="/issues"', () => {
    mockPathname = '/boards'
    render(<Sidebar />)
    const link = document.querySelector('a[href="/issues"]')
    expect(link).not.toBeNull()
  })
})

describe('TC-1501-2: Issues nav item is active when on /issues', () => {
  it('renders Issues link with active styles when pathname is /issues', () => {
    mockPathname = '/issues'
    render(<Sidebar />)
    // The active link should have the text "Issues"
    const link = document.querySelector('a[href="/issues"]') as HTMLAnchorElement
    expect(link).not.toBeNull()
    // fontWeight 600 indicates active state
    expect(link.style.fontWeight).toBe('600')
  })
})

describe('TC-1501-3: Issues nav item is not active on other pages', () => {
  it('Issues link is not active-styled when on /boards', () => {
    mockPathname = '/boards'
    render(<Sidebar />)
    const link = document.querySelector('a[href="/issues"]') as HTMLAnchorElement
    expect(link).not.toBeNull()
    // fontWeight 500 indicates inactive
    expect(link.style.fontWeight).toBe('500')
  })
})

// ===========================================================================
// US-1502: Mobile BottomNav — Issues tab
// ===========================================================================

describe('TC-1502-1: BottomNav renders Issues tab on mobile', () => {
  beforeEach(() => { mockIsMobile = true })

  it('has an anchor linking to /issues labeled Issues', () => {
    render(<BottomNav />)
    const link = document.querySelector('a[href="/issues"]')
    expect(link).not.toBeNull()
    expect(link!.textContent).toContain('Issues')
  })
})

describe('TC-1502-2: Issues tab is active in BottomNav when on /issues', () => {
  beforeEach(() => { mockIsMobile = true; mockPathname = '/issues' })

  it('Issues tab has aria-current="page" when pathname is /issues', () => {
    render(<BottomNav />)
    const link = document.querySelector('a[href="/issues"]') as HTMLAnchorElement
    expect(link).not.toBeNull()
    expect(link.getAttribute('aria-current')).toBe('page')
  })
})

// ===========================================================================
// US-1503: IssuesPanel statusFilter prop + Issues page filter tabs
// ===========================================================================
import { api } from '@/lib/api'

describe('TC-1503-2: IssuesPanel shows all issues when no statusFilter given', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue(MOCK_ISSUES)
  })

  it('renders all issues when statusFilter is undefined', async () => {
    render(<IssuesPanel />)
    expect(await screen.findByText('Login bug')).toBeInTheDocument()
    expect(await screen.findByText('Dark mode')).toBeInTheDocument()
    expect(await screen.findByText('Old bug fixed')).toBeInTheDocument()
  })
})

describe('TC-1503-3: IssuesPanel filters visible issues by statusFilter prop', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue(MOCK_ISSUES)
  })

  it('shows only OPEN issues when statusFilter="OPEN"', async () => {
    render(<IssuesPanel statusFilter="OPEN" />)
    expect(await screen.findByText('Login bug')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByText('Dark mode')).not.toBeInTheDocument()
      expect(screen.queryByText('Old bug fixed')).not.toBeInTheDocument()
    })
  })

  it('shows only CLOSED issues when statusFilter="CLOSED"', async () => {
    render(<IssuesPanel statusFilter="CLOSED" />)
    expect(await screen.findByText('Old bug fixed')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByText('Login bug')).not.toBeInTheDocument()
      expect(screen.queryByText('Dark mode')).not.toBeInTheDocument()
    })
  })

  it('shows all issues when statusFilter="ALL"', async () => {
    render(<IssuesPanel statusFilter="ALL" />)
    expect(await screen.findByText('Login bug')).toBeInTheDocument()
    expect(await screen.findByText('Dark mode')).toBeInTheDocument()
    expect(await screen.findByText('Old bug fixed')).toBeInTheDocument()
  })
})
