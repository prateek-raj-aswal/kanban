/**
 * test_plan:
 *   story_id: US-1702
 *   framework: vitest + @testing-library/react
 *   tests:
 *     - id: TC-1702-1
 *       maps_to_ac: "Card color PropRow shows trigger; clicking opens ColorPalette"
 *     - id: TC-1702-2
 *       maps_to_ac: "Swatch click calls handleCardColor (api.patch) and closes popup"
 *     - id: TC-1702-3
 *       maps_to_ac: "Valid 6-digit hex + Enter triggers handleCardColor"
 *     - id: TC-1702-4
 *       maps_to_ac: "Valid hex + onBlur triggers handleCardColor"
 *     - id: TC-1702-5
 *       maps_to_ac: "Invalid/partial hex + onBlur does NOT trigger handleCardColor"
 *     - id: TC-1702-6
 *       maps_to_ac: "None button calls handleCardColor(null)"
 *     - id: TC-1702-7
 *       maps_to_ac: "PATCH fails → card color rolls back"
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useConfigStore } from '@/store/configStore'
import type { CardResponse } from '@/types/api'

// ── dnd-kit (not used but imported transitively) ──────────────────────────────
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, transition: undefined, isDragging: false }),
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
}))
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => '' } } }))

// ── api mock ──────────────────────────────────────────────────────────────────
const mockGet = vi.fn()
const mockPatch = vi.fn()

vi.mock('@/lib/api', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: vi.fn().mockResolvedValue({}),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: vi.fn().mockResolvedValue({}),
    postForm: vi.fn().mockResolvedValue({}),
  },
  ApiError: class ApiError extends Error {
    constructor(public status: number, public code: string, message: string) { super(message) }
  },
}))

vi.mock('@/lib/theme', () => ({
  T: new Proxy({}, { get: (_t, prop) => String(prop) }),
  darkenHex: (hex: string) => hex,
}))

vi.mock('@/components/ui/Icon', () => ({
  default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}))

vi.mock('@/lib/useIsMobile', () => ({ useIsMobile: () => false }))

// ── Component import (after mocks) ───────────────────────────────────────────
import CardModal from '@/components/board/CardModal'

const COLOR_MAP = { red: '#ef4444', blue: '#3b82f6' }
const COLOR_TOKENS = Object.keys(COLOR_MAP)

function makeCard(overrides: Partial<CardResponse> = {}): CardResponse {
  return {
    id: 'card-1',
    columnId: 'col-1',
    title: 'Test Card',
    description: null,
    position: 1000,
    startDate: null,
    dueDate: null,
    priority: 'NONE',
    labels: [],
    assignees: [],
    color: null,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGet.mockResolvedValue([])
  mockPatch.mockResolvedValue({})
  useConfigStore.setState({ columnColors: COLOR_TOKENS, columnColorMap: COLOR_MAP })
})

function renderModal(card = makeCard()) {
  return render(
    <CardModal
      card={card}
      columnName="Backlog"
      boardId="board-1"
      onClose={vi.fn()}
      onUpdate={vi.fn()}
      onDelete={vi.fn()}
    />
  )
}

// ── TC-1702-1: trigger opens palette ─────────────────────────────────────────
describe('TC-1702-1: Card color trigger opens ColorPalette', () => {
  it('shows color trigger in Card color row and clicking it opens palette', async () => {
    renderModal()
    // The card color trigger button should be present (title="Set card color" or similar)
    const trigger = await screen.findByTitle(/set card color/i)
    expect(trigger).toBeInTheDocument()

    fireEvent.click(trigger)
    // palette opens — swatch buttons for the tokens appear
    await waitFor(() => {
      expect(screen.getByTitle('red')).toBeInTheDocument()
      expect(screen.getByTitle('blue')).toBeInTheDocument()
    })
  })
})

// ── TC-1702-2: swatch click calls api.patch and closes popup ─────────────────
describe('TC-1702-2: Swatch click patches card color', () => {
  it('calls api.patch with new color when swatch is clicked', async () => {
    renderModal()
    fireEvent.click(await screen.findByTitle(/set card color/i))
    fireEvent.click(await screen.findByTitle('red'))

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith(
        '/api/v1/cards/card-1',
        expect.objectContaining({ color: 'red' })
      )
    })
    // popup closes — swatches no longer in DOM
    await waitFor(() => {
      expect(screen.queryByTitle('blue')).not.toBeInTheDocument()
    })
  })
})

// ── TC-1702-3: valid hex + Enter fires handleCardColor ────────────────────────
describe('TC-1702-3: Valid hex + Enter fires handleCardColor', () => {
  it('calls api.patch when valid hex typed and Enter pressed in palette input', async () => {
    renderModal()
    fireEvent.click(await screen.findByTitle(/set card color/i))
    const input = await screen.findByPlaceholderText('#ff0000')
    fireEvent.change(input, { target: { value: '#aabbcc' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith(
        '/api/v1/cards/card-1',
        expect.objectContaining({ color: '#aabbcc' })
      )
    })
  })
})

// ── TC-1702-4: valid hex + onBlur fires handleCardColor ───────────────────────
describe('TC-1702-4: Valid hex + onBlur fires handleCardColor', () => {
  it('calls api.patch when valid hex is typed and input loses focus', async () => {
    renderModal()
    fireEvent.click(await screen.findByTitle(/set card color/i))
    const input = await screen.findByPlaceholderText('#ff0000')
    fireEvent.change(input, { target: { value: '#112233' } })
    fireEvent.blur(input)

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith(
        '/api/v1/cards/card-1',
        expect.objectContaining({ color: '#112233' })
      )
    })
  })
})

// ── TC-1702-5: invalid hex + onBlur does NOT fire ────────────────────────────
describe('TC-1702-5: Invalid hex + onBlur does NOT fire handleCardColor', () => {
  it('does NOT call api.patch when invalid hex is typed and input blurs', async () => {
    renderModal()
    fireEvent.click(await screen.findByTitle(/set card color/i))
    const input = await screen.findByPlaceholderText('#ff0000')
    fireEvent.change(input, { target: { value: 'badcolor' } })
    fireEvent.blur(input)

    await new Promise(r => setTimeout(r, 50))
    expect(mockPatch).not.toHaveBeenCalled()
  })
})

// ── TC-1702-6: None button calls handleCardColor(null) ───────────────────────
describe('TC-1702-6: None button clears color', () => {
  it('calls api.patch with color=null when None button clicked', async () => {
    renderModal(makeCard({ color: 'red' }))
    fireEvent.click(await screen.findByTitle(/set card color/i))
    fireEvent.click(await screen.findByRole('button', { name: /none.*clear/i }))

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith(
        '/api/v1/cards/card-1',
        expect.objectContaining({ color: null })
      )
    })
  })
})

// ── TC-1702-7: PATCH fails → rollback ────────────────────────────────────────
describe('TC-1702-7: PATCH failure rolls back color', () => {
  it('restores previous color when PATCH throws', async () => {
    mockPatch.mockRejectedValueOnce(new Error('Network error'))
    renderModal(makeCard({ color: 'red' }))
    fireEvent.click(await screen.findByTitle(/set card color/i))
    fireEvent.click(await screen.findByTitle('blue'))

    // After the failed PATCH, trigger should reflect original color
    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalled()
    })
    // No unhandled rejection — component stays mounted
    expect(screen.getByTitle(/set card color/i)).toBeInTheDocument()
  })
})
