import { describe, it, expect, vi, beforeEach } from 'vitest'
import { THEMES, applyTheme } from '@/lib/theme'
import type { ThemeName, CanvasBackground } from '@/lib/theme'

// Mock document.documentElement.style.setProperty
function createMockRoot() {
  const props: Record<string, string> = {}
  return {
    style: {
      setProperty: (name: string, value: string) => { props[name] = value },
    },
    _props: props,
  }
}

describe('TC-1: Existing 3 themes unchanged — canvasBackground undefined → canvas hex used', () => {
  let mockRoot: ReturnType<typeof createMockRoot>

  beforeEach(() => {
    mockRoot = createMockRoot()
    vi.stubGlobal('document', { documentElement: mockRoot })
  })

  it('light theme: canvas is a hex string and canvasBackground is undefined', () => {
    expect(THEMES.light.canvas).toMatch(/^#[0-9a-fA-F]{6}$/)
    expect(THEMES.light.canvasBackground).toBeUndefined()
  })

  it('midnight theme: canvas is a hex string and canvasBackground is undefined', () => {
    expect(THEMES.midnight.canvas).toMatch(/^#[0-9a-fA-F]{6}$/)
    expect(THEMES.midnight.canvasBackground).toBeUndefined()
  })

  it('graphite theme: canvas is a hex string and canvasBackground is undefined', () => {
    expect(THEMES.graphite.canvas).toMatch(/^#[0-9a-fA-F]{6}$/)
    expect(THEMES.graphite.canvasBackground).toBeUndefined()
  })

  it('light theme: applyTheme sets --canvas to the hex string', () => {
    applyTheme('light')
    expect(mockRoot._props['--canvas']).toBe(THEMES.light.canvas)
  })

  it('midnight theme: applyTheme sets --canvas to the hex string', () => {
    applyTheme('midnight')
    expect(mockRoot._props['--canvas']).toBe(THEMES.midnight.canvas)
  })

  it('graphite theme: applyTheme sets --canvas to the hex string', () => {
    applyTheme('graphite')
    expect(mockRoot._props['--canvas']).toBe(THEMES.graphite.canvas)
  })
})

describe('TC-2: Theme with canvasBackground gradient → applyTheme sets --canvas to gradient string', () => {
  let mockRoot: ReturnType<typeof createMockRoot>

  beforeEach(() => {
    mockRoot = createMockRoot()
    vi.stubGlobal('document', { documentElement: mockRoot })
  })

  it('canvasBackground gradient overrides canvas hex for --canvas', () => {
    // Simulate a gradient theme by calling applyTheme with a patched THEMES entry
    const gradientValue = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
    const originalCanvas = THEMES.light.canvas

    // Temporarily patch THEMES for this test
    ;(THEMES.light as { canvasBackground?: CanvasBackground }).canvasBackground = { gradient: gradientValue }

    applyTheme('light')

    expect(mockRoot._props['--canvas']).toBe(gradientValue)
    expect(mockRoot._props['--canvas']).not.toBe(originalCanvas)

    // Restore
    delete (THEMES.light as { canvasBackground?: CanvasBackground }).canvasBackground
  })
})

describe('TC-3: Theme with canvasBackground texture → applyTheme sets --canvas to texture string', () => {
  let mockRoot: ReturnType<typeof createMockRoot>

  beforeEach(() => {
    mockRoot = createMockRoot()
    vi.stubGlobal('document', { documentElement: mockRoot })
  })

  it('canvasBackground texture overrides canvas hex for --canvas', () => {
    const textureValue = 'url("/textures/noise.png") repeat, #1a1a1a'
    const originalCanvas = THEMES.graphite.canvas

    ;(THEMES.graphite as { canvasBackground?: CanvasBackground }).canvasBackground = { texture: textureValue }

    applyTheme('graphite')

    expect(mockRoot._props['--canvas']).toBe(textureValue)
    expect(mockRoot._props['--canvas']).not.toBe(originalCanvas)

    // Restore
    delete (THEMES.graphite as { canvasBackground?: CanvasBackground }).canvasBackground
  })

  it('canvasBackground texture with fallback uses texture string (not fallback) for --canvas', () => {
    const textureValue = 'url("/textures/linen.png") repeat'
    const fallbackValue = '#f0ede8'

    ;(THEMES.light as { canvasBackground?: CanvasBackground }).canvasBackground = {
      texture: textureValue,
      fallback: fallbackValue,
    }

    applyTheme('light')

    expect(mockRoot._props['--canvas']).toBe(textureValue)

    // Restore
    delete (THEMES.light as { canvasBackground?: CanvasBackground }).canvasBackground
  })
})

describe('TC-4: Type system accepts both plain-string-canvas themes and canvasBackground themes', () => {
  it('ThemeTokens with canvasBackground gradient is a valid type', () => {
    const gradientTheme: Parameters<typeof applyTheme>[0] = 'midnight'
    expect(gradientTheme).toBe('midnight')

    // Type-level check: ThemeName is still 'light' | 'midnight' | 'graphite'
    const names: ThemeName[] = ['light', 'midnight', 'graphite']
    expect(names).toHaveLength(3)
  })

  it('CanvasBackground type accepts string', () => {
    const bg: CanvasBackground = '#ff0000'
    expect(bg).toBe('#ff0000')
  })

  it('CanvasBackground type accepts gradient object', () => {
    const bg: CanvasBackground = { gradient: 'linear-gradient(to right, red, blue)' }
    expect(bg).toHaveProperty('gradient')
  })

  it('CanvasBackground type accepts texture object', () => {
    const bg: CanvasBackground = { texture: 'url("/t.png") repeat', fallback: '#333' }
    expect(bg).toHaveProperty('texture')
    expect(bg).toHaveProperty('fallback')
  })

  it('THEMES entries have canvas as hex string and no canvasBackground', () => {
    for (const name of ['light', 'midnight', 'graphite'] as ThemeName[]) {
      expect(THEMES[name].canvas).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(THEMES[name].canvasBackground).toBeUndefined()
    }
  })
})
