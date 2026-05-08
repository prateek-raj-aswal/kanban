'use client'
import { create } from 'zustand'
import { getToken, setToken, clearToken } from '@/lib/auth'

interface AuthState {
  token: string | null
  setToken: (token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: typeof window !== 'undefined' ? getToken() : null,
  setToken: (token) => {
    setToken(token)
    set({ token })
  },
  logout: () => {
    clearToken()
    set({ token: null })
  },
  isAuthenticated: () => get().token !== null,
}))
