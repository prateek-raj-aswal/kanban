/**
 * test_plan:
 *   story_id: US-1210
 *   framework: vitest + jsdom
 *   tests:
 *     - TC-S01: 401 on protected endpoint + valid refresh → refresh called → original retried
 *     - TC-S02: 401 on protected endpoint + no refresh token → unauthorized dispatched
 *     - TC-S03: 401 on protected endpoint + refresh call fails → unauthorized dispatched
 *     - TC-S04: 401 on /api/v1/auth/login → no refresh attempt (auth paths excluded)
 *     - TC-S05: already-retried request → no second refresh (loop prevention)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// localStorage mock — must be set before importing api/auth modules
// ---------------------------------------------------------------------------
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
Object.defineProperty(global, 'window', { value: { ...global, dispatchEvent: vi.fn() }, writable: true })

import { setToken, clearToken, setRefreshToken, clearRefreshToken } from '@/lib/auth'
import { api, ApiError } from '@/lib/api'

const mockFetch = vi.fn()
global.fetch = mockFetch

function okJson(data: object) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
  } as Response)
}

function errorResponse(status: number) {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ error: 'err', code: 'ERR' }),
  } as Response)
}

function noContentResponse() {
  return Promise.resolve({ ok: true, status: 204, json: () => Promise.resolve({}) } as Response)
}

beforeEach(() => {
  localStorageMock.clear()
  mockFetch.mockReset()
  vi.mocked(window.dispatchEvent).mockReset?.()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// TC-S01: 401 on protected endpoint + valid refresh → refresh + retry succeeds
// ---------------------------------------------------------------------------
describe('TC-S01: silent refresh on 401', () => {
  it('retries the original request with the new access token after a successful refresh', async () => {
    setToken('expired-access')
    setRefreshToken('valid-refresh-token')

    // First call → 401; refresh call → 200 with new tokens; retry call → 200 with data
    mockFetch
      .mockResolvedValueOnce(errorResponse(401))           // original request fails
      .mockResolvedValueOnce(okJson({                       // /auth/refresh succeeds
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        tokenType: 'Bearer',
        expiresIn: 900,
      }))
      .mockResolvedValueOnce(okJson({ id: '1', name: 'Board' })) // retry succeeds

    const result = await api.get('/api/v1/boards')

    expect(mockFetch).toHaveBeenCalledTimes(3)
    // Second call must be to /auth/refresh
    expect(mockFetch.mock.calls[1][0]).toContain('/api/v1/auth/refresh')
    // Third call must include new Authorization header
    const retryHeaders = mockFetch.mock.calls[2][1]?.headers as Record<string, string>
    expect(retryHeaders['Authorization']).toBe('Bearer new-access')
    expect(result).toEqual({ id: '1', name: 'Board' })
  })
})

// ---------------------------------------------------------------------------
// TC-S02: 401 on protected endpoint + no refresh token → dispatch unauthorized
// ---------------------------------------------------------------------------
describe('TC-S02: no refresh token → unauthorized event', () => {
  it('clears token and dispatches kanban:unauthorized when no refresh token exists', async () => {
    setToken('some-access')
    clearRefreshToken()

    mockFetch.mockResolvedValueOnce(errorResponse(401))

    await expect(api.get('/api/v1/boards')).rejects.toThrow(ApiError)
    expect(mockFetch).toHaveBeenCalledTimes(1) // no retry
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'kanban:unauthorized' })
    )
  })
})

// ---------------------------------------------------------------------------
// TC-S03: 401 + refresh call fails → dispatch unauthorized, no retry
// ---------------------------------------------------------------------------
describe('TC-S03: refresh call fails → unauthorized event', () => {
  it('dispatches kanban:unauthorized when the /auth/refresh call itself returns non-ok', async () => {
    setToken('expired-access')
    setRefreshToken('stale-refresh')

    mockFetch
      .mockResolvedValueOnce(errorResponse(401))   // original fails
      .mockResolvedValueOnce(errorResponse(401))   // refresh also fails

    await expect(api.get('/api/v1/boards')).rejects.toThrow(ApiError)
    expect(mockFetch).toHaveBeenCalledTimes(2) // original + refresh attempt
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'kanban:unauthorized' })
    )
  })
})

// ---------------------------------------------------------------------------
// TC-S04: 401 on auth paths → no refresh attempt
// ---------------------------------------------------------------------------
describe('TC-S04: 401 on auth endpoint is not treated as session expiry', () => {
  it('does not attempt refresh when path starts with /api/v1/auth/', async () => {
    setRefreshToken('some-refresh')

    mockFetch.mockResolvedValueOnce(errorResponse(401))

    await expect(api.post('/api/v1/auth/login', {})).rejects.toThrow(ApiError)
    expect(mockFetch).toHaveBeenCalledTimes(1) // no refresh call
    expect(window.dispatchEvent).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// TC-S05: loop prevention — retry that gets another 401 does NOT refresh again
// ---------------------------------------------------------------------------
describe('TC-S05: retry that gets another 401 does not trigger a second refresh', () => {
  it('fetches exactly 3 times (original + refresh + retry) then dispatches unauthorized', async () => {
    setToken('expired-access')
    setRefreshToken('valid-refresh-token')

    mockFetch
      .mockResolvedValueOnce(errorResponse(401))   // original → 401
      .mockResolvedValueOnce(okJson({               // /auth/refresh → succeeds
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        tokenType: 'Bearer',
        expiresIn: 900,
      }))
      .mockResolvedValueOnce(errorResponse(401))   // retry → 401 again (server revoked)

    await expect(api.get('/api/v1/boards')).rejects.toThrow(ApiError)

    expect(mockFetch).toHaveBeenCalledTimes(3) // no 4th fetch (no second refresh)
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'kanban:unauthorized' })
    )
  })
})
