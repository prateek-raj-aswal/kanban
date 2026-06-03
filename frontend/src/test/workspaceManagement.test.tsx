/**
 * test_plan:
 *   story_id: US-1303
 *   framework: vitest + @testing-library/react
 *   tests:
 *     - id: TC-1
 *       file: "src/test/workspaceManagement.test.tsx"
 *       maps_to_ac: "AC-1: Manage workspace modal shows workspace name"
 *       type: acceptance
 *     - id: TC-2
 *       file: "src/test/workspaceManagement.test.tsx"
 *       maps_to_ac: "AC-2: Owner sees rename input and delete button enabled"
 *       type: acceptance
 *     - id: TC-3
 *       file: "src/test/workspaceManagement.test.tsx"
 *       maps_to_ac: "AC-2: Non-owner sees rename/delete controls disabled"
 *       type: acceptance
 *     - id: TC-4
 *       file: "src/test/workspaceManagement.test.tsx"
 *       maps_to_ac: "AC-1: Clicking delete calls api.delete('/api/v1/workspaces/{id}')"
 *       type: acceptance
 *     - id: TC-5
 *       file: "src/test/workspaceManagement.test.tsx"
 *       maps_to_ac: "AC-1: Submitting rename calls api.patch with new name"
 *       type: acceptance
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mock @/lib/api
// ---------------------------------------------------------------------------
const mockDelete = vi.fn().mockResolvedValue(undefined)
const mockPatch = vi.fn().mockResolvedValue({ id: 'ws-1', name: 'Renamed', ownerId: 'user-1', role: 'OWNER', createdAt: '' })
const mockPost = vi.fn().mockResolvedValue({ id: 'ws-new', name: 'New WS', ownerId: 'user-1', role: 'OWNER', createdAt: '' })

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue([]),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}))

// ---------------------------------------------------------------------------
// Mock @/lib/theme — return plain string tokens to avoid CSS-in-JS issues
// ---------------------------------------------------------------------------
vi.mock('@/lib/theme', () => ({
  T: new Proxy({}, { get: (_t, prop) => String(prop) }),
}))

// ---------------------------------------------------------------------------
// Mock @/components/ui/Icon
// ---------------------------------------------------------------------------
vi.mock('@/components/ui/Icon', () => ({
  default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}))

// ---------------------------------------------------------------------------
// Component import (after mocks)
// ---------------------------------------------------------------------------
import WorkspaceManageModal from '@/components/board/WorkspaceManageModal'
import type { WorkspaceResponse } from '@/types/api'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeWorkspace(role: string = 'OWNER'): WorkspaceResponse {
  return {
    id: 'ws-1',
    name: 'My Workspace',
    ownerId: 'user-1',
    role,
    createdAt: '2024-01-01T00:00:00Z',
  }
}

// ---------------------------------------------------------------------------
// Shared setup / teardown
// ---------------------------------------------------------------------------
beforeEach(() => {
  mockDelete.mockClear()
  mockPatch.mockClear()
  mockPost.mockClear()
})

afterEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// TC-1: Modal shows workspace name
// ---------------------------------------------------------------------------
describe('TC-1: Manage workspace modal shows workspace name', () => {
  it('displays the current workspace name in the modal', () => {
    const ws = makeWorkspace()
    render(
      <WorkspaceManageModal
        workspace={ws}
        onClose={vi.fn()}
        onUpdated={vi.fn()}
        onDeleted={vi.fn()}
      />
    )

    expect(screen.getByText('My Workspace')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TC-2: Owner sees rename input and delete button enabled
// ---------------------------------------------------------------------------
describe('TC-2: Owner sees rename input and delete button enabled', () => {
  it('shows an enabled rename input and enabled delete button for OWNER role', () => {
    const ws = makeWorkspace('OWNER')
    render(
      <WorkspaceManageModal
        workspace={ws}
        onClose={vi.fn()}
        onUpdated={vi.fn()}
        onDeleted={vi.fn()}
      />
    )

    const renameInput = screen.getByPlaceholderText(/workspace name/i)
    expect(renameInput).toBeInTheDocument()
    expect(renameInput).not.toBeDisabled()

    const deleteBtn = screen.getByRole('button', { name: /delete workspace/i })
    expect(deleteBtn).toBeInTheDocument()
    expect(deleteBtn).not.toBeDisabled()
  })
})

// ---------------------------------------------------------------------------
// TC-3: Non-owner sees rename/delete controls disabled
// ---------------------------------------------------------------------------
describe('TC-3: Non-owner sees rename/delete controls disabled', () => {
  it('disables rename input and delete button for MEMBER role', () => {
    const ws = makeWorkspace('MEMBER')
    render(
      <WorkspaceManageModal
        workspace={ws}
        onClose={vi.fn()}
        onUpdated={vi.fn()}
        onDeleted={vi.fn()}
      />
    )

    const renameInput = screen.getByPlaceholderText(/workspace name/i)
    expect(renameInput).toBeDisabled()

    const deleteBtn = screen.getByRole('button', { name: /delete workspace/i })
    expect(deleteBtn).toBeDisabled()
  })

  it('disables rename input and delete button for ADMIN role', () => {
    const ws = makeWorkspace('ADMIN')
    render(
      <WorkspaceManageModal
        workspace={ws}
        onClose={vi.fn()}
        onUpdated={vi.fn()}
        onDeleted={vi.fn()}
      />
    )

    const renameInput = screen.getByPlaceholderText(/workspace name/i)
    expect(renameInput).toBeDisabled()

    const deleteBtn = screen.getByRole('button', { name: /delete workspace/i })
    expect(deleteBtn).toBeDisabled()
  })
})

// ---------------------------------------------------------------------------
// TC-4: Clicking delete calls api.delete with workspace id
// ---------------------------------------------------------------------------
describe('TC-4: Clicking delete calls api.delete with workspace id', () => {
  it('calls api.delete("/api/v1/workspaces/ws-1") when delete is confirmed', async () => {
    const ws = makeWorkspace('OWNER')
    const onDeleted = vi.fn()

    render(
      <WorkspaceManageModal
        workspace={ws}
        onClose={vi.fn()}
        onUpdated={vi.fn()}
        onDeleted={onDeleted}
      />
    )

    const deleteBtn = screen.getByRole('button', { name: /delete workspace/i })
    fireEvent.click(deleteBtn)

    // Confirmation dialog should appear
    const confirmBtn = screen.getByRole('button', { name: /confirm delete/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('/api/v1/workspaces/ws-1')
    })

    await waitFor(() => {
      expect(onDeleted).toHaveBeenCalled()
    })
  })
})

// ---------------------------------------------------------------------------
// TC-5: Submitting rename calls api.patch with new name
// ---------------------------------------------------------------------------
describe('TC-5: Submitting rename calls api.patch with new name', () => {
  it('calls api.patch("/api/v1/workspaces/ws-1", { name }) when rename is submitted', async () => {
    const ws = makeWorkspace('OWNER')
    const onUpdated = vi.fn()

    render(
      <WorkspaceManageModal
        workspace={ws}
        onClose={vi.fn()}
        onUpdated={onUpdated}
        onDeleted={vi.fn()}
      />
    )

    const renameInput = screen.getByPlaceholderText(/workspace name/i)
    fireEvent.change(renameInput, { target: { value: 'Renamed Workspace' } })

    const saveBtn = screen.getByRole('button', { name: /save/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith(
        '/api/v1/workspaces/ws-1',
        { name: 'Renamed Workspace' }
      )
    })

    await waitFor(() => {
      expect(onUpdated).toHaveBeenCalled()
    })
  })
})
