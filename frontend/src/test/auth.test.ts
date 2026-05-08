import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getToken, setToken, clearToken, isAuthenticated } from '@/lib/auth'

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

describe('auth lib', () => {
  beforeEach(() => localStorageMock.clear())

  it('getToken returns null when no token stored', () => {
    expect(getToken()).toBeNull()
  })

  it('setToken stores token and getToken retrieves it', () => {
    setToken('my.jwt.token')
    expect(getToken()).toBe('my.jwt.token')
  })

  it('clearToken removes the stored token', () => {
    setToken('my.jwt.token')
    clearToken()
    expect(getToken()).toBeNull()
  })

  it('isAuthenticated returns false when no token', () => {
    expect(isAuthenticated()).toBe(false)
  })

  it('isAuthenticated returns true when token is set', () => {
    setToken('my.jwt.token')
    expect(isAuthenticated()).toBe(true)
  })
})
