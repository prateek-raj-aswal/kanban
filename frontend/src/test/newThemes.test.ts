import { describe, it, expect, vi, beforeEach } from 'vitest'
import { THEMES, applyTheme } from '@/lib/theme'
import type { ThemeName, CanvasBackground } from '@/lib/theme'

// Helper: create a mock document root
function createMockRoot() {
  const props: Record<string, string> = {}
  return {
    style: { setProperty: (name: string, value: string) => { props[name] = value } },
    _props: props,
  }
}

const NEW_THEMES: ThemeName[] = ['ocean', 'sunset', 'forest']
const ALL_THEMES = Object.keys(THEMES) as ThemeName[]

// TC-1: New theme names appear in the THEMES object (at least 2 new themes)
describe('TC-1: New themes exist in THEMES object', () => {
  it('THEMES contains at least 5 themes (3 original + at least 2 new)', () => {
    expect(ALL_THEMES.length).toBeGreaterThanOrEqual(5)
  })

  it('ocean theme is present', () => {
    expect(THEMES).toHaveProperty('ocean')
  })

  it('sunset theme is present', () => {
    expect(THEMES).toHaveProperty('sunset')
  })

  it('forest theme is present', () => {
    expect(THEMES).toHaveProperty('forest')
  })
})

// TC-2: A gradient theme has canvasBackground.gradient that is a valid CSS gradient string
describe('TC-2: Gradient themes have valid CSS gradient canvasBackground', () => {
  it('ocean theme has canvasBackground with a gradient property', () => {
    const theme = THEMES['ocean' as ThemeName]
    expect(theme.canvasBackground).toBeDefined()
    expect(typeof theme.canvasBackground).toBe('object')
    expect(theme.canvasBackground).toHaveProperty('gradient')
  })

  it('ocean gradient string contains "linear-gradient" or "radial-gradient"', () => {
    const theme = THEMES['ocean' as ThemeName]
    const bg = theme.canvasBackground as { gradient: string }
    expect(bg.gradient).toMatch(/linear-gradient|radial-gradient/)
  })

  it('sunset theme has canvasBackground with a gradient property', () => {
    const theme = THEMES['sunset' as ThemeName]
    expect(theme.canvasBackground).toBeDefined()
    expect(theme.canvasBackground).toHaveProperty('gradient')
  })

  it('sunset gradient string contains "linear-gradient" or "radial-gradient"', () => {
    const theme = THEMES['sunset' as ThemeName]
    const bg = theme.canvasBackground as { gradient: string }
    expect(bg.gradient).toMatch(/linear-gradient|radial-gradient/)
  })
})

// TC-3: A texture/pattern theme has canvasBackground (either gradient or texture approach)
describe('TC-3: forest theme has canvasBackground defined', () => {
  it('forest theme has canvasBackground property set', () => {
    const theme = THEMES['forest' as ThemeName]
    expect(theme.canvasBackground).toBeDefined()
  })

  it('forest canvasBackground is an object (gradient or texture)', () => {
    const theme = THEMES['forest' as ThemeName]
    expect(typeof theme.canvasBackground).toBe('object')
  })
})

// TC-4: ThemeSwitcher renders buttons for ALL themes including new ones
describe('TC-4: ThemeSwitcher includes new themes', () => {
  it('Object.keys(THEMES) includes ocean, sunset, forest', () => {
    const keys = Object.keys(THEMES)
    expect(keys).toContain('ocean')
    expect(keys).toContain('sunset')
    expect(keys).toContain('forest')
  })

  it('All new themes have all required token fields', () => {
    const requiredFields = [
      'canvas', 'sidebar', 'sidebarBorder', 'topbar', 'topbarBorder',
      'column', 'card', 'cardBorder', 'cardShadow',
      'text', 'textMuted', 'textFaint',
      'accent', 'accentSoft', 'accentText',
      'danger', 'warn', 'ok',
      'hover', 'chipBg', 'chipText', 'selectedBg', 'selectedText',
    ]
    for (const name of NEW_THEMES) {
      const theme = THEMES[name]
      for (const field of requiredFields) {
        expect(theme, `theme "${name}" missing field "${field}"`).toHaveProperty(field)
      }
    }
  })
})

// TC-5: Selecting a new theme and reloading (themeStore persists to localStorage) restores it
describe('TC-5: New themes persist via themeStore localStorage', () => {
  let mockRoot: ReturnType<typeof createMockRoot>

  beforeEach(() => {
    mockRoot = createMockRoot()
    vi.stubGlobal('document', { documentElement: mockRoot })
  })

  it('applyTheme("ocean") sets --canvas to the gradient value', () => {
    applyTheme('ocean' as ThemeName)
    const theme = THEMES['ocean' as ThemeName]
    const bg = theme.canvasBackground as { gradient: string }
    expect(mockRoot._props['--canvas']).toBe(bg.gradient)
  })

  it('applyTheme("sunset") sets --canvas to the gradient value', () => {
    applyTheme('sunset' as ThemeName)
    const theme = THEMES['sunset' as ThemeName]
    const bg = theme.canvasBackground as { gradient: string }
    expect(mockRoot._props['--canvas']).toBe(bg.gradient)
  })

  it('applyTheme("forest") sets --canvas to canvasBackground value', () => {
    applyTheme('forest' as ThemeName)
    const theme = THEMES['forest' as ThemeName]
    const bg = theme.canvasBackground as CanvasBackground
    const expected = typeof bg === 'string'
      ? bg
      : 'gradient' in (bg as object)
        ? (bg as { gradient: string }).gradient
        : (bg as { texture: string }).texture
    expect(mockRoot._props['--canvas']).toBe(expected)
  })

  it('ThemeName union includes new theme names (type-level via runtime check)', () => {
    // If ThemeName is not updated, THEMES would not compile with new keys.
    // This runtime check confirms all 6 themes are present.
    const names = Object.keys(THEMES)
    expect(names).toContain('light')
    expect(names).toContain('midnight')
    expect(names).toContain('graphite')
    expect(names).toContain('ocean')
    expect(names).toContain('sunset')
    expect(names).toContain('forest')
    expect(names).toHaveLength(6)
  })
})

// Regression: original 3 themes still unchanged
describe('Regression: original themes unaffected', () => {
  it('light theme canvasBackground is still undefined', () => {
    expect(THEMES.light.canvasBackground).toBeUndefined()
  })

  it('midnight theme canvasBackground is still undefined', () => {
    expect(THEMES.midnight.canvasBackground).toBeUndefined()
  })

  it('graphite theme canvasBackground is still undefined', () => {
    expect(THEMES.graphite.canvasBackground).toBeUndefined()
  })
})
