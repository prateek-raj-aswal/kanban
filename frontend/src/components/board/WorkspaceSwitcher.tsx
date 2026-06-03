'use client'
import { useEffect, useRef, useState } from 'react'
import { T } from '@/lib/theme'
import Icon from '@/components/ui/Icon'
import type { WorkspaceResponse } from '@/types/api'
import { useWorkspaceStore } from '@/store/workspaceStore'
import WorkspaceManageModal from './WorkspaceManageModal'

interface Props {
  onWorkspaceChange?: () => void
}

export default function WorkspaceSwitcher({ onWorkspaceChange }: Props) {
  const { workspaces, activeWorkspaceId, setActiveWorkspace } = useWorkspaceStore()
  const [open, setOpen] = useState(false)
  const [manageWorkspace, setManageWorkspace] = useState<WorkspaceResponse | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  const active = workspaces.find(w => w.id === activeWorkspaceId)
  const label = active ? active.name : 'All Workspaces'

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function select(id: string | null) {
    setActiveWorkspace(id)
    setOpen(false)
    onWorkspaceChange?.()
  }

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, width: '100%',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          textAlign: 'left',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{label}</div>
          <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.1, marginTop: 2 }}>
            {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
          </div>
        </div>
        <Icon name="chevDown" size={12} sw={2} style={{ color: T.textFaint, flexShrink: 0 }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: T.card, border: `1px solid ${T.cardBorder}`,
          borderRadius: 8, boxShadow: T.cardShadow,
          zIndex: 50, overflow: 'hidden',
          minWidth: 180,
        }}>
          <div
            onClick={() => select(null)}
            style={{
              padding: '7px 12px', fontSize: 13, cursor: 'pointer',
              color: activeWorkspaceId === null ? T.accent : T.text,
              fontWeight: activeWorkspaceId === null ? 600 : 400,
              background: activeWorkspaceId === null ? T.accentSoft : 'transparent',
            }}
          >
            All Workspaces
          </div>
          {workspaces.map(w => (
            <div
              key={w.id}
              style={{
                display: 'flex', alignItems: 'center',
                background: activeWorkspaceId === w.id ? T.accentSoft : 'transparent',
              }}
            >
              <div
                onClick={() => select(w.id)}
                style={{
                  flex: 1, padding: '7px 12px', fontSize: 13, cursor: 'pointer',
                  color: activeWorkspaceId === w.id ? T.accent : T.text,
                  fontWeight: activeWorkspaceId === w.id ? 600 : 400,
                }}
              >
                {w.name}
              </div>
              <button
                onClick={e => { e.stopPropagation(); setOpen(false); setManageWorkspace(w) }}
                title="Manage workspace"
                aria-label={`Manage ${w.name}`}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '4px 8px', color: T.textFaint, display: 'flex', alignItems: 'center',
                }}
              >
                <Icon name="cog" size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {manageWorkspace && (
        <WorkspaceManageModal
          workspace={manageWorkspace}
          onClose={() => setManageWorkspace(null)}
          onUpdated={() => { setManageWorkspace(null); onWorkspaceChange?.() }}
          onDeleted={() => { setManageWorkspace(null); onWorkspaceChange?.() }}
        />
      )}
    </div>
  )
}
