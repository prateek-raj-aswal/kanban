/**
 * test_plan:
 *   story_id: US-1304
 *   framework: vitest + @testing-library/react
 *   tests:
 *     - id: TC-1
 *       maps_to_ac: "AC-1: Members list renders when modal opens"
 *       type: acceptance
 *     - id: TC-2
 *       maps_to_ac: "AC-2: Add member form — submit email calls api.post → member appears in list"
 *       type: acceptance
 *     - id: TC-3
 *       maps_to_ac: "AC-3: Remove button — click calls api.delete → member row removed"
 *       type: acceptance
 *     - id: TC-4
 *       maps_to_ac: "AC-4: Non-OWNER/ADMIN role sees remove buttons disabled"
 *       type: acceptance
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockGet = vi.fn()
const mockPost = vi.fn()
const mockDelete = vi.fn()

vi.mock('@/lib/api', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: vi.fn().mockResolvedValue({}),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}))

vi.mock('@/lib/theme', () => ({
  T: new Proxy({}, { get: (_t, prop) => String(prop) }),
}))

vi.mock('@/components/ui/Icon', () => ({
  default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}))

// ---------------------------------------------------------------------------
// Component import (after mocks)
// ---------------------------------------------------------------------------
import WorkspaceManageModal from '@/components/board/WorkspaceManageModal'
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
  mockPost.mockResolvedValue({ userId: 'u-3', displayName: 'Carol', email: 'carol@example.com', role: 'MEMBER', joinedAt: '' })
  mockDelete.mockResolvedValue(undefined)
})

afterEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// TC-1: Members list renders when modal opens
// ---------------------------------------------------------------------------
describe('TC-1: Members list renders when modal opens', () => {
  it('calls GET /api/v1/workspaces/{id}/members and displays member rows', async () => {
    renderModal()

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/api/v1/workspaces/ws-1/members')
    })

    expect(await screen.findByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TC-2: Add member form — submit email calls api.post and member appears
// ---------------------------------------------------------------------------
describe('TC-2: Add member form submits and updates list', () => {
  it('calls POST /api/v1/workspaces/{id}/members and shows new member', async () => {
    renderModal()

    // Wait for initial load
    await screen.findByText('Alice')

    const emailInput = screen.getByPlaceholderText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'carol@example.com' } })

    const addBtn = screen.getByRole('button', { name: /add member/i })
    await act(async () => { fireEvent.click(addBtn) })

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        '/api/v1/workspaces/ws-1/members',
        { email: 'carol@example.com' }
      )
    })

    expect(await screen.findByText('Carol')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TC-3: Remove button calls api.delete and removes row
// ---------------------------------------------------------------------------
describe('TC-3: Remove button calls DELETE and removes member row', () => {
  it('calls DELETE /api/v1/workspaces/{id}/members/{userId} and removes row', async () => {
    renderModal()

    await screen.findByText('Bob')

    // Bob is u-2; find his remove button via aria-label
    const removeBtn = screen.getByRole('button', { name: /remove bob/i })
    await act(async () => { fireEvent.click(removeBtn) })

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('/api/v1/workspaces/ws-1/members/u-2')
    })

    await waitFor(() => {
      expect(screen.queryByText('Bob')).not.toBeInTheDocument()
    })
  })
})

// ---------------------------------------------------------------------------
// TC-4: Non-OWNER/ADMIN sees remove buttons disabled
// ---------------------------------------------------------------------------
describe('TC-4: Non-OWNER/ADMIN role sees remove buttons disabled', () => {
  it('disables remove buttons for MEMBER role', async () => {
    renderModal('MEMBER')

    await screen.findByText('Bob')

    const removeBtns = screen.getAllByRole('button', { name: /remove/i })
    removeBtns.forEach(btn => {
      expect(btn).toBeDisabled()
    })
  })
})
