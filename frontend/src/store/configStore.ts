import { create } from 'zustand'

interface ConfigState {
  columnColors: string[]
  columnColorMap: Record<string, string>
  setColumnColors: (colors: string[]) => void
  setColumnColorMap: (map: Record<string, string>) => void
}

export const useConfigStore = create<ConfigState>((set) => ({
  columnColors: [],
  columnColorMap: {},
  setColumnColors: (colors) => set({ columnColors: colors }),
  setColumnColorMap: (map) => set({ columnColorMap: map }),
}))
