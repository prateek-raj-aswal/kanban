'use client'
import { create } from 'zustand'
import type { WorkspaceResponse } from '@/types/api'

interface WorkspaceStore {
  workspaces: WorkspaceResponse[]
  activeWorkspaceId: string | null
  setWorkspaces: (ws: WorkspaceResponse[]) => void
  setActiveWorkspace: (id: string | null) => void
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  workspaces: [],
  activeWorkspaceId: null,
  setWorkspaces: (workspaces) => set({ workspaces }),
  setActiveWorkspace: (activeWorkspaceId) => set({ activeWorkspaceId }),
}))
