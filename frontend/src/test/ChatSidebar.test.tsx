/**
 * test_plan:
 *   story_id: AGT-015
 *   framework: vitest + @testing-library/react
 *   tests:
 *     - id: TC-001  "renders nothing when isOpen=false"
 *     - id: TC-002  "renders heading when isOpen=true"
 *     - id: TC-003  "renders user messages from store"
 *     - id: TC-004  "renders assistant messages from store"
 *     - id: TC-005  "shows loading indicator when isLoading=true"
 *     - id: TC-006  "input value is controlled"
 *     - id: TC-007  "send button disabled when input is empty"
 *     - id: TC-008  "send button disabled when isLoading=true"
 *     - id: TC-009  "onSend called with trimmed input on submit"
 *     - id: TC-010  "input cleared after successful submit"
 *     - id: TC-011  "onSend NOT called for whitespace-only input"
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ChatSidebar from '@/components/board/ChatSidebar'
import { useAgentStore } from '@/store/agentStore'

beforeEach(() => {
  useAgentStore.setState({ messages: [], isLoading: false })
})

describe('ChatSidebar', () => {
  it('TC-001: renders nothing when isOpen=false', () => {
    const { container } = render(<ChatSidebar isOpen={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('TC-002: renders heading when isOpen=true', () => {
    render(<ChatSidebar isOpen={true} />)
    expect(screen.getByText('AI Assistant')).toBeInTheDocument()
  })

  it('TC-003: renders user messages from store', () => {
    useAgentStore.setState({
      messages: [{ role: 'user', content: 'Hello there' }],
    })
    render(<ChatSidebar isOpen={true} />)
    expect(screen.getByText('Hello there')).toBeInTheDocument()
  })

  it('TC-004: renders assistant messages from store', () => {
    useAgentStore.setState({
      messages: [{ role: 'assistant', content: 'How can I help?' }],
    })
    render(<ChatSidebar isOpen={true} />)
    expect(screen.getByText('How can I help?')).toBeInTheDocument()
  })

  it('TC-005: shows loading indicator when isLoading=true', () => {
    useAgentStore.setState({ isLoading: true })
    render(<ChatSidebar isOpen={true} />)
    expect(screen.getByText(/thinking/i)).toBeInTheDocument()
  })

  it('TC-006: input value is controlled', () => {
    render(<ChatSidebar isOpen={true} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'My question' } })
    expect((input as HTMLInputElement).value).toBe('My question')
  })

  it('TC-007: send button disabled when input is empty', () => {
    render(<ChatSidebar isOpen={true} />)
    const btn = screen.getByRole('button', { name: /send/i })
    expect(btn).toBeDisabled()
  })

  it('TC-008: send button disabled when isLoading=true', () => {
    useAgentStore.setState({ isLoading: true })
    render(<ChatSidebar isOpen={true} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'some text' } })
    const btn = screen.getByRole('button', { name: /send/i })
    expect(btn).toBeDisabled()
  })

  it('TC-009: onSend called with trimmed input on form submit', () => {
    const onSend = vi.fn()
    render(<ChatSidebar isOpen={true} onSend={onSend} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '  My task  ' } })
    fireEvent.submit(input.closest('form')!)
    expect(onSend).toHaveBeenCalledWith('My task')
  })

  it('TC-010: input cleared after submit', () => {
    render(<ChatSidebar isOpen={true} onSend={vi.fn()} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'hello' } })
    fireEvent.submit(input.closest('form')!)
    expect((input as HTMLInputElement).value).toBe('')
  })

  it('TC-011: onSend NOT called for whitespace-only input', () => {
    const onSend = vi.fn()
    render(<ChatSidebar isOpen={true} onSend={onSend} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.submit(input.closest('form')!)
    expect(onSend).not.toHaveBeenCalled()
  })
})
