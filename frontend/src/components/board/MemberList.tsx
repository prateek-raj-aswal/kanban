'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { MemberResponse } from '@/types/api'
import { T } from '@/lib/theme'
import Icon from '@/components/ui/Icon'

interface Props {
  boardId: string
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

export default function MemberList({ boardId }: Props) {
  const [members, setMembers] = useState<MemberResponse[]>([])

  useEffect(() => {
    api.get<MemberResponse[]>(`/api/v1/boards/${boardId}/members`)
      .then(setMembers)
      .catch(() => {})
  }, [boardId])

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
          <div key={m.userId} style={{
            display: 'flex', alignItems: 'center', gap: 9,
          }}>
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
            {roleBadge(m.role)}
          </div>
        ))}
      </div>
    </div>
  )
}
