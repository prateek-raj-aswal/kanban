'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import BottomNav from '@/components/ui/BottomNav'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login')
      return
    }
    setReady(true)
  }, [router])

  // Listen for session expiry events dispatched by api.ts
  useEffect(() => {
    function handleUnauthorized() {
      router.replace('/login')
    }
    window.addEventListener('kanban:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('kanban:unauthorized', handleUnauthorized)
  }, [router])

  if (!ready) return null
  return (
    <>
      {children}
      <BottomNav />
    </>
  )
}
