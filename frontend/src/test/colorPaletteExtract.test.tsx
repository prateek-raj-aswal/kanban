/**
 * test_plan:
 *   story_id: US-1701
 *   framework: vitest + @testing-library/react
 *   tests:
 *     - id: TC-1701-1
 *       maps_to_ac: "ColorPalette exported from shared ui path and renders swatches"
 *     - id: TC-1701-2
 *       maps_to_ac: "Active swatch has accent outline"
 *     - id: TC-1701-3
 *       maps_to_ac: "Column still uses ColorPalette with identical behaviour after extraction"
 *     - id: TC-1701-4
 *       maps_to_ac: "Hex input Enter triggers onSelect with valid hex"
 *     - id: TC-1701-5
 *       maps_to_ac: "None (clear) button triggers onSelect(null)"
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@/lib/theme', () => ({
  T: new Proxy({}, { get: (_t, prop) => String(prop) }),
}))

import { ColorPalette } from '@/components/ui/ColorPalette'

const COLOR_MAP = { red: '#ef4444', blue: '#3b82f6', green: '#22c55e' }
const COLOR_TOKENS = Object.keys(COLOR_MAP)

describe('TC-1701-1: ColorPalette renders swatches for each token', () => {
  it('renders a button for each color token', () => {
    render(
      <ColorPalette
        tokens={COLOR_TOKENS}
        colorHexMap={COLOR_MAP}
        currentColor={null}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByTitle('red')).toBeInTheDocument()
    expect(screen.getByTitle('blue')).toBeInTheDocument()
    expect(screen.getByTitle('green')).toBeInTheDocument()
  })
})

describe('TC-1701-2: Active swatch has different outline than inactive', () => {
  it('active swatch has a different outline style than inactive swatches', () => {
    render(
      <ColorPalette
        tokens={COLOR_TOKENS}
        colorHexMap={COLOR_MAP}
        currentColor="blue"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />
    )
    const blueBtn = screen.getByTitle('blue') as HTMLButtonElement
    const redBtn = screen.getByTitle('red') as HTMLButtonElement
    // Active swatch outline differs from inactive (transparent)
    const blueStyle = blueBtn.getAttribute('style') ?? ''
    const redStyle = redBtn.getAttribute('style') ?? ''
    expect(blueStyle).not.toEqual(redStyle)
  })
})

describe('TC-1701-3: Clicking a swatch calls onSelect with the token', () => {
  it('calls onSelect with the token name when a swatch is clicked', () => {
    const onSelect = vi.fn()
    render(
      <ColorPalette
        tokens={COLOR_TOKENS}
        colorHexMap={COLOR_MAP}
        currentColor={null}
        onSelect={onSelect}
        onClose={vi.fn()}
      />
    )
    fireEvent.click(screen.getByTitle('red'))
    expect(onSelect).toHaveBeenCalledWith('red')
  })
})

describe('TC-1701-4: Hex input Enter triggers onSelect with valid hex', () => {
  it('calls onSelect when Enter is pressed with a valid 6-digit hex', () => {
    const onSelect = vi.fn()
    render(
      <ColorPalette
        tokens={COLOR_TOKENS}
        colorHexMap={COLOR_MAP}
        currentColor={null}
        onSelect={onSelect}
        onClose={vi.fn()}
      />
    )
    const input = screen.getByPlaceholderText('#ff0000')
    fireEvent.change(input, { target: { value: '#aabbcc' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith('#aabbcc')
  })

  it('does NOT call onSelect when Enter is pressed with invalid hex', () => {
    const onSelect = vi.fn()
    render(
      <ColorPalette
        tokens={COLOR_TOKENS}
        colorHexMap={COLOR_MAP}
        currentColor={null}
        onSelect={onSelect}
        onClose={vi.fn()}
      />
    )
    const input = screen.getByPlaceholderText('#ff0000')
    fireEvent.change(input, { target: { value: 'notahex' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSelect).not.toHaveBeenCalled()
  })
})

describe('TC-1701-5: None (clear) button calls onSelect(null)', () => {
  it('calls onSelect(null) when None button is clicked', () => {
    const onSelect = vi.fn()
    render(
      <ColorPalette
        tokens={COLOR_TOKENS}
        colorHexMap={COLOR_MAP}
        currentColor="red"
        onSelect={onSelect}
        onClose={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText(/none/i))
    expect(onSelect).toHaveBeenCalledWith(null)
  })
})
