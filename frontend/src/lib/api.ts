import {
  getToken, setToken,
  getRefreshToken, setRefreshToken,
  getTokenExpiry, setTokenExpiry,
} from './auth'
import { useAuthStore } from '@/store/authStore'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string,
              public fields?: { field: string; message: string }[]) {
    super(message)
  }
}

// Shared promise so concurrent 401s share one refresh call, not N independent ones
let pendingRefresh: Promise<boolean> | null = null

async function attemptTokenRefresh(): Promise<boolean> {
  if (pendingRefresh) return pendingRefresh
  pendingRefresh = (async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return false
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (!res.ok) return false
      const data = await res.json()
      setToken(data.accessToken)
      setRefreshToken(data.refreshToken)
      setTokenExpiry(Date.now() + data.expiresIn * 1000)
      return true
    } catch {
      return false
    }
  })().finally(() => { pendingRefresh = null })
  return pendingRefresh
}

function isTokenNearExpiry(): boolean {
  const expiry = getTokenExpiry()
  if (!expiry) return false
  return Date.now() >= expiry - 60_000
}

async function request<T>(path: string, init?: RequestInit, skipContentType = false, _retried = false): Promise<T> {
  const isAuthPath = path.startsWith('/api/v1/auth/')

  // Proactive pre-expiry refresh before sending the request
  if (!isAuthPath && !_retried && isTokenNearExpiry()) {
    await attemptTokenRefresh()
  }

  const token = getToken()
  const headers: Record<string, string> = {
    ...(!skipContentType ? { 'Content-Type': 'application/json' } : {}),
    ...(init?.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  if (!res.ok) {
    if (res.status === 401 && isAuthPath) {
      const body = await res.json().catch(() => ({}))
      throw new ApiError(401, 'UNAUTHORIZED', body.error ?? 'Invalid email or password')
    }
    if (res.status === 401 && !_retried) {
      const refreshed = await attemptTokenRefresh()
      if (refreshed) {
        return request<T>(path, init, skipContentType, true)
      }
    }
    if (res.status === 401) {
      // Refresh failed or already retried — clear state and redirect to login
      useAuthStore.getState().logout()
      window.dispatchEvent(new CustomEvent('kanban:unauthorized'))
      throw new ApiError(401, 'UNAUTHORIZED', 'Session expired')
    }
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.code ?? 'UNKNOWN', body.error ?? 'Request failed', body.fields)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  postForm: <T>(path: string, form: FormData) =>
    request<T>(path, { method: 'POST', body: form }, true),
  get: <T>(path: string) =>
    request<T>(path, { method: 'GET' }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
}
