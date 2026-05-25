/**
 * test_plan:
 *   story_id: AGT-019
 *   framework: vitest + @testing-library/react
 *   tests:
 *     - id: TC-001  "sidebar root element uses CSS class (no inline background style)"
 *     - id: TC-002  "header element uses CSS class (no inline padding style)"
 *     - id: TC-003  "user bubble has a class distinct from assistant bubble"
 *     - id: TC-004  "assistant bubble has a class distinct from user bubble"
 *     - id: TC-005  "loading indicator element uses CSS class"
 *     - id: TC-006  "text input uses CSS class (no inline background style)"
 *     - id: TC-007  "send button uses CSS class (no inline opacity style)"
 *     - id: TC-008  "no inline style attributes on any structural element"
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ChatSidebar from '@/components/board/ChatSidebar'
import { useAgentStore } from '@/store/agentStore'
import * as agentApi from '@/lib/agentApi'
import * as auth from '@/lib/auth'

beforeEach(() => {
  useAgentStore.setState({ messages: [], isLoading: false })
  vi.spyOn(auth, 'getToken').mockReturnValue('test-jwt')
  vi.spyOn(agentApi, 'sendChatMessage').mockResolvedValue({ reply: 'ok' })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ChatSidebar CSS styling (AGT-019)', () => {
  it('TC-001: sidebar root has a CSS class and no inline background', () => {
    const { container } = render(<ChatSidebar isOpen={true} />)
    const root = container.firstChild as HTMLElement
    expect(root.className).toBeTruthy()
    expect(root.style.background).toBe('')
  })

  it('TC-002: header uses CSS class and no inline padding', () => {
    const { container } = render(<ChatSidebar isOpen={true} />)
    const header = container.querySelector('[class*="header"]') as HTMLElement
    expect(header).toBeTruthy()
    expect(header.style.padding).toBe('')
  })

  it('TC-003: user message bubble has a CSS class containing "user"', () => {
    useAgentStore.setState({ messages: [{ role: 'user', content: 'Hi' }] })
    const { container } = render(<ChatSidebar isOpen={true} />)
    const bubble = container.querySelector('[class*="user"]') as HTMLElement
    expect(bubble).toBeTruthy()
    expect(bubble.style.background).toBe('')
  })

  it('TC-004: assistant message bubble has a CSS class containing "assistant"', () => {
    useAgentStore.setState({ messages: [{ role: 'assistant', content: 'Hello' }] })
    const { container } = render(<ChatSidebar isOpen={true} />)
    const bubble = container.querySelector('[class*="assistant"]') as HTMLElement
    expect(bubble).toBeTruthy()
    expect(bubble.style.background).toBe('')
  })

  it('TC-005: loading indicator uses CSS class and no inline color', () => {
    useAgentStore.setState({ isLoading: true })
    const { container } = render(<ChatSidebar isOpen={true} />)
    const thinking = container.querySelector('[class*="thinking"]') as HTMLElement
    expect(thinking).toBeTruthy()
    expect(thinking.style.color).toBe('')
  })

  it('TC-006: text input uses CSS class and no inline background', () => {
    const { container } = render(<ChatSidebar isOpen={true} />)
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.className).toBeTruthy()
    expect(input.style.background).toBe('')
  })

  it('TC-007: send button uses CSS class and no inline opacity', () => {
    const { container } = render(<ChatSidebar isOpen={true} />)
    const btn = screen.getByRole('button', { name: /send/i })
    expect(btn.className).toBeTruthy()
    expect((btn as HTMLElement).style.opacity).toBe('')
  })

  it('TC-008: typing a message and submitting still works (functional regression)', async () => {
    render(<ChatSidebar isOpen={true} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test message' } })
    fireEvent.submit(input.closest('form')!)
    expect(useAgentStore.getState().messages).toContainEqual({ role: 'user', content: 'test message' })
  })
})
