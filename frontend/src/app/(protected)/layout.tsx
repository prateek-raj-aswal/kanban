'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login')
    }
  }, [router])

  return <>{children}</>
}
