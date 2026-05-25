/**
 * test_plan:
 *   story_id: AGT-017
 *   framework: vitest + @testing-library/react
 *   tests:
 *     - id: TC-001  "submitting adds user message to agentStore immediately"
 *     - id: TC-002  "sendChatMessage called with full message history and JWT"
 *     - id: TC-003  "on success, assistant reply added to agentStore"
 *     - id: TC-004  "isLoading is false after successful response"
 *     - id: TC-005  "on API error, error message added to store as assistant"
 *     - id: TC-006  "isLoading is false after API error"
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ChatSidebar from '@/components/board/ChatSidebar'
import { useAgentStore } from '@/store/agentStore'
import * as agentApi from '@/lib/agentApi'
import * as auth from '@/lib/auth'

beforeEach(() => {
  useAgentStore.setState({ messages: [], isLoading: false })
  vi.spyOn(auth, 'getToken').mockReturnValue('test-jwt')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ChatSidebar send handler (AGT-017)', () => {
  it('TC-001: submitting adds user message to agentStore immediately', () => {
    vi.spyOn(agentApi, 'sendChatMessage').mockResolvedValue({ reply: 'ok' })
    render(<ChatSidebar isOpen={true} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Move card to done' } })
    fireEvent.submit(input.closest('form')!)
    expect(useAgentStore.getState().messages).toContainEqual({ role: 'user', content: 'Move card to done' })
  })

  it('TC-002: sendChatMessage called with message history and JWT', async () => {
    const spy = vi.spyOn(agentApi, 'sendChatMessage').mockResolvedValue({ reply: 'done' })
    render(<ChatSidebar isOpen={true} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'List boards' } })
    fireEvent.submit(input.closest('form')!)
    await waitFor(() => expect(spy).toHaveBeenCalledOnce())
    const [passedMessages, passedJwt] = spy.mock.calls[0]
    expect(passedMessages).toContainEqual({ role: 'user', content: 'List boards' })
    expect(passedJwt).toBe('test-jwt')
  })

  it('TC-003: on success, assistant reply is added to agentStore', async () => {
    vi.spyOn(agentApi, 'sendChatMessage').mockResolvedValue({ reply: 'You have 3 boards.' })
    render(<ChatSidebar isOpen={true} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'hello' } })
    fireEvent.submit(input.closest('form')!)
    await waitFor(() => {
      expect(useAgentStore.getState().messages).toContainEqual({ role: 'assistant', content: 'You have 3 boards.' })
    })
  })

  it('TC-004: isLoading is false after successful response', async () => {
    vi.spyOn(agentApi, 'sendChatMessage').mockResolvedValue({ reply: 'ok' })
    render(<ChatSidebar isOpen={true} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'hello' } })
    fireEvent.submit(input.closest('form')!)
    await waitFor(() => expect(useAgentStore.getState().isLoading).toBe(false))
    expect(useAgentStore.getState().messages).toHaveLength(2)
  })

  it('TC-005: on API error, generic error message added to store as assistant message', async () => {
    vi.spyOn(agentApi, 'sendChatMessage').mockRejectedValue(new Error('Agent service returned 503'))
    render(<ChatSidebar isOpen={true} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'hello' } })
    fireEvent.submit(input.closest('form')!)
    await waitFor(() => {
      const msgs = useAgentStore.getState().messages
      const last = msgs[msgs.length - 1]
      expect(last?.role).toBe('assistant')
      expect(last?.content).toMatch(/something went wrong/i)
    })
  })

  it('TC-006: isLoading is false after API error', async () => {
    vi.spyOn(agentApi, 'sendChatMessage').mockRejectedValue(new Error('network'))
    render(<ChatSidebar isOpen={true} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'hello' } })
    fireEvent.submit(input.closest('form')!)
    await waitFor(() => expect(useAgentStore.getState().isLoading).toBe(false))
  })

  it('TC-007: null JWT aborts the call and shows auth error in chat', () => {
    vi.spyOn(auth, 'getToken').mockReturnValue(null)
    const spy = vi.spyOn(agentApi, 'sendChatMessage')
    render(<ChatSidebar isOpen={true} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'hello' } })
    fireEvent.submit(input.closest('form')!)
    expect(spy).not.toHaveBeenCalled()
    expect(useAgentStore.getState().messages).toContainEqual({
      role: 'assistant',
      content: 'Error: Not authenticated. Please log in again.',
    })
  })
})
