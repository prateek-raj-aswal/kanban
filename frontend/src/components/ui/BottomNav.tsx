'use client'
import { usePathname, useRouter } from 'next/navigation'
import { T } from '@/lib/theme'
import Icon from './Icon'
import { useIsMobile } from '@/lib/useIsMobile'
import { useAuthStore } from '@/store/authStore'

const TABS = [
  { id: 'board',    icon: 'grid'     as const, label: 'Board',    href: '/boards' },
  { id: 'today',    icon: 'clock'    as const, label: 'Today',    href: '/today' },
  { id: 'timeline', icon: 'timeline' as const, label: 'Timeline', href: '/boards' },
  { id: 'inbox',    icon: 'msg'      as const, label: 'Inbox',    href: '/inbox' },
]

export default function BottomNav() {
  const isMobile = useIsMobile()
  const pathname = usePathname()
  const router = useRouter()
  const logout = useAuthStore(s => s.logout)

  function handleLogout() {
    logout()
    router.push('/login')
  }

  if (!isMobile) return null

  function isActive(tab: typeof TABS[number]): boolean {
    if (tab.id === 'board') return pathname.startsWith('/boards') && !pathname.includes('/timeline') && !pathname.includes('/calendar')
    if (tab.id === 'timeline') return pathname.includes('/timeline')
    return pathname.startsWith(tab.href) && tab.href !== '/boards'
  }

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 56, background: T.topbar,
      borderTop: `1px solid ${T.topbarBorder}`,
      display: 'flex', alignItems: 'stretch',
      zIndex: 100,
      fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    }}>
      {TABS.map(tab => {
        const active = isActive(tab)
        return (
          <a
            key={tab.id}
            href={tab.href}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 3,
              color: active ? T.accent : T.textMuted,
              textDecoration: 'none', fontSize: 10, fontWeight: 500,
              background: 'transparent',
            }}
          >
            <Icon name={tab.icon} size={20} sw={active ? 2.2 : 1.7} />
            {tab.label}
          </a>
        )
      })}
      <button
        onClick={handleLogout}
        aria-label="Log out"
        style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 3,
          color: T.textMuted, fontSize: 10, fontWeight: 500,
          background: 'transparent', border: 'none', cursor: 'pointer',
        }}
      >
        <Icon name="logout" size={20} sw={1.7} />
        Log out
      </button>
    </nav>
  )
}
