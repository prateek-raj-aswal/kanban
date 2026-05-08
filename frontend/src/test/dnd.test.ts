import { describe, expect, test } from 'vitest'
import { computeNewPosition } from '../lib/dnd'

describe('computeNewPosition', () => {
  test('returns 1000 for empty column', () => {
    expect(computeNewPosition([], 0)).toBe(1000)
  })

  test('inserts before first card: half of first position', () => {
    expect(computeNewPosition([1000, 2000, 3000], 0)).toBe(500)
  })

  test('inserts between two cards: midpoint', () => {
    expect(computeNewPosition([1000, 3000], 1)).toBe(2000)
  })

  test('inserts after last card: last + 1000', () => {
    expect(computeNewPosition([1000, 2000], 2)).toBe(3000)
  })

  test('single card: insert before returns half', () => {
    expect(computeNewPosition([2000], 0)).toBe(1000)
  })

  test('single card: insert after returns position + 1000', () => {
    expect(computeNewPosition([2000], 1)).toBe(3000)
  })

  test('insertIndex beyond length treated as end', () => {
    expect(computeNewPosition([1000], 99)).toBe(2000)
  })
})
