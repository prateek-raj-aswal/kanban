import { describe, it, expect } from 'vitest'
import { darkenHex, T, THEMES, ICONS } from '@/lib/theme'

describe('darkenHex', () => {
  it('darkens white (#ffffff) by 50% to grey', () => {
    const result = darkenHex('#ffffff', 0.5)
    expect(result).toBe('#808080')
  })

  it('returns black when darkening by 100%', () => {
    const result = darkenHex('#ffffff', 1.0)
    expect(result).toBe('#000000')
  })

  it('returns same color when darkening by 0%', () => {
    const result = darkenHex('#2563eb', 0)
    expect(result).toBe('#2563eb')
  })

  it('handles short values correctly', () => {
    const result = darkenHex('#000000', 0.5)
    expect(result).toBe('#000000')
  })
})

describe('theme tokens', () => {
  it('accent is a valid hex color', () => {
    expect(THEMES.light.accent).toMatch(/^#[0-9a-fA-F]{6}$/)
  })

  it('danger is a valid hex color', () => {
    expect(THEMES.light.danger).toMatch(/^#[0-9a-fA-F]{6}$/)
  })
})

describe('ICONS', () => {
  it('plus icon is defined', () => {
    expect(ICONS.plus).toBeTruthy()
  })

  it('trash icon is defined', () => {
    expect(ICONS.trash).toBeTruthy()
  })

  it('all icon values are non-empty SVG path strings', () => {
    for (const [name, path] of Object.entries(ICONS)) {
      expect(path, `Icon "${name}" should be a non-empty string`).toBeTruthy()
    }
  })
})
