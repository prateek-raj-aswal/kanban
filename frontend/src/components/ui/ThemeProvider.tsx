'use client'
import { useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { applyTheme } from '@/lib/theme'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore(s => s.theme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return <>{children}</>
}
