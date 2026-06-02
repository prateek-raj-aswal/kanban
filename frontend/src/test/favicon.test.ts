/**
 * US-1201: Add app favicon and document head metadata
 *
 * TC-001 (AC-1): favicon.ico file must exist in frontend/public/
 * TC-002 (AC-1): layout.tsx metadata export must include an icons field
 *                referencing /favicon.ico
 * TC-003 (AC-2): favicon.ico is a valid, non-empty ICO file (binary magic header
 *                bytes 00 00 01 00) so Next.js will serve it with 200, not 404
 */

import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

// Resolve from this file (frontend/src/test/) up to frontend/, then into public/
// __dirname = frontend/src/test  →  ../.. = frontend/
const PUBLIC_DIR = path.resolve(__dirname, '..', '..', 'public')
const FAVICON_ICO = path.join(PUBLIC_DIR, 'favicon.ico')

describe('US-1201 favicon and document head metadata', () => {
  // TC-001 — AC-1
  it('TC-001: favicon.ico exists in frontend/public/', () => {
    expect(
      fs.existsSync(FAVICON_ICO),
      `Expected ${FAVICON_ICO} to exist but it does not`
    ).toBe(true)
  })

  // TC-002 — AC-1
  it('TC-002: layout.tsx metadata export contains an icons field pointing to /favicon.ico', async () => {
    const layoutModule = await import('@/app/layout')
    const { metadata } = layoutModule as { metadata: Record<string, unknown> }

    expect(metadata, 'layout.tsx must export a metadata object').toBeDefined()

    const icons = metadata.icons as { icon?: string } | undefined
    expect(icons, 'metadata.icons must be defined').toBeDefined()
    expect(
      (icons as { icon?: string }).icon,
      'metadata.icons.icon must reference /favicon.ico'
    ).toContain('favicon.ico')
  })

  // TC-003 — AC-2
  it('TC-003: favicon.ico has a valid ICO magic header (00 00 01 00) — not a zero-byte placeholder', () => {
    // An ICO file must start with the 4-byte magic: 00 00 01 00.
    // A zero-byte file or non-ICO asset would cause browsers to ignore it
    // and Next.js would still serve the file (no 404), but the browser tab
    // would show no icon. This test guards both the no-404 requirement and
    // the "tab shows icon" requirement from AC-1.
    const buf = fs.readFileSync(FAVICON_ICO)
    expect(buf.length, 'favicon.ico must not be empty').toBeGreaterThan(4)
    expect(buf[0], 'ICO magic byte 0').toBe(0x00)
    expect(buf[1], 'ICO magic byte 1').toBe(0x00)
    expect(buf[2], 'ICO magic byte 2 (type=1 for ICO)').toBe(0x01)
    expect(buf[3], 'ICO magic byte 3').toBe(0x00)
  })
})
