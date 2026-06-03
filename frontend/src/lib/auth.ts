const TOKEN_KEY = 'kanban_token'
const REFRESH_TOKEN_KEY = 'kanban_refresh_token'
const TOKEN_EXPIRY_KEY = 'kanban_token_expiry'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return getToken() !== null
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function clearRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function getTokenExpiry(): number | null {
  if (typeof window === 'undefined') return null
  const v = localStorage.getItem(TOKEN_EXPIRY_KEY)
  return v ? parseInt(v, 10) : null
}

export function setTokenExpiry(expiryMs: number): void {
  localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryMs))
}

export function clearTokenExpiry(): void {
  localStorage.removeItem(TOKEN_EXPIRY_KEY)
}
