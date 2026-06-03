'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { MemberResponse } from '@/types/api'
import { T } from '@/lib/theme'
import Icon from '@/components/ui/Icon'

interface Props {
  boardId: string
  currentUserRole?: string
}

function roleBadge(role: string) {
  const isOwner = role === 'OWNER'
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, letterSpacing: '.04em',
      textTransform: 'uppercase',
      padding: '2px 6px', borderRadius: 4,
      background: isOwner ? T.accentSoft : T.chipBg,
      color: isOwner ? T.accent : T.textMuted,
    }}>
      {role}
    </span>
  )
}

export default function MemberList({ boardId, currentUserRole }: Props) {
  const [members, setMembers] = useState<MemberResponse[]>([])
  const [roleErrors, setRoleErrors] = useState<Record<string, string>>({})

  const canManageMembers = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN'

  useEffect(() => {
    api.get<MemberResponse[]>(`/api/v1/boards/${boardId}/members`)
      .then(setMembers)
      .catch(() => {})
  }, [boardId])

  async function handleRoleChange(userId: string, newRole: string) {
    const prev = members.map(m => m)
    setMembers(current => current.map(m => m.userId === userId ? { ...m, role: newRole } : m))
    setRoleErrors(e => { const next = { ...e }; delete next[userId]; return next })
    try {
      await api.patch(`/api/v1/boards/${boardId}/members/${userId}/role`, { role: newRole })
    } catch (e: unknown) {
      setMembers(prev)
      setRoleErrors(err => ({ ...err, [userId]: e instanceof Error ? e.message : 'Failed to update role' }))
    }
  }

  if (members.length === 0) return null

  return (
    <div>
      <div style={{
        fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em',
        color: T.textFaint, textTransform: 'uppercase', marginBottom: 10,
      }}>
        Members · {members.length}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {members.map(m => (
          <div key={m.userId} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%',
                background: T.accentSoft, color: T.accent,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>
                {m.displayName ? m.displayName[0].toUpperCase() : <Icon name="user" size={13} sw={1.5} />}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: T.text,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.displayName || m.email}
                </div>
                <div style={{ fontSize: 11, color: T.textFaint,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.email}
                </div>
              </div>
              {canManageMembers ? (
                <select
                  aria-label={`Role for ${m.displayName || m.email}`}
                  value={m.role}
                  onChange={e => handleRoleChange(m.userId, e.target.value)}
                  style={{
                    fontSize: 11, padding: '2px 4px',
                    background: T.card, border: `1px solid ${T.cardBorder}`,
                    borderRadius: 4, color: T.text,
                    cursor: 'pointer', outline: 'none', flexShrink: 0,
                  }}
                >
                  <option value="OWNER" disabled={currentUserRole !== 'OWNER'}>OWNER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="MEMBER">MEMBER</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              ) : (
                roleBadge(m.role)
              )}
            </div>
            {roleErrors[m.userId] && (
              <div style={{ fontSize: 11, color: T.danger, paddingLeft: 37 }}>{roleErrors[m.userId]}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
