'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { T } from '@/lib/theme'
import Icon from '@/components/ui/Icon'
import type { WorkspaceResponse, MemberResponse } from '@/types/api'
import { useWorkspaceStore } from '@/store/workspaceStore'

interface Props {
  workspace: WorkspaceResponse
  onClose: () => void
  onUpdated: (ws: WorkspaceResponse) => void
  onDeleted: () => void
}

export default function WorkspaceManageModal({ workspace, onClose, onUpdated, onDeleted }: Props) {
  const isOwner = workspace.role === 'OWNER'
  const { workspaces, setWorkspaces, setActiveWorkspace } = useWorkspaceStore()

  // Rename state
  const [name, setName] = useState(workspace.name)
  const [renameError, setRenameError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Delete confirmation state
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Members state
  const canManageMembers = workspace.role === 'OWNER' || workspace.role === 'ADMIN'
  const [members, setMembers] = useState<MemberResponse[]>([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [addEmail, setAddEmail] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [roleErrors, setRoleErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false
    api.get<MemberResponse[]>(`/api/v1/workspaces/${workspace.id}/members`)
      .then(data => { if (!cancelled) setMembers(data) })
      .catch(() => { /* silently ignore */ })
      .finally(() => { if (!cancelled) setMembersLoading(false) })
    return () => { cancelled = true }
  }, [workspace.id])

  async function handleAddMember() {
    if (!addEmail.trim()) return
    setAdding(true)
    setAddError(null)
    try {
      const member = await api.post<MemberResponse>(`/api/v1/workspaces/${workspace.id}/members`, { email: addEmail.trim() })
      setMembers(prev => [...prev, member])
      setAddEmail('')
    } catch (e: unknown) {
      setAddError(e instanceof Error ? e.message : 'Failed to add member')
    } finally {
      setAdding(false)
    }
  }

  async function handleRemoveMember(userId: string) {
    try {
      await api.delete(`/api/v1/workspaces/${workspace.id}/members/${userId}`)
      setMembers(prev => prev.filter(m => m.userId !== userId))
    } catch {
      // swallow for now; could surface inline error per row
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    const prev = members.map(m => m)
    // Optimistic update
    setMembers(current => current.map(m => m.userId === userId ? { ...m, role: newRole } : m))
    setRoleErrors(e => { const next = { ...e }; delete next[userId]; return next })
    try {
      await api.patch(`/api/v1/workspaces/${workspace.id}/members/${userId}/role`, { role: newRole })
    } catch (e: unknown) {
      // Rollback
      setMembers(prev)
      setRoleErrors(err => ({ ...err, [userId]: e instanceof Error ? e.message : 'Failed to update role' }))
    }
  }

  // Create workspace state
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  async function handleRename() {
    if (!name.trim() || name.trim() === workspace.name) return
    setSaving(true)
    setRenameError(null)

    // Optimistic update in store
    const prev = workspaces.map(w => w)
    const optimistic = workspaces.map(w => w.id === workspace.id ? { ...w, name: name.trim() } : w)
    setWorkspaces(optimistic)

    try {
      const updated = await api.patch<WorkspaceResponse>(`/api/v1/workspaces/${workspace.id}`, { name: name.trim() })
      onUpdated(updated)
    } catch (e: unknown) {
      // Rollback
      setWorkspaces(prev)
      setName(workspace.name)
      const msg = e instanceof Error ? e.message : 'Failed to rename workspace'
      setRenameError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await api.delete(`/api/v1/workspaces/${workspace.id}`)
      // Remove from store
      setWorkspaces(workspaces.filter(w => w.id !== workspace.id))
      setActiveWorkspace(null)
      onDeleted()
    } catch (e: unknown) {
      setDeleting(false)
      setConfirmDelete(false)
      const msg = e instanceof Error ? e.message : 'Failed to delete workspace'
      setRenameError(msg)
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    setCreateError(null)
    try {
      const created = await api.post<WorkspaceResponse>('/api/v1/workspaces', { name: newName.trim() })
      setWorkspaces([...workspaces, created])
      setNewName('')
      setShowCreate(false)
      onUpdated(created)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create workspace'
      setCreateError(msg)
    } finally {
      setCreating(false)
    }
  }

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 16,
  }

  const modalStyle: React.CSSProperties = {
    background: T.card, border: `1px solid ${T.cardBorder}`,
    borderRadius: 12, boxShadow: T.cardShadow,
    width: '100%', maxWidth: 420,
    padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: T.textFaint,
    textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4,
  }

  const inputStyle = (disabled: boolean): React.CSSProperties => ({
    width: '100%', padding: '8px 10px', fontSize: 14,
    background: disabled ? T.hover : T.card,
    border: `1px solid ${T.cardBorder}`, borderRadius: 6,
    color: disabled ? T.textMuted : T.text,
    cursor: disabled ? 'not-allowed' : 'text',
    boxSizing: 'border-box',
  })

  const btnPrimary: React.CSSProperties = {
    padding: '7px 16px', fontSize: 13, fontWeight: 600,
    background: T.accent, color: T.accentText,
    border: 'none', borderRadius: 6, cursor: 'pointer',
  }

  const btnDanger: React.CSSProperties = {
    padding: '7px 16px', fontSize: 13, fontWeight: 600,
    background: 'none', color: T.danger,
    border: `1px solid ${T.danger}`, borderRadius: 6, cursor: 'pointer',
  }

  const btnDangerDisabled: React.CSSProperties = {
    ...btnDanger,
    opacity: 0.4, cursor: 'not-allowed',
  }

  const btnSecondary: React.CSSProperties = {
    padding: '7px 16px', fontSize: 13,
    background: 'none', color: T.textMuted,
    border: `1px solid ${T.cardBorder}`, borderRadius: 6, cursor: 'pointer',
  }

  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={modalStyle} role="dialog" aria-modal="true" aria-label="Manage workspace">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>
            Manage Workspace
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, display: 'flex', alignItems: 'center' }}
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Current workspace name (read display) */}
        <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>
          {workspace.name}
        </div>

        {/* Rename section */}
        <div>
          <div style={labelStyle}>Rename</div>
          <input
            type="text"
            placeholder="Workspace name"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={!isOwner}
            style={inputStyle(!isOwner)}
          />
          {renameError && (
            <div style={{ fontSize: 12, color: T.danger, marginTop: 4 }}>{renameError}</div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              onClick={handleRename}
              disabled={!isOwner || saving || !name.trim() || name.trim() === workspace.name}
              aria-label="Save"
              style={{
                ...btnPrimary,
                opacity: (!isOwner || saving || !name.trim() || name.trim() === workspace.name) ? 0.5 : 1,
                cursor: (!isOwner || saving || !name.trim() || name.trim() === workspace.name) ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: `1px solid ${T.cardBorder}` }} />

        {/* Create new workspace */}
        {!showCreate ? (
          <button
            onClick={() => setShowCreate(true)}
            style={btnSecondary}
          >
            + Create new workspace
          </button>
        ) : (
          <div>
            <div style={labelStyle}>New workspace name</div>
            <input
              type="text"
              placeholder="Workspace name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              style={inputStyle(false)}
            />
            {createError && (
              <div style={{ fontSize: 12, color: T.danger, marginTop: 4 }}>{createError}</div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={() => { setShowCreate(false); setNewName(''); setCreateError(null) }} style={btnSecondary}>
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                style={{ ...btnPrimary, opacity: (creating || !newName.trim()) ? 0.5 : 1 }}
              >
                {creating ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ borderTop: `1px solid ${T.cardBorder}` }} />

        {/* Members section */}
        <div>
          <div style={labelStyle}>Members</div>

          {/* Member rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10, maxHeight: 180, overflowY: 'auto' }}>
            {membersLoading ? (
              <div style={{ fontSize: 13, color: T.textMuted }}>Loading…</div>
            ) : members.length === 0 ? (
              <div style={{ fontSize: 13, color: T.textMuted }}>No members yet.</div>
            ) : members.map(m => (
              <div key={m.userId} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.displayName}
                    </div>
                    <div style={{ fontSize: 11, color: T.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.email}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {canManageMembers ? (
                      <select
                        aria-label={`Role for ${m.displayName}`}
                        value={m.role}
                        onChange={e => handleRoleChange(m.userId, e.target.value)}
                        style={{
                          fontSize: 12, padding: '2px 4px',
                          background: T.card, border: `1px solid ${T.cardBorder}`,
                          borderRadius: 4, color: T.text,
                          cursor: 'pointer', outline: 'none',
                        }}
                      >
                        <option value="OWNER" disabled={workspace.role !== 'OWNER'}>OWNER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="MEMBER">MEMBER</option>
                        <option value="VIEWER">VIEWER</option>
                      </select>
                    ) : (
                      <span style={{
                        fontSize: 10, fontWeight: 600, letterSpacing: '.04em',
                        textTransform: 'uppercase',
                        padding: '2px 6px', borderRadius: 4,
                        background: T.chipBg, color: T.textMuted,
                      }}>
                        {m.role}
                      </span>
                    )}
                    <button
                      aria-label={`Remove ${m.displayName}`}
                      disabled={!canManageMembers}
                      onClick={() => canManageMembers && handleRemoveMember(m.userId)}
                      style={{
                        background: 'none', border: 'none', cursor: canManageMembers ? 'pointer' : 'not-allowed',
                        color: T.danger, opacity: canManageMembers ? 1 : 0.35,
                        padding: '2px 6px', borderRadius: 4, fontSize: 12, flexShrink: 0,
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {roleErrors[m.userId] && (
                  <div style={{ fontSize: 11, color: T.danger, paddingLeft: 2 }}>{roleErrors[m.userId]}</div>
                )}
              </div>
            ))}
          </div>

          {/* Add member form */}
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="email"
              placeholder="Add by email"
              value={addEmail}
              onChange={e => setAddEmail(e.target.value)}
              disabled={!canManageMembers}
              style={{ ...inputStyle(!canManageMembers), flex: 1 }}
              onKeyDown={e => { if (e.key === 'Enter') handleAddMember() }}
            />
            <button
              aria-label="Add member"
              onClick={handleAddMember}
              disabled={!canManageMembers || adding || !addEmail.trim()}
              style={{
                ...btnPrimary,
                opacity: (!canManageMembers || adding || !addEmail.trim()) ? 0.5 : 1,
                cursor: (!canManageMembers || adding || !addEmail.trim()) ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {adding ? 'Adding…' : 'Add member'}
            </button>
          </div>
          {addError && (
            <div style={{ fontSize: 12, color: T.danger, marginTop: 4 }}>{addError}</div>
          )}
        </div>

        {/* Divider */}
        <div style={{ borderTop: `1px solid ${T.cardBorder}` }} />

        {/* Delete section */}
        {!confirmDelete ? (
          <button
            onClick={() => isOwner && setConfirmDelete(true)}
            disabled={!isOwner}
            aria-label="Delete workspace"
            style={isOwner ? btnDanger : btnDangerDisabled}
          >
            Delete workspace
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 13, color: T.danger, fontWeight: 500 }}>
              Are you sure? This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(false)} style={btnSecondary} disabled={deleting}>
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                aria-label="Confirm delete"
                style={{ ...btnDanger, opacity: deleting ? 0.5 : 1 }}
              >
                {deleting ? 'Deleting…' : 'Confirm delete'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
