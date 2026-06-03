/**
 * test_plan:
 *   story_id: US-1411
 *   framework: vitest + @testing-library/react
 *   tests:
 *     - id: TC-RM01
 *       maps_to_ac: "AC-1: WorkspaceManageModal shows role selector for each member when current user is OWNER"
 *       type: acceptance
 *     - id: TC-RM02
 *       maps_to_ac: "AC-2: WorkspaceManageModal shows read-only role badge when current user is MEMBER"
 *       type: acceptance
 *     - id: TC-RM03
 *       maps_to_ac: "AC-3: WorkspaceManageModal role change calls PATCH endpoint"
 *       type: acceptance
 *     - id: TC-RM04
 *       maps_to_ac: "AC-1: MemberList shows role dropdown for each member when currentUserRole is ADMIN"
 *       type: acceptance
 *     - id: TC-RM05
 *       maps_to_ac: "AC-2: MemberList OWNER option is disabled when currentUserRole is ADMIN"
 *       type: acceptance
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockGet = vi.fn()
const mockPatch = vi.fn()

vi.mock('@/lib/api', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: vi.fn().mockResolvedValue({}),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('@/lib/theme', () => ({
  T: new Proxy({}, { get: (_t, prop) => String(prop) }),
}))

vi.mock('@/components/ui/Icon', () => ({
  default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}))

vi.mock('@/store/workspaceStore', () => ({
  useWorkspaceStore: () => ({
    workspaces: [],
    setWorkspaces: vi.fn(),
    setActiveWorkspace: vi.fn(),
  }),
}))

// ---------------------------------------------------------------------------
// Component imports (after mocks)
// ---------------------------------------------------------------------------
import WorkspaceManageModal from '@/components/board/WorkspaceManageModal'
import MemberList from '@/components/board/MemberList'
import type { WorkspaceResponse, MemberResponse } from '@/types/api'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeWorkspace(role = 'OWNER'): WorkspaceResponse {
  return { id: 'ws-1', name: 'My Workspace', ownerId: 'user-1', role, createdAt: '' }
}

function makeMembers(): MemberResponse[] {
  return [
    { userId: 'u-1', displayName: 'Alice', email: 'alice@example.com', role: 'OWNER', joinedAt: '' },
    { userId: 'u-2', displayName: 'Bob', email: 'bob@example.com', role: 'MEMBER', joinedAt: '' },
  ]
}

function renderModal(role = 'OWNER') {
  return render(
    <WorkspaceManageModal
      workspace={makeWorkspace(role)}
      onClose={vi.fn()}
      onUpdated={vi.fn()}
      onDeleted={vi.fn()}
    />
  )
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------
beforeEach(() => {
  mockGet.mockResolvedValue(makeMembers())
  mockPatch.mockResolvedValue({ userId: 'u-2', displayName: 'Bob', email: 'bob@example.com', role: 'ADMIN', joinedAt: '' })
})

afterEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// TC-RM01: WorkspaceManageModal shows role selector for each member when OWNER
// ---------------------------------------------------------------------------
describe('TC-RM01: WorkspaceManageModal shows role selector for each member when OWNER', () => {
  it('renders a role <select> for each member row when current user is OWNER', async () => {
    renderModal('OWNER')

    await screen.findByText('Alice')

    // Each member row should have a combobox (select) for role
    const selects = screen.getAllByRole('combobox')
    // At least one combobox per member (2 members)
    expect(selects.length).toBeGreaterThanOrEqual(2)
  })

  it('pre-selects the current role in the dropdown', async () => {
    renderModal('OWNER')

    await screen.findByText('Bob')

    // Find the select associated with Bob (MEMBER role)
    const selects = screen.getAllByRole('combobox')
    // Bob's select should have value MEMBER
    const bobSelect = selects.find(s => (s as HTMLSelectElement).value === 'MEMBER')
    expect(bobSelect).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// TC-RM02: WorkspaceManageModal shows read-only role badge when MEMBER
// ---------------------------------------------------------------------------
describe('TC-RM02: WorkspaceManageModal shows read-only role badge when current user is MEMBER', () => {
  it('does not render role selects for MEMBER role (canManageMembers=false)', async () => {
    renderModal('MEMBER')

    await screen.findByText('Alice')

    // No comboboxes should be present in member rows
    const selects = screen.queryAllByRole('combobox')
    // The only selects might be unrelated (add email input is not a combobox)
    // Member role selects should not exist
    const roleSelects = selects.filter(s =>
      ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'].includes((s as HTMLSelectElement).value)
    )
    expect(roleSelects.length).toBe(0)
  })

  it('shows role text for each member when user cannot manage members', async () => {
    renderModal('MEMBER')

    await screen.findByText('Alice')

    // Role text should be visible as static text (not in a select)
    expect(screen.getByText('OWNER')).toBeInTheDocument()
    expect(screen.getByText('MEMBER')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TC-RM03: WorkspaceManageModal role change calls PATCH endpoint
// ---------------------------------------------------------------------------
describe('TC-RM03: WorkspaceManageModal role change calls PATCH /workspaces/{id}/members/{uid}/role', () => {
  it('calls PATCH with the new role when dropdown changes', async () => {
    renderModal('OWNER')

    await screen.findByText('Bob')

    const selects = screen.getAllByRole('combobox')
    // Bob is MEMBER (u-2), find his select
    const bobSelect = selects.find(s => (s as HTMLSelectElement).value === 'MEMBER') as HTMLSelectElement
    expect(bobSelect).toBeDefined()

    await act(async () => {
      fireEvent.change(bobSelect, { target: { value: 'ADMIN' } })
    })

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith(
        '/api/v1/workspaces/ws-1/members/u-2/role',
        { role: 'ADMIN' }
      )
    })
  })

  it('optimistically updates the member role in the UI', async () => {
    renderModal('OWNER')

    await screen.findByText('Bob')

    const selects = screen.getAllByRole('combobox')
    const bobSelect = selects.find(s => (s as HTMLSelectElement).value === 'MEMBER') as HTMLSelectElement

    await act(async () => {
      fireEvent.change(bobSelect, { target: { value: 'ADMIN' } })
    })

    // After optimistic update, Bob's select value should be ADMIN
    await waitFor(() => {
      const updatedSelects = screen.getAllByRole('combobox')
      const adminSelects = updatedSelects.filter(s => (s as HTMLSelectElement).value === 'ADMIN')
      expect(adminSelects.length).toBeGreaterThan(0)
    })
  })
})

// ---------------------------------------------------------------------------
// TC-RM04: MemberList shows role dropdown for each member when currentUserRole is ADMIN
// ---------------------------------------------------------------------------
describe('TC-RM04: MemberList shows role dropdown for each member when currentUserRole is ADMIN', () => {
  it('renders a role <select> per member row when currentUserRole is ADMIN', async () => {
    render(<MemberList boardId="b-1" currentUserRole="ADMIN" />)

    // Wait for members to load
    await screen.findByText('Alice')

    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBeGreaterThanOrEqual(2)
  })

  it('does not render role selects when currentUserRole is MEMBER', async () => {
    render(<MemberList boardId="b-1" currentUserRole="MEMBER" />)

    await screen.findByText('Alice')

    const selects = screen.queryAllByRole('combobox')
    const roleSelects = selects.filter(s =>
      ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'].includes((s as HTMLSelectElement).value)
    )
    expect(roleSelects.length).toBe(0)
  })

  it('does not render role selects when currentUserRole is undefined', async () => {
    render(<MemberList boardId="b-1" />)

    await screen.findByText('Alice')

    const selects = screen.queryAllByRole('combobox')
    const roleSelects = selects.filter(s =>
      ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'].includes((s as HTMLSelectElement).value)
    )
    expect(roleSelects.length).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// TC-RM05: MemberList OWNER option is disabled when currentUserRole is ADMIN
// ---------------------------------------------------------------------------
describe('TC-RM05: MemberList OWNER option is disabled when currentUserRole is ADMIN', () => {
  it('disables the OWNER <option> in every select when currentUserRole is ADMIN', async () => {
    render(<MemberList boardId="b-1" currentUserRole="ADMIN" />)

    await screen.findByText('Alice')

    // Find all OWNER options
    const ownerOptions = screen.getAllByRole('option', { name: 'OWNER' })
    ownerOptions.forEach(opt => {
      expect((opt as HTMLOptionElement).disabled).toBe(true)
    })
  })

  it('enables the OWNER <option> when currentUserRole is OWNER', async () => {
    render(<MemberList boardId="b-1" currentUserRole="OWNER" />)

    await screen.findByText('Alice')

    const ownerOptions = screen.getAllByRole('option', { name: 'OWNER' })
    ownerOptions.forEach(opt => {
      expect((opt as HTMLOptionElement).disabled).toBe(false)
    })
  })
})
