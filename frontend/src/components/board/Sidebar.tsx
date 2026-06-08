'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { T, type IconKey } from '@/lib/theme'
import type { BoardResponse, AuthResponse, SmartCardResponse } from '@/types/api'
import Icon from '@/components/ui/Icon'
import ThemeSwitcher from '@/components/ui/ThemeSwitcher'
import NotificationPanel from '@/components/ui/NotificationPanel'
import WorkspaceSwitcher from './WorkspaceSwitcher'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useAuthStore } from '@/store/authStore'
import { getRefreshToken } from '@/lib/auth'
import { useIsMobile } from '@/lib/useIsMobile'
import { useSidebarStore } from '@/store/sidebarStore'

interface Props {
  currentBoardId?: string
}

export default function Sidebar({ currentBoardId }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useIsMobile()
  const logout = useAuthStore(s => s.logout)
  const { collapsed, setCollapsed } = useSidebarStore()
  const { workspaces, activeWorkspaceId, setWorkspaces } = useWorkspaceStore()

  function handleLogout() {
    const rt = getRefreshToken()
    logout()
    router.push('/login')
    if (rt) api.post('/api/v1/auth/logout', { refreshToken: rt }).catch(() => {})
  }
  const [boards, setBoards] = useState<BoardResponse[]>([])
  const [starredBoards, setStarredBoards] = useState<BoardResponse[]>([])
  const [inboxCount, setInboxCount] = useState(0)
  const [todayCount, setTodayCount] = useState(0)
  const [upcomingCount, setUpcomingCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profile, setProfile] = useState<AuthResponse | null>(null)

  async function loadBoards() {
    const data = await api.get<BoardResponse[]>('/api/v1/boards').catch(() => [] as BoardResponse[])
    setBoards(data)
  }

  useEffect(() => {
    Promise.all([
      api.get<BoardResponse[]>('/api/v1/boards').catch(() => [] as BoardResponse[]),
      api.get<BoardResponse[]>('/api/v1/me/starred-boards').catch(() => [] as BoardResponse[]),
      api.get<{ id: string; name: string; ownerId: string; role: string; createdAt: string }[]>('/api/v1/workspaces').catch(() => []),
      api.get<SmartCardResponse[]>('/api/v1/me/inbox').catch(() => [] as SmartCardResponse[]),
      api.get<SmartCardResponse[]>('/api/v1/me/today').catch(() => [] as SmartCardResponse[]),
      api.get<SmartCardResponse[]>('/api/v1/me/upcoming').catch(() => [] as SmartCardResponse[]),
      api.get<{ count: number }>('/api/v1/notifications/unread-count').catch(() => ({ count: 0 })),
      api.get<AuthResponse>('/api/v1/users/me').catch(() => null as AuthResponse | null),
    ]).then(([b, starred, ws, inbox, today, upcoming, notif, prof]) => {
      setBoards(b)
      setStarredBoards(starred)
      setWorkspaces(ws)
      setInboxCount(inbox.length)
      setTodayCount(today.length)
      setUpcomingCount(upcoming.length)
      setUnreadCount(notif?.count ?? 0)
      if (prof) setProfile(prof)
    })
  }, [])

  const visibleBoards = activeWorkspaceId
    ? boards.filter(b => b.workspaceId === activeWorkspaceId)
    : boards

  const workspaceGroups: { id: string | null; name: string; boards: BoardResponse[] }[] = []
  const wsMap = new Map(workspaces.map(w => [w.id, w.name]))
  const byWorkspace = new Map<string | null, BoardResponse[]>()

  for (const b of visibleBoards) {
    const key = b.workspaceId ?? null
    if (!byWorkspace.has(key)) byWorkspace.set(key, [])
    byWorkspace.get(key)!.push(b)
  }

  if (byWorkspace.has(null) && byWorkspace.get(null)!.length > 0) {
    workspaceGroups.push({ id: null, name: 'Personal', boards: byWorkspace.get(null)! })
  }
  for (const ws of workspaces) {
    const wBoards = byWorkspace.get(ws.id) ?? []
    if (wBoards.length > 0) {
      workspaceGroups.push({ id: ws.id, name: ws.name, boards: wBoards })
    }
  }

  const NavItem = ({ label, icon, count, active, href }: {
    label: string; icon?: IconKey; count?: number; active?: boolean; href?: string
  }) => (
    <a
      href={href ?? '#'}
      title={collapsed ? label : undefined}
      style={{
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: collapsed ? 0 : 8,
        padding: collapsed ? '8px 0' : '6px 10px', fontSize: 13,
        fontWeight: active ? 600 : 500,
        color: active ? T.selectedText : T.text,
        background: active ? T.selectedBg : 'transparent',
        borderRadius: 6, cursor: 'pointer', textDecoration: 'none',
      }}
    >
      {icon && (
        <Icon name={icon} size={14} sw={active ? 2 : 1.6}
          style={{ color: active ? T.selectedText : T.textMuted }} />
      )}
      {!collapsed && (
        <>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {label}
          </span>
          {count != null && count > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 600,
              background: active ? T.selectedText : T.accentSoft,
              color: active ? T.selectedBg : T.accent,
              borderRadius: 10, padding: '1px 6px',
              fontVariantNumeric: 'tabular-nums',
            }}>{count}</span>
          )}
        </>
      )}
    </a>
  )

  const SectionHead = ({ children, showAdd }: { children: React.ReactNode; showAdd?: boolean }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 12px 4px',
      fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em',
      color: T.textFaint, textTransform: 'uppercase',
    }}>
      <span>{children}</span>
      {showAdd && (
        <a href="/boards" style={{ color: T.textFaint, cursor: 'pointer' }}>
          <Icon name="plus" size={12} sw={2} />
        </a>
      )}
    </div>
  )

  return (
    <aside style={{
      width: collapsed ? 48 : 232, flexShrink: 0,
      background: T.sidebar, borderRight: `1px solid ${T.sidebarBorder}`,
      display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
      paddingBottom: isMobile ? 56 : 0,
      transition: 'width 0.18s ease',
    }}>
      {/* Workspace header — US-601 */}
      <div style={{
        padding: '12px 12px 10px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: `1px solid ${T.sidebarBorder}`, flexShrink: 0,
      }}>
        {!collapsed && (
          <>
            <div style={{
              width: 26, height: 26, borderRadius: 6,
              background: T.accent, color: T.accentText,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, letterSpacing: '-.02em', flexShrink: 0,
            }}>K</div>
            <WorkspaceSwitcher onWorkspaceChange={loadBoards} />
          </>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 2,
            color: T.textFaint, display: 'inline-flex', alignItems: 'center',
            borderRadius: 4, flexShrink: 0, marginLeft: collapsed ? 0 : 'auto',
          }}
        >
          <Icon name={collapsed ? 'chevron' : 'chevLeft'} size={14} />
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
      <div style={{ padding: '10px 12px 4px', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '6px 10px',
          background: T.hover, borderRadius: 6, fontSize: 12, color: T.textFaint,
        }}>
          <Icon name="search" size={12} sw={1.7} />
          <span style={{ flex: 1 }}>Search</span>
          <span style={{
            fontSize: 10, fontWeight: 600, border: `1px solid ${T.cardBorder}`,
            padding: '0 4px', borderRadius: 3, background: T.card,
          }}>⌘K</span>
        </div>
      </div>
      )}

      {/* Nav */}
      <div style={{ flex: 1, padding: '4px 8px', overflowY: 'auto' }}>

        {/* Smart views — US-603 */}
        <NavItem icon="inbox" label="Inbox" count={inboxCount}
          active={pathname === '/inbox'} href="/inbox" />
        <NavItem icon="clock" label="Today" count={todayCount}
          active={pathname === '/today'} href="/today" />
        <NavItem icon="cal" label="Upcoming" count={upcomingCount}
          active={pathname === '/upcoming'} href="/upcoming" />
        <NavItem icon="alert" label="Issues"
          active={pathname === '/issues'} href="/issues" />

        {/* Starred boards — US-602 */}
        {starredBoards.length > 0 && (
          <>
            {!collapsed && <SectionHead>Starred</SectionHead>}
            {starredBoards.map(b => (
              <NavItem
                key={b.id}
                icon="star"
                label={b.name}
                active={b.id === currentBoardId}
                href={`/boards/${b.id}`}
              />
            ))}
          </>
        )}

        {/* Boards grouped by workspace — US-606 */}
        {workspaceGroups.length > 0 && (
          <>
            {!collapsed && <SectionHead showAdd>Boards</SectionHead>}
            {workspaceGroups.map(group => (
              <div key={group.id ?? 'personal'}>
                {!collapsed && workspaceGroups.length > 1 && (
                  <div style={{
                    padding: '6px 10px 2px',
                    fontSize: 10.5, fontWeight: 600,
                    color: T.textFaint, letterSpacing: '.04em',
                  }}>{group.name}</div>
                )}
                {group.boards.map(b => (
                  <NavItem
                    key={b.id}
                    label={b.name}
                    active={b.id === currentBoardId}
                    href={`/boards/${b.id}`}
                    count={b.taskCount ?? 0}
                  />
                ))}
              </div>
            ))}
          </>
        )}

        {visibleBoards.length === 0 && (
          <div style={{ padding: '20px 10px', fontSize: 12, color: T.textFaint, textAlign: 'center' }}>
            No boards yet.{' '}
            <a href="/boards" style={{ color: T.accent }}>Create one</a>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{
        padding: collapsed ? '10px 0' : '10px 12px',
        borderTop: `1px solid ${T.sidebarBorder}`,
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        flexDirection: collapsed ? 'column' : 'row',
        gap: 9, flexShrink: 0, position: 'relative',
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          background: T.accentSoft, color: T.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name="user" size={12} sw={1.5} />
        </div>
        {!collapsed && (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text, lineHeight: 1.1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.displayName || profile?.email || 'Account'}
              </div>
              {profile?.email && (
                <div style={{ fontSize: 10.5, color: T.textFaint, lineHeight: 1.1, marginTop: 2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile.email}
                </div>
              )}
            </div>
            <ThemeSwitcher />
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifOpen(o => !o)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: T.textMuted, display: 'inline-flex', alignItems: 'center',
                  padding: 2, borderRadius: 4, position: 'relative',
                }}
              >
                <Icon name="inbox" size={14} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -2, right: -2,
                    width: 14, height: 14, borderRadius: '50%',
                    background: T.danger, color: '#fff',
                    fontSize: 9, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>
              {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
            </div>
            <Icon name="cog" size={14} style={{ color: T.textMuted, cursor: 'pointer' }} />
          </>
        )}
        <button
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: T.textMuted, display: 'inline-flex', alignItems: 'center',
            padding: 2, borderRadius: 4,
          }}
        >
          <Icon name="logout" size={14} />
        </button>
      </div>
    </aside>
  )
}
