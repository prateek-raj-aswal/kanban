'use client'
import { useEffect, useRef, useState } from 'react'
import { T } from '@/lib/theme'

const HEX_RE = /^#[0-9A-Fa-f]{6}$/

export interface ColorPaletteProps {
  tokens: string[]
  colorHexMap: Record<string, string>
  currentColor: string | null | undefined
  onSelect: (token: string | null) => void
  onClose: () => void
}

export function ColorPalette({
  tokens,
  colorHexMap,
  currentColor,
  onSelect,
  onClose,
}: ColorPaletteProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [hexInput, setHexInput] = useState('')

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        zIndex: 60,
        background: T.card,
        border: `1px solid ${T.cardBorder}`,
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,.14)',
        padding: 10,
        marginTop: 4,
        minWidth: 160,
      }}
    >
      <div style={{ fontSize: 10.5, fontWeight: 600, color: T.textFaint, marginBottom: 8, letterSpacing: '.05em', textTransform: 'uppercase' }}>
        Header color
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {tokens.map((token) => {
          const hex = colorHexMap[token]
          const isActive = token === currentColor
          return (
            <button
              key={token}
              title={token}
              onClick={() => onSelect(token)}
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: hex ?? '#ccc',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                outline: isActive ? `2px solid ${T.accent}` : '2px solid transparent',
                outlineOffset: 2,
                flexShrink: 0,
              }}
            />
          )
        })}
      </div>
      <input
        type="text"
        placeholder="#ff0000"
        value={hexInput}
        maxLength={7}
        onChange={e => setHexInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && HEX_RE.test(hexInput)) {
            onSelect(hexInput)
            setHexInput('')
          }
        }}
        onBlur={() => {
          if (HEX_RE.test(hexInput)) {
            onSelect(hexInput)
            setHexInput('')
          }
        }}
        style={{
          width: '100%', padding: '4px 8px', fontSize: 12,
          background: T.card, border: `1px solid ${T.cardBorder}`,
          borderRadius: 5, color: T.text, outline: 'none',
          fontFamily: 'monospace', marginBottom: 6,
          boxSizing: 'border-box',
        }}
      />
      <button
        onClick={() => onSelect(null)}
        style={{
          width: '100%',
          padding: '5px 8px',
          background: 'none',
          border: `1px dashed ${T.cardBorder}`,
          borderRadius: 5,
          fontSize: 11,
          color: T.textMuted,
          cursor: 'pointer',
          textAlign: 'center',
          fontFamily: 'inherit',
        }}
      >
        None (clear)
      </button>
    </div>
  )
}
