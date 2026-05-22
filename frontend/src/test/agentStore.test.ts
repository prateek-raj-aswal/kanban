import { describe, it, expect, beforeEach } from 'vitest'
import { useAgentStore } from '@/store/agentStore'

describe('agentStore', () => {
  beforeEach(() => {
    useAgentStore.setState({ messages: [], isLoading: false })
  })

  it('starts with empty messages and isLoading false', () => {
    const state = useAgentStore.getState()
    expect(state.messages).toEqual([])
    expect(state.isLoading).toBe(false)
  })

  it('addMessage appends a user message to the end', () => {
    useAgentStore.getState().addMessage({ role: 'user', content: 'hello' })
    const { messages } = useAgentStore.getState()
    expect(messages).toHaveLength(1)
    expect(messages[0]).toEqual({ role: 'user', content: 'hello' })
  })

  it('addMessage appends multiple messages in order', () => {
    useAgentStore.getState().addMessage({ role: 'user', content: 'hello' })
    useAgentStore.getState().addMessage({ role: 'assistant', content: 'hi' })
    useAgentStore.getState().addMessage({ role: 'user', content: 'how are you?' })
    const { messages } = useAgentStore.getState()
    expect(messages).toHaveLength(3)
    expect(messages[2].content).toBe('how are you?')
  })

  it('setLoading(true) sets isLoading to true', () => {
    useAgentStore.getState().setLoading(true)
    expect(useAgentStore.getState().isLoading).toBe(true)
  })

  it('setLoading(false) sets isLoading back to false', () => {
    useAgentStore.getState().setLoading(true)
    useAgentStore.getState().setLoading(false)
    expect(useAgentStore.getState().isLoading).toBe(false)
  })

  it('clearMessages resets messages to empty array', () => {
    useAgentStore.getState().addMessage({ role: 'user', content: 'a' })
    useAgentStore.getState().addMessage({ role: 'assistant', content: 'b' })
    useAgentStore.getState().addMessage({ role: 'user', content: 'c' })
    useAgentStore.getState().clearMessages()
    expect(useAgentStore.getState().messages).toEqual([])
  })

  it('clearMessages does not affect isLoading', () => {
    useAgentStore.getState().setLoading(true)
    useAgentStore.getState().clearMessages()
    expect(useAgentStore.getState().isLoading).toBe(true)
  })
})
