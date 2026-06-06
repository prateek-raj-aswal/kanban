/**
 * Shared helpers for all e2e specs.
 * Relies on the three seeded test users created during the workspace verification run.
 * If they don't exist they are created idempotently via the REST API.
 */
import { Page, request } from '@playwright/test'

const API = 'http://localhost:8080/api/v1'

export const USERS = {
  owner:  { email: 'owner@acme.com',    password: 'Owner1234!', name: 'Alice (Org Owner)' },
  member: { email: 'prateek@example.com', password: 'User1234!',  name: 'Prateek (Team Member)' },
  viewer: { email: 'viewer@example.com', password: 'View1234!',  name: 'Sam (Viewer)' },
}

// ---------------------------------------------------------------------------
// API helpers (Node fetch, not browser)
// ---------------------------------------------------------------------------
async function apiFetch(path: string, opts: RequestInit = {}) {
  const resp = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers ?? {}) },
    ...opts,
  })
  const text = await resp.text()
  try { return JSON.parse(text) } catch { return text }
}

export async function apiLogin(email: string, password: string): Promise<string> {
  const r = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  return r.accessToken as string
}

async function apiRegisterIfMissing(email: string, password: string, displayName: string) {
  const loginR = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  if (loginR.accessToken) return
  await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, displayName }) })
}

/** Resolve a user's UUID by logging in and decoding the JWT subject */
async function getUserId(email: string, password: string): Promise<string> {
  const token = await apiLogin(email, password)
  // JWT payload is base64url — convert to standard base64 then decode
  const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  const payload = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'))
  return payload.sub as string
}

/** Ensure all test users and the Acme Corp workspace exist. Returns { ws1Id, ws2Id, akmeBoardId } */
export async function seedTestData() {
  for (const u of Object.values(USERS)) {
    await apiRegisterIfMissing(u.email, u.password, u.name)
  }

  const ownerToken = await apiLogin(USERS.owner.email, USERS.owner.password)
  const auth = (path: string, opts: RequestInit = {}) =>
    apiFetch(path, { ...opts, headers: { Authorization: `Bearer ${ownerToken}`, 'Content-Type': 'application/json', ...(opts.headers ?? {}) } })

  // Resolve member and viewer userIds (needed by addMember API which expects userId, not email)
  const [memberUserId, viewerUserId] = await Promise.all([
    getUserId(USERS.member.email, USERS.member.password),
    getUserId(USERS.viewer.email, USERS.viewer.password),
  ])

  const workspaces: { id: string; name: string }[] = await auth('/workspaces')
  let ws1 = workspaces.find(w => w.name === 'Acme Corp')
  let ws2 = workspaces.find(w => w.name === 'Personal Projects')

  if (!ws1) {
    ws1 = await auth('/workspaces', { method: 'POST', body: JSON.stringify({ name: 'Acme Corp' }) })
  }
  if (!ws2) {
    ws2 = await auth('/workspaces', { method: 'POST', body: JSON.stringify({ name: 'Personal Projects' }) })
  }

  // Always ensure member and viewer are in Acme Corp (idempotent — 4xx ignored)
  // Note: old Docker backend may not accept role:'VIEWER' — use MEMBER as fallback so tests run.
  // After rebuild, role can be changed back to VIEWER for the viewer user.
  const acmeMembers: { userId: string }[] = await auth(`/workspaces/${ws1!.id}/members`)
  const memberIds = Array.isArray(acmeMembers) ? acmeMembers.map(m => m.userId) : []
  if (!memberIds.includes(memberUserId)) {
    await auth(`/workspaces/${ws1!.id}/members`, { method: 'POST', body: JSON.stringify({ userId: memberUserId, role: 'MEMBER' }) }).catch(() => {})
  }
  if (!memberIds.includes(viewerUserId)) {
    const addViewer = await auth(`/workspaces/${ws1!.id}/members`, { method: 'POST', body: JSON.stringify({ userId: viewerUserId, role: 'VIEWER' }) })
    // Fall back to MEMBER if VIEWER role is unsupported in current build
    if (typeof addViewer === 'object' && (addViewer as any).error) {
      await auth(`/workspaces/${ws1!.id}/members`, { method: 'POST', body: JSON.stringify({ userId: viewerUserId, role: 'MEMBER' }) }).catch(() => {})
    }
  }

  const boards: { id: string; name: string; workspaceId: string }[] = await auth('/boards')
  let acmeBoard = boards.find(b => b.workspaceId === ws1!.id && b.name === 'Product Roadmap')
  if (!acmeBoard) {
    acmeBoard = await auth('/boards', { method: 'POST', body: JSON.stringify({ name: 'Product Roadmap', workspaceId: ws1!.id }) })
    await auth('/boards', { method: 'POST', body: JSON.stringify({ name: 'Sprint Planning', workspaceId: ws1!.id }) })
  }
  let personalBoard = boards.find(b => b.workspaceId === ws2!.id)
  if (!personalBoard) {
    personalBoard = await auth('/boards', { method: 'POST', body: JSON.stringify({ name: 'Personal Tasks', workspaceId: ws2!.id }) })
  }

  return { ws1Id: ws1!.id, ws2Id: ws2!.id, akmeBoardId: acmeBoard!.id }
}

// ---------------------------------------------------------------------------
// Browser helpers
// ---------------------------------------------------------------------------

/** Log in via the UI and set sidebar to expanded state */
export async function loginAs(page: Page, user: { email: string; password: string }) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  // Ensure sidebar starts expanded
  await page.evaluate(() => {
    localStorage.setItem('kanban_sidebar', JSON.stringify({ state: { collapsed: false }, version: 0 }))
  })
  await page.locator('input[type="email"]').fill(user.email)
  await page.locator('input[type="password"]').fill(user.password)
  await page.locator('button[type="submit"]').click()
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(800)
}

/** Navigate to a board and ensure the sidebar is visible/expanded */
export async function gotoBoard(page: Page, boardId: string) {
  await page.goto(`/boards/${boardId}`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1200)
  // Expand sidebar if collapsed
  const expandBtn = page.locator('button[aria-label="Expand sidebar"]')
  if (await expandBtn.count() > 0) {
    await expandBtn.click()
    await page.waitForTimeout(300)
  }
}

/** Open the workspace switcher dropdown */
export async function openWorkspaceSwitcher(page: Page) {
  const btn = page.locator('button').filter({ hasText: /workspaces?/i }).first()
  await btn.waitFor({ state: 'visible', timeout: 10000 })
  await btn.click()
  await page.waitForTimeout(400)
}
