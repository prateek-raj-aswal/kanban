/**
 * test_plan:
 *   story_id: AGT-016
 *   framework: vitest + vi.fn (fetch mock)
 *   tests:
 *     - id: TC-001  "successful 200 response returns { reply } object"
 *     - id: TC-002  "POST request sent to AGENT_BASE/chat"
 *     - id: TC-003  "request body contains messages and jwt"
 *     - id: TC-004  "Content-Type: application/json header is set"
 *     - id: TC-005  "non-200 response throws Error with status code"
 *     - id: TC-006  "network failure propagates the thrown error"
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { sendChatMessage } from '@/lib/agentApi'

const JWT = 'test.jwt.token'
const MESSAGES = [
  { role: 'user' as const, content: 'List my boards' },
]

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('sendChatMessage', () => {
  it('TC-001: 200 response returns reply object', async () => {
    vi.stubGlobal('fetch', mockFetch(200, { reply: 'You have 2 boards.' }))

    const result = await sendChatMessage(MESSAGES, JWT)

    expect(result.reply).toBe('You have 2 boards.')
  })

  it('TC-002: POSTs to /chat endpoint on the agent base URL', async () => {
    const mockFn = mockFetch(200, { reply: 'ok' })
    vi.stubGlobal('fetch', mockFn)

    await sendChatMessage(MESSAGES, JWT)

    const [url] = mockFn.mock.calls[0]
    expect(url).toMatch(/\/chat$/)
    expect(mockFn.mock.calls[0][1].method).toBe('POST')
  })

  it('TC-003: request body contains messages array but not jwt', async () => {
    const mockFn = mockFetch(200, { reply: 'ok' })
    vi.stubGlobal('fetch', mockFn)

    await sendChatMessage(MESSAGES, JWT)

    const body = JSON.parse(mockFn.mock.calls[0][1].body)
    expect(body.messages).toEqual(MESSAGES)
    expect(body.jwt).toBeUndefined()
  })

  it('TC-004: Authorization Bearer header and Content-Type header are set', async () => {
    const mockFn = mockFetch(200, { reply: 'ok' })
    vi.stubGlobal('fetch', mockFn)

    await sendChatMessage(MESSAGES, JWT)

    const headers = mockFn.mock.calls[0][1].headers
    expect(headers['Content-Type']).toBe('application/json')
    expect(headers['Authorization']).toBe(`Bearer ${JWT}`)
  })

  it('TC-005: non-200 response throws Error containing status code', async () => {
    vi.stubGlobal('fetch', mockFetch(502, {}))

    await expect(sendChatMessage(MESSAGES, JWT)).rejects.toThrow('502')
  })

  it('TC-006: network failure propagates the error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(sendChatMessage(MESSAGES, JWT)).rejects.toThrow('Failed to fetch')
  })
})
