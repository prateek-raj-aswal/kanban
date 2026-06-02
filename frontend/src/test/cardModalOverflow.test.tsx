/**
 * test_plan:
 *   story_id: US-1206
 *   framework: Vitest + React Testing Library
 *   tests:
 *     - id: TC-003
 *       file: "src/test/cardModalOverflow.test.tsx"
 *       maps_to_ac: "AC-2: GIVEN modal WHEN open on desktop THEN modal container has maxWidth that constrains it to viewport"
 *       type: acceptance
 *     - id: TC-004
 *       file: "src/test/cardModalOverflow.test.tsx"
 *       maps_to_ac: "AC-2: GIVEN modal WHEN open THEN overlay backdrop allows scrolling (overflowY:auto) for tall modals"
 *       type: acceptance
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'

// ---------------------------------------------------------------------------
// Shared mobile flag
// ---------------------------------------------------------------------------
let mockIsMobile = false

vi.mock('@/lib/useIsMobile', () => ({
  useIsMobile: () => mockIsMobile,
}))

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue([]),
    post: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  },
  ApiError: class ApiError extends Error {},
}))

vi.mock('@/lib/theme', () => ({
  T: {
    card: '#fff', cardBorder: '#e2e8f0', text: '#0f172a', textMuted: '#64748b',
    textFaint: '#94a3b8', column: '#f1f5f9', sidebar: '#f8fafc', bg: '#f8fafc',
    surface: '#fff', border: '#e2e8f0', accent: '#6366f1', accentFg: '#fff',
  },
  darkenHex: (hex: string) => hex,
}))

vi.mock('@/components/ui/Icon', () => ({
  default: ({ name }: { name: string }) => <span data-icon={name} />,
}))

// ---------------------------------------------------------------------------
// Minimal mock card fixture
// ---------------------------------------------------------------------------
const mockCard = {
  id: 'card-1', title: 'Test card', columnId: 'col-1', position: 1,
  description: null, startDate: null, assignees: [], dueDate: null,
  priority: 'NONE' as const, labels: [],
}

// ---------------------------------------------------------------------------
// TC-003: CardModal desktop — modal panel has viewport-constraining maxWidth
// ---------------------------------------------------------------------------
describe('TC-003: CardModal desktop modal panel has maxWidth constraining to viewport', () => {
  beforeEach(() => {
    mockIsMobile = false
  })

  it('modal panel has a maxWidth using viewport-relative units', async () => {
    const { default: CardModal } = await import('@/components/board/CardModal')
    const { container } = render(
      <CardModal
        card={mockCard}
        columnName="To Do"
        boardId="b1"
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    // The overlay is position:fixed and covers the whole screen
    const overlay = container.querySelector('div[style*="position: fixed"]') as HTMLElement | null
    expect(overlay, 'Overlay div (position:fixed) must exist').not.toBeNull()

    // The modal panel is the first child of the overlay
    const modalPanel = overlay!.firstElementChild as HTMLElement | null
    expect(modalPanel, 'Modal panel (first child of overlay) must exist').not.toBeNull()

    // After fix: maxWidth must be set with viewport-relative units (vw / calc)
    // Before fix: maxWidth is empty — this assertion FAILS (RED as expected)
    const maxWidth = modalPanel!.style.maxWidth
    expect(
      maxWidth,
      'Desktop modal panel must have maxWidth set (e.g. calc(100vw - 32px)) to prevent overflow on narrow viewports',
    ).toBeTruthy()
    expect(
      maxWidth,
      'Desktop modal panel maxWidth must use viewport-relative units (vw or calc)',
    ).toMatch(/vw|calc/)
  })
})

// ---------------------------------------------------------------------------
// TC-004: CardModal overlay — overflowY:auto so tall modals can scroll
// ---------------------------------------------------------------------------
describe('TC-004: CardModal overlay backdrop has overflowY auto for tall modals', () => {
  beforeEach(() => {
    mockIsMobile = false
  })

  it('overlay backdrop div has overflowY auto', async () => {
    const { default: CardModal } = await import('@/components/board/CardModal')
    const { container } = render(
      <CardModal
        card={mockCard}
        columnName="To Do"
        boardId="b1"
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    const overlay = container.querySelector('div[style*="position: fixed"]') as HTMLElement | null
    expect(overlay, 'Overlay div (position:fixed) must exist').not.toBeNull()

    // After fix: overflowY must be 'auto' so tall modals remain on-screen and scrollable
    // Before fix: overflowY is empty/unset — this assertion FAILS (RED as expected)
    expect(
      overlay!.style.overflowY,
      'Overlay backdrop must have overflowY:auto so tall modals remain on-screen and scrollable',
    ).toBe('auto')
  })
})
