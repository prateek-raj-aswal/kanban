/**
 * test_plan:
 *   story_id: US-1308
 *   framework: Vitest + React Testing Library
 *   tests:
 *     - id: TC-1
 *       file: "src/test/createBoardModal.test.tsx"
 *       maps_to_ac: "AC-1: GIVEN modal WHEN open THEN matches active theme tokens (no hardcoded #fff)"
 *       type: acceptance
 *     - id: TC-2
 *       file: "src/test/createBoardModal.test.tsx"
 *       maps_to_ac: "AC-1: GIVEN modal WHEN open THEN description textarea is present"
 *       type: acceptance
 *     - id: TC-3
 *       file: "src/test/createBoardModal.test.tsx"
 *       maps_to_ac: "AC-2: GIVEN name+description WHEN submit THEN onCreate called with both"
 *       type: acceptance
 *     - id: TC-4
 *       file: "src/test/createBoardModal.test.tsx"
 *       maps_to_ac: "AC-2: GIVEN name only WHEN submit THEN onCreate called with name, description optional"
 *       type: acceptance
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

vi.mock('@/lib/theme', () => ({
  T: {
    card:       'var(--card)',
    cardBorder: 'var(--card-border)',
    text:       'var(--text)',
    textMuted:  'var(--text-muted)',
    accent:     'var(--accent)',
    accentText: 'var(--accent-text)',
    accentSoft: 'var(--accent-soft)',
    canvas:     'var(--canvas)',
  },
}))

import CreateBoardModal from '@/components/boards/CreateBoardModal'

// ---------------------------------------------------------------------------
// TC-1: Modal uses CSS vars (theme tokens), not hardcoded #fff
// ---------------------------------------------------------------------------
describe('TC-1: Modal renders with theme token CSS vars', () => {
  it('dialog container uses var(--card) not hardcoded #fff', () => {
    const onClose = vi.fn()
    const onCreate = vi.fn().mockResolvedValue(undefined)
    const { container } = render(
      <CreateBoardModal onClose={onClose} onCreate={onCreate} />
    )
    // Find all elements with inline style
    const allStyled = Array.from(container.querySelectorAll('[style]')) as HTMLElement[]
    const hardcodedWhite = allStyled.filter(el =>
      el.style.background === '#fff' || el.style.backgroundColor === '#fff' ||
      el.style.background === 'rgb(255, 255, 255)' ||
      el.style.backgroundColor === 'rgb(255, 255, 255)'
    )
    expect(hardcodedWhite.length).toBe(0)
  })

  it('form container uses var(--card) for background', () => {
    const onClose = vi.fn()
    const onCreate = vi.fn().mockResolvedValue(undefined)
    const { container } = render(
      <CreateBoardModal onClose={onClose} onCreate={onCreate} />
    )
    const allStyled = Array.from(container.querySelectorAll('[style]')) as HTMLElement[]
    const usesCardVar = allStyled.some(el => el.getAttribute('style')?.includes('var(--card)'))
    expect(usesCardVar).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// TC-2: Description textarea is present
// ---------------------------------------------------------------------------
describe('TC-2: Description textarea is present in the form', () => {
  it('renders a textarea for description', () => {
    const onClose = vi.fn()
    const onCreate = vi.fn().mockResolvedValue(undefined)
    render(<CreateBoardModal onClose={onClose} onCreate={onCreate} />)
    const textarea = screen.getByPlaceholderText(/description/i)
    expect(textarea).toBeInTheDocument()
    expect(textarea.tagName).toBe('TEXTAREA')
  })
})

// ---------------------------------------------------------------------------
// TC-3: Submitting with name + description calls onCreate with both
// ---------------------------------------------------------------------------
describe('TC-3: Submit calls onCreate with name and description', () => {
  it('passes both name and description to onCreate', async () => {
    const onClose = vi.fn()
    const onCreate = vi.fn().mockResolvedValue(undefined)
    render(<CreateBoardModal onClose={onClose} onCreate={onCreate} />)

    const nameInput = screen.getByPlaceholderText(/board name/i)
    fireEvent.change(nameInput, { target: { value: 'My Board' } })

    const textarea = screen.getByPlaceholderText(/description/i)
    fireEvent.change(textarea, { target: { value: 'A great board' } })

    const submitBtn = screen.getByRole('button', { name: /create/i })
    fireEvent.click(submitBtn)

    expect(onCreate).toHaveBeenCalledWith('My Board', 'A great board')
  })
})

// ---------------------------------------------------------------------------
// TC-4: Submitting without description calls onCreate with name only (description optional)
// ---------------------------------------------------------------------------
describe('TC-4: Submit without description calls onCreate with name only', () => {
  it('passes name and undefined when description is empty', async () => {
    const onClose = vi.fn()
    const onCreate = vi.fn().mockResolvedValue(undefined)
    render(<CreateBoardModal onClose={onClose} onCreate={onCreate} />)

    const nameInput = screen.getByPlaceholderText(/board name/i)
    fireEvent.change(nameInput, { target: { value: 'Quick Board' } })

    // Leave description empty
    const submitBtn = screen.getByRole('button', { name: /create/i })
    fireEvent.click(submitBtn)

    expect(onCreate).toHaveBeenCalledWith('Quick Board', undefined)
  })
})
