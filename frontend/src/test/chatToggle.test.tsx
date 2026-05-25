/**
 * test_plan:
 *   story_id: AGT-018
 *   framework: vitest + @testing-library/react
 *   tests:
 *     - id: TC-001  "AI toggle button renders in the top bar"
 *     - id: TC-002  "clicking toggle mounts ChatSidebar (AI Assistant heading visible)"
 *     - id: TC-003  "clicking toggle again unmounts ChatSidebar"
 *     - id: TC-004  "toggle button reflects active state when chat is open"
 *     - id: TC-005  "ChatSidebar is absent on initial render"
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BoardView from '@/components/board/BoardView'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/boards/b1',
}))

vi.mock('@/components/board/Sidebar', () => ({
  default: () => null,
}))

vi.mock('@/lib/useIsMobile', () => ({
  useIsMobile: () => false,
}))

vi.mock('@/lib/websocket', () => ({
  subscribeToBoard: vi.fn().mockReturnValue(() => {}),
}))

vi.mock('@/lib/api', () => {
  const mockGet = vi.fn()
  return {
    api: { get: mockGet, post: vi.fn(), delete: vi.fn(), patch: vi.fn() },
    ApiError: class ApiError extends Error {},
  }
})

vi.mock('@/lib/agentApi', () => ({
  sendChatMessage: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  getToken: vi.fn().mockReturnValue('test-jwt'),
}))

beforeEach(async () => {
  const { api } = await import('@/lib/api')
  vi.mocked(api.get).mockResolvedValue({ id: 'b1', name: 'Test Board', columns: [] })
})

describe('AI chat toggle (AGT-018)', () => {
  it('TC-001: AI toggle button renders in the top bar', () => {
    render(<BoardView boardId="b1" />)
    expect(screen.getByRole('button', { name: 'AI chat' })).toBeInTheDocument()
  })

  it('TC-002: clicking toggle mounts ChatSidebar', () => {
    render(<BoardView boardId="b1" />)
    expect(screen.queryByText('AI Assistant')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'AI chat' }))
    expect(screen.getByText('AI Assistant')).toBeInTheDocument()
  })

  it('TC-003: clicking toggle again unmounts ChatSidebar', () => {
    render(<BoardView boardId="b1" />)
    const toggleBtn = screen.getByRole('button', { name: 'AI chat' })
    fireEvent.click(toggleBtn)
    expect(screen.getByText('AI Assistant')).toBeInTheDocument()
    fireEvent.click(toggleBtn)
    expect(screen.queryByText('AI Assistant')).toBeNull()
  })

  it('TC-004: toggle button aria-pressed reflects open state', () => {
    render(<BoardView boardId="b1" />)
    const btn = screen.getByRole('button', { name: 'AI chat' })
    expect(btn).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-pressed', 'true')
  })

  it('TC-005: ChatSidebar is absent on initial render', () => {
    render(<BoardView boardId="b1" />)
    expect(screen.queryByText('AI Assistant')).toBeNull()
  })
})
