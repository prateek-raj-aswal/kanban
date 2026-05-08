import { getToken } from './auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string,
              public fields?: { field: string; message: string }[]) {
    super(message)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.code ?? 'UNKNOWN', body.error ?? 'Request failed', body.fields)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  get: <T>(path: string) =>
    request<T>(path, { method: 'GET' }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
}
