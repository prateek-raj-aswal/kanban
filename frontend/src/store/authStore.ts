'use client'
import { create } from 'zustand'
import {
  getToken, setToken, clearToken,
  getRefreshToken, setRefreshToken, clearRefreshToken,
  setTokenExpiry, clearTokenExpiry,
} from '@/lib/auth'

interface AuthState {
  token: string | null
  refreshToken: string | null
  setToken: (token: string) => void
  setTokenPair: (accessToken: string, refreshToken: string, expiresIn: number) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: typeof window !== 'undefined' ? getToken() : null,
  refreshToken: typeof window !== 'undefined' ? getRefreshToken() : null,
  setToken: (token) => {
    setToken(token)
    set({ token })
  },
  setTokenPair: (accessToken, refreshToken, expiresIn) => {
    setToken(accessToken)
    setRefreshToken(refreshToken)
    setTokenExpiry(Date.now() + expiresIn * 1000)
    set({ token: accessToken, refreshToken })
  },
  logout: () => {
    clearToken()
    clearRefreshToken()
    clearTokenExpiry()
    set({ token: null, refreshToken: null })
  },
  isAuthenticated: () => get().token !== null,
}))
