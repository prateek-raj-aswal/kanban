import { describe, it, expect, beforeEach } from 'vitest'

// Mock localStorage before importing the store
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v },
    removeItem: (k: string) => { delete store[k] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true })
Object.defineProperty(global, 'window', { value: global, writable: true })

import { useAuthStore } from '@/store/authStore'

describe('authStore', () => {
  beforeEach(() => {
    localStorageMock.clear()
    useAuthStore.setState({ token: null, refreshToken: null })
  })

  it('starts with null token', () => {
    expect(useAuthStore.getState().token).toBeNull()
  })

  it('isAuthenticated returns false with no token', () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false)
  })

  it('setToken stores token in state and localStorage', () => {
    useAuthStore.getState().setToken('abc.def.ghi')
    expect(useAuthStore.getState().token).toBe('abc.def.ghi')
    expect(localStorageMock.getItem('kanban_token')).toBe('abc.def.ghi')
  })

  it('isAuthenticated returns true after setToken', () => {
    useAuthStore.getState().setToken('abc.def.ghi')
    expect(useAuthStore.getState().isAuthenticated()).toBe(true)
  })

  it('logout clears token from state and localStorage', () => {
    useAuthStore.getState().setToken('abc.def.ghi')
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().token).toBeNull()
    expect(localStorageMock.getItem('kanban_token')).toBeNull()
    expect(useAuthStore.getState().isAuthenticated()).toBe(false)
  })

  it('setTokenPair stores access + refresh tokens and expiry', () => {
    useAuthStore.getState().setTokenPair('access.jwt', 'refresh-uuid', 900)
    expect(useAuthStore.getState().token).toBe('access.jwt')
    expect(useAuthStore.getState().refreshToken).toBe('refresh-uuid')
    expect(localStorageMock.getItem('kanban_token')).toBe('access.jwt')
    expect(localStorageMock.getItem('kanban_refresh_token')).toBe('refresh-uuid')
  })

  it('logout clears both tokens and refresh token from localStorage', () => {
    useAuthStore.getState().setTokenPair('access.jwt', 'refresh-uuid', 900)
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().refreshToken).toBeNull()
    expect(localStorageMock.getItem('kanban_token')).toBeNull()
    expect(localStorageMock.getItem('kanban_refresh_token')).toBeNull()
  })
})
