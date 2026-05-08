'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { T, type IconKey } from '@/lib/theme'
import type { BoardResponse } from '@/types/api'
import Icon from '@/components/ui/Icon'

interface Props {
  currentBoardId: string
}

export default function Sidebar({ currentBoardId }: Props) {
  const [boards, setBoards] = useState<BoardResponse[]>([])

  useEffect(() => {
    api.get<BoardResponse[]>('/api/v1/boards').then(setBoards).catch(() => {})
  }, [])

  const NavItem = ({ label, icon, count, active, href }: {
    label: string
    icon?: IconKey
    count?: number
    active?: boolean
    href?: string
  }) => (
    <a
      href={href ?? '#'}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 10px',
        fontSize: 13, fontWeight: active ? 600 : 500,
        color: active ? T.selectedText : T.text,
        background: active ? T.selectedBg : 'transparent',
        borderRadius: 6, cursor: 'pointer',
      }}
    >
      {icon && (
        <Icon name={icon} size={14} sw={active ? 2 : 1.6}
          style={{ color: active ? T.selectedText : T.textMuted }} />
      )}
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      {count != null && (
        <span style={{ fontSize: 11, color: T.textFaint, fontWeight: 500,
          fontVariantNumeric: 'tabular-nums' }}>{count}</span>
      )}
    </a>
  )

  const SectionHead = ({ children }: { children: React.ReactNode }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 12px 6px',
      fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em',
      color: T.textFaint, textTransform: 'uppercase',
    }}>
      <span>{children}</span>
      <a href="/boards" style={{ color: T.textFaint, cursor: 'pointer' }}>
        <Icon name="plus" size={12} sw={2} />
      </a>
    </div>
  )

  return (
    <aside style={{
      width: 232, flexShrink: 0,
      background: T.sidebar,
      borderRight: `1px solid ${T.sidebarBorder}`,
      display: 'flex', flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Workspace header */}
      <div style={{
        padding: '12px 12px 10px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: `1px solid ${T.sidebarBorder}`,
        flexShrink: 0,
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: 6,
          background: T.accent, color: T.accentText,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, letterSpacing: '-.02em',
        }}>K</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.1 }}>Kanban</div>
          <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.1, marginTop: 2 }}>
            {boards.length} board{boards.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '10px 12px 4px', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '6px 10px',
          background: T.hover, borderRadius: 6,
          fontSize: 12, color: T.textFaint,
        }}>
          <Icon name="search" size={12} sw={1.7} />
          <span style={{ flex: 1 }}>Search</span>
          <span style={{
            fontSize: 10, fontWeight: 600,
            border: `1px solid ${T.cardBorder}`, padding: '0 4px',
            borderRadius: 3, background: T.card,
          }}>⌘K</span>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: '4px 8px', overflowY: 'auto' }}>
        <NavItem icon="inbox" label="All boards" href="/boards" count={boards.length} />

        {boards.length > 0 && (
          <>
            <SectionHead>My Boards</SectionHead>
            {boards.map(b => (
              <NavItem
                key={b.id}
                label={b.name}
                active={b.id === currentBoardId}
                href={`/boards/${b.id}`}
              />
            ))}
          </>
        )}
      </div>

      {/* Bottom */}
      <div style={{
        padding: '10px 12px',
        borderTop: `1px solid ${T.sidebarBorder}`,
        display: 'flex', alignItems: 'center', gap: 9,
        flexShrink: 0,
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          background: T.accentSoft, color: T.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon name="user" size={12} sw={1.5} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.text, lineHeight: 1.1 }}>Account</div>
        </div>
        <Icon name="cog" size={14} style={{ color: T.textMuted, cursor: 'pointer' }} />
      </div>
    </aside>
  )
}
