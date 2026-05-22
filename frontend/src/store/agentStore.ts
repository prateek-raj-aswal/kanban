'use client'
import { create } from 'zustand'

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface AgentStore {
  messages: AgentMessage[]
  isLoading: boolean
  addMessage: (message: AgentMessage) => void
  setLoading: (loading: boolean) => void
  clearMessages: () => void
}

export const useAgentStore = create<AgentStore>((set) => ({
  messages: [],
  isLoading: false,

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),

  setLoading: (loading) => set({ isLoading: loading }),

  clearMessages: () => set({ messages: [] }),
}))
