'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeName } from '@/lib/theme'

interface ThemeStore {
  theme: ThemeName
  setTheme: (name: ThemeName) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'kanban_theme' }
  )
)
