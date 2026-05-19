import { getToken, clearToken } from './auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string,
              public fields?: { field: string; message: string }[]) {
    super(message)
  }
}

async function request<T>(path: string, init?: RequestInit, skipContentType = false): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    ...(!skipContentType ? { 'Content-Type': 'application/json' } : {}),
    ...(init?.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  if (!res.ok) {
    if (res.status === 401) {
      // Auth endpoints return 401 for wrong credentials — don't treat as expired session
      if (!path.startsWith('/api/v1/auth/')) {
        clearToken()
        window.dispatchEvent(new CustomEvent('kanban:unauthorized'))
      }
      const body = await res.json().catch(() => ({}))
      const msg = body.error ?? (path.startsWith('/api/v1/auth/') ? 'Invalid email or password' : 'Session expired')
      throw new ApiError(401, 'UNAUTHORIZED', msg)
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
