'use client'
import { useEffect, useRef, useState } from 'react'
import { api, ApiError } from '@/lib/api'
import { T, darkenHex } from '@/lib/theme'
import { useIsMobile } from '@/lib/useIsMobile'
import type { CardResponse, LabelResponse, Priority, SubtaskResponse, CommentResponse, ActivityLogResponse, MemberResponse, AttachmentResponse } from '@/types/api'
import Icon from '@/components/ui/Icon'

const PRIORITIES: Priority[] = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']
const PRIORITY_COLOR: Record<Priority, string> = {
  NONE: '#94a3b8',
  LOW: '#3b82f6',
  MEDIUM: '#eab308',
  HIGH: '#f97316',
  URGENT: '#ef4444',
}

interface Props {
  card: CardResponse
  columnName: string
  boardId: string
  onClose: () => void
  onUpdate: (updated: CardResponse) => void
  onDelete: (cardId: string) => void
}

function LabelPill({ name, color, selected, onClick }: {
  name: string; color: string; selected?: boolean; onClick?: () => void
}) {
  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center',
        fontSize: 10.5, fontWeight: 600, letterSpacing: '.02em',
        padding: '2px 7px', borderRadius: 4,
        background: selected ? color + '50' : color + '28',
        color: darkenHex(color, 0.12),
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        cursor: onClick ? 'pointer' : 'default',
        outline: selected ? `2px solid ${color}` : 'none',
        outlineOffset: 1,
        userSelect: 'none',
      }}
    >
      {name}
    </span>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em',
      color: T.textFaint, textTransform: 'uppercase', marginBottom: 8,
    }}>{children}</div>
  )
}

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{
        fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em',
        color: T.textFaint, textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{ fontSize: 12.5, color: T.text }}>{children}</div>
    </div>
  )
}

export default function CardModal({ card, columnName, boardId, onClose, onUpdate, onDelete }: Props) {
  const isMobile = useIsMobile()
  const shortId = card.id.slice(0, 8).toUpperCase()

  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description ?? '')
  const [dueDate, setDueDate] = useState(card.dueDate ?? '')
  const [priority, setPriority] = useState<Priority>(card.priority ?? 'NONE')
  const [selectedLabelIds, setSelectedLabelIds] = useState<Set<string>>(
    new Set(card.labels.map(l => l.id))
  )
  const [boardLabels, setBoardLabels] = useState<LabelResponse[]>([])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [subtasks, setSubtasks] = useState<SubtaskResponse[]>([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [addingSubtask, setAddingSubtask] = useState(false)
  const [comments, setComments] = useState<CommentResponse[]>([])
  const [newComment, setNewComment] = useState('')
  const [postingComment, setPostingComment] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentBody, setEditingCommentBody] = useState('')
  const [activityLog, setActivityLog] = useState<ActivityLogResponse[]>([])
  const [leftTab, setLeftTab] = useState<'details' | 'activity'>('details')
  const [members, setMembers] = useState<MemberResponse[]>([])
  const [assignees, setAssignees] = useState<string[]>(card.assignees ?? [])
  const [assigneePickerOpen, setAssigneePickerOpen] = useState(false)
  const assigneePickerRef = useRef<HTMLDivElement>(null)
  const [attachments, setAttachments] = useState<AttachmentResponse[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [copyDone, setCopyDone] = useState(false)

  const isOverdue = dueDate ? new Date(dueDate) < new Date() : false

  useEffect(() => {
    api.get<LabelResponse[]>(`/api/v1/boards/${boardId}/labels`)
      .then(setBoardLabels)
      .catch(() => {})
    api.get<SubtaskResponse[]>(`/api/v1/cards/${card.id}/subtasks`)
      .then(setSubtasks)
      .catch(() => {})
    api.get<CommentResponse[]>(`/api/v1/cards/${card.id}/comments`)
      .then(setComments)
      .catch(() => {})
    api.get<ActivityLogResponse[]>(`/api/v1/cards/${card.id}/activity`)
      .then(setActivityLog)
      .catch(() => {})
    api.get<MemberResponse[]>(`/api/v1/boards/${boardId}/members`)
      .then(setMembers)
      .catch(() => {})
    api.get<AttachmentResponse[]>(`/api/v1/cards/${card.id}/attachments`)
      .then(setAttachments)
      .catch(() => {})
  }, [boardId, card.id])

  useEffect(() => {
    if (!assigneePickerOpen) return
    function handleClick(e: MouseEvent) {
      if (assigneePickerRef.current && !assigneePickerRef.current.contains(e.target as Node)) {
        setAssigneePickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [assigneePickerOpen])

  async function toggleAssignee(userId: string) {
    const isAssigned = assignees.includes(userId)
    try {
      if (isAssigned) {
        await api.delete(`/api/v1/cards/${card.id}/assignees/${userId}`)
        setAssignees(prev => prev.filter(id => id !== userId))
      } else {
        await api.post(`/api/v1/cards/${card.id}/assignees`, { userId })
        setAssignees(prev => [...prev, userId])
      }
    } catch { /* ignore */ }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    try {
      const att = await api.postForm<AttachmentResponse>(`/api/v1/cards/${card.id}/attachments`, form)
      setAttachments(prev => [...prev, att])
    } catch (err) {
      if (err instanceof ApiError) alert(err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function deleteAttachment(id: string) {
    try {
      await api.delete(`/api/v1/attachments/${id}`)
      setAttachments(prev => prev.filter(a => a.id !== id))
    } catch { /* ignore */ }
  }

  function copyLink() {
    const url = `${window.location.origin}/boards/${boardId}?card=${card.id}`
    navigator.clipboard.writeText(url).catch(() => {})
    setCopyDone(true)
    setTimeout(() => setCopyDone(false), 2000)
  }

  function toggleLabel(labelId: string) {
    setSelectedLabelIds(prev => {
      const next = new Set(prev)
      if (next.has(labelId)) next.delete(labelId)
      else next.add(labelId)
      return next
    })
    setDirty(true)
  }

  async function addSubtask(e: React.FormEvent) {
    e.preventDefault()
    const title = newSubtaskTitle.trim()
    if (!title) return
    setAddingSubtask(true)
    try {
      const s = await api.post<SubtaskResponse>(`/api/v1/cards/${card.id}/subtasks`, { title })
      setSubtasks(prev => [...prev, s])
      setNewSubtaskTitle('')
    } catch { /* ignore */ } finally {
      setAddingSubtask(false)
    }
  }

  async function toggleSubtask(id: string, completed: boolean) {
    try {
      const s = await api.patch<SubtaskResponse>(`/api/v1/subtasks/${id}`, { completed })
      setSubtasks(prev => prev.map(x => x.id === id ? s : x))
    } catch { /* ignore */ }
  }

  async function deleteSubtask(id: string) {
    try {
      await api.delete(`/api/v1/subtasks/${id}`)
      setSubtasks(prev => prev.filter(x => x.id !== id))
    } catch { /* ignore */ }
  }

  async function postComment(e: React.FormEvent) {
    e.preventDefault()
    const body = newComment.trim()
    if (!body) return
    setPostingComment(true)
    try {
      const c = await api.post<CommentResponse>(`/api/v1/cards/${card.id}/comments`, { body })
      setComments(prev => [...prev, c])
      setNewComment('')
    } catch { /* ignore */ } finally {
      setPostingComment(false)
    }
  }

  async function saveCommentEdit(id: string) {
    const body = editingCommentBody.trim()
    if (!body) return
    try {
      const c = await api.patch<CommentResponse>(`/api/v1/comments/${id}`, { body })
      setComments(prev => prev.map(x => x.id === id ? c : x))
    } catch { /* ignore */ } finally {
      setEditingCommentId(null)
    }
  }

  async function deleteComment(id: string) {
    try {
      await api.delete(`/api/v1/comments/${id}`)
      setComments(prev => prev.filter(x => x.id !== id))
    } catch { /* ignore */ }
  }

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    try {
      const updated = await api.patch<CardResponse>(`/api/v1/cards/${card.id}`, {
        title: title.trim(),
        description: description || null,
        dueDate: dueDate || null,
        priority,
        labelIds: Array.from(selectedLabelIds),
      })
      onUpdate(updated)
      setDirty(false)
    } catch (err) {
      if (err instanceof ApiError) alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this card?')) return
    setDeleting(true)
    try {
      await api.delete(`/api/v1/cards/${card.id}`)
      onDelete(card.id)
    } catch (err) {
      if (err instanceof ApiError) alert(err.message)
      setDeleting(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 50,
        backdropFilter: 'blur(2px)',
        overflowY: 'auto',
        padding: '16px 0',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={isMobile ? {
        position: 'fixed', bottom: 0, left: 0, right: 0,
        maxHeight: '90vh',
        background: T.card, color: T.text,
        borderRadius: '16px 16px 0 0',
        boxShadow: '0 -8px 32px rgba(0,0,0,.18)',
        border: `1px solid ${T.cardBorder}`,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        fontSize: 13,
      } : {
        width: 720,
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: '88vh',
        background: T.card,
        color: T.text,
        borderRadius: 12,
        boxShadow: '0 24px 80px rgba(0,0,0,.2), 0 1px 0 rgba(255,255,255,.04) inset',
        border: `1px solid ${T.cardBorder}`,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        fontSize: 13,
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px 12px',
          borderBottom: `1px solid ${T.cardBorder}`,
          display: 'flex', alignItems: 'flex-start', gap: 12,
          flexShrink: 0,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, color: T.textFaint, marginBottom: 8,
            }}>
              <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, letterSpacing: '.04em' }}>
                {shortId}
              </span>
              <Icon name="chevron" size={9} sw={2} />
              <span>{columnName}</span>
            </div>
            <input
              value={title}
              onChange={e => { setTitle(e.target.value); setDirty(true) }}
              style={{
                width: '100%', boxSizing: 'border-box',
                fontSize: 18, fontWeight: 600,
                color: T.text, letterSpacing: '-.01em',
                background: 'transparent', border: 'none', outline: 'none',
                fontFamily: 'inherit', padding: 0,
                borderBottom: `1px solid transparent`,
              }}
              onFocus={e => { e.currentTarget.style.borderBottomColor = T.accent }}
              onBlur={e => { e.currentTarget.style.borderBottomColor = 'transparent' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            {dirty && (
              <button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                style={{
                  height: 28, padding: '0 10px',
                  background: T.accent, color: T.accentText,
                  border: 'none', borderRadius: 6,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >{saving ? 'Saving…' : 'Save'}</button>
            )}
            <button
              onClick={copyLink}
              title="Copy link"
              style={{
                height: 28, padding: '0 9px',
                background: copyDone ? T.accentSoft : 'transparent',
                color: copyDone ? T.accent : T.textMuted,
                border: `1px solid ${T.cardBorder}`, borderRadius: 6,
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}
            >
              <Icon name={copyDone ? 'check' : 'link'} size={12} sw={1.6} />
              {copyDone ? 'Copied!' : 'Copy link'}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              title="Delete card"
              style={{
                height: 28, padding: '0 9px',
                background: 'transparent', color: T.danger,
                border: `1px solid ${T.cardBorder}`, borderRadius: 6,
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}
            >
              <Icon name="trash" size={12} sw={1.6} />
            </button>
            <button
              onClick={onClose}
              style={{
                width: 28, height: 28, background: 'transparent',
                color: T.textMuted, border: 'none', borderRadius: 6,
                fontSize: 18, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}
            >×</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', minHeight: 0, flex: 1, overflow: 'hidden', flexDirection: isMobile ? 'column-reverse' : 'row' }}>
          {/* Left: tabbed content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Tabs */}
            <div style={{
              display: 'flex', gap: 2, padding: '8px 16px 0',
              borderBottom: `1px solid ${T.cardBorder}`, flexShrink: 0,
            }}>
              {(['details', 'activity'] as const).map(tab => (
                <button key={tab} onClick={() => setLeftTab(tab)} style={{
                  padding: '6px 12px',
                  fontSize: 12, fontWeight: leftTab === tab ? 600 : 500,
                  color: leftTab === tab ? T.text : T.textMuted,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  borderBottom: leftTab === tab ? `2px solid ${T.accent}` : '2px solid transparent',
                  textTransform: 'capitalize', marginBottom: -1,
                }}>{tab}</button>
              ))}
            </div>

          {leftTab === 'details' ? (
          <div style={{
            flex: 1, padding: '18px 22px', display: 'flex', flexDirection: 'column',
            gap: 22, minWidth: 0, overflowY: 'auto',
          }}>
            <div>
              <SectionLabel>Description</SectionLabel>
              <textarea
                value={description}
                onChange={e => { setDescription(e.target.value); setDirty(true) }}
                placeholder="Add a description…"
                rows={4}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  fontSize: 13.5, lineHeight: 1.55,
                  color: T.text, background: T.canvas,
                  border: `1px solid ${T.cardBorder}`, borderRadius: 6,
                  padding: '8px 10px', resize: 'vertical',
                  outline: 'none', fontFamily: 'inherit',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = T.accent }}
                onBlur={e => { e.currentTarget.style.borderColor = T.cardBorder }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10, gap: 8 }}>
                <SectionLabel>Checklist</SectionLabel>
                {subtasks.length > 0 && (
                  <span style={{
                    fontSize: 10.5, fontWeight: 600, color: T.textFaint,
                    marginBottom: 8,
                  }}>
                    {subtasks.filter(s => s.completed).length}/{subtasks.length}
                  </span>
                )}
              </div>
              {subtasks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                  {subtasks.map(s => (
                    <div key={s.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '4px 6px', borderRadius: 5,
                    }}>
                      <input
                        type="checkbox"
                        checked={s.completed}
                        onChange={() => toggleSubtask(s.id, !s.completed)}
                        style={{ width: 14, height: 14, cursor: 'pointer', accentColor: T.accent }}
                      />
                      <span style={{
                        flex: 1, fontSize: 13, color: s.completed ? T.textFaint : T.text,
                        textDecoration: s.completed ? 'line-through' : 'none',
                      }}>{s.title}</span>
                      <button
                        onClick={() => deleteSubtask(s.id)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: T.textFaint, display: 'inline-flex', alignItems: 'center',
                          padding: 2, borderRadius: 3,
                        }}
                      >
                        <Icon name="trash" size={11} sw={1.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={addSubtask} style={{ display: 'flex', gap: 6 }}>
                <input
                  value={newSubtaskTitle}
                  onChange={e => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add subtask…"
                  style={{
                    flex: 1, height: 28, padding: '0 8px',
                    fontSize: 12, border: `1px solid ${T.cardBorder}`,
                    borderRadius: 5, background: T.card, color: T.text,
                    outline: 'none', fontFamily: 'inherit',
                  }}
                />
                <button
                  type="submit"
                  disabled={!newSubtaskTitle.trim() || addingSubtask}
                  style={{
                    height: 28, padding: '0 10px',
                    background: newSubtaskTitle.trim() ? T.accent : T.chipBg,
                    color: newSubtaskTitle.trim() ? T.accentText : T.textFaint,
                    border: 'none', borderRadius: 5,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >Add</button>
              </form>
            </div>

            {boardLabels.length > 0 && (
              <div>
                <SectionLabel>Labels</SectionLabel>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {boardLabels.map(l => (
                    <LabelPill
                      key={l.id}
                      name={l.name}
                      color={l.color}
                      selected={selectedLabelIds.has(l.id)}
                      onClick={() => toggleLabel(l.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <SectionLabel>Attachments {attachments.length > 0 ? `(${attachments.length})` : ''}</SectionLabel>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              {attachments.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                  {attachments.map(att => (
                    <div key={att.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 8px', borderRadius: 5,
                      background: T.canvas, border: `1px solid ${T.cardBorder}`,
                      fontSize: 12,
                    }}>
                      <Icon name="flag" size={12} sw={1.5} style={{ color: T.textMuted, flexShrink: 0 }} />
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ flex: 1, color: T.accent, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >{att.filename}</a>
                      <span style={{ fontSize: 10.5, color: T.textFaint, flexShrink: 0 }}>
                        {(att.sizeBytes / 1024).toFixed(0)}KB
                      </span>
                      <button
                        onClick={() => deleteAttachment(att.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.danger, padding: 2 }}
                      ><Icon name="trash" size={11} sw={1.5} /></button>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  height: 28, padding: '0 10px',
                  background: T.chipBg, color: T.textMuted,
                  border: `1px solid ${T.cardBorder}`, borderRadius: 5,
                  fontSize: 12, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontFamily: 'inherit',
                }}
              >
                <Icon name="plus" size={11} sw={2} />
                {uploading ? 'Uploading…' : 'Attach file'}
              </button>
            </div>

            <div>
              <SectionLabel>Comments {comments.length > 0 ? `(${comments.length})` : ''}</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
                {comments.map(c => (
                  <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: T.accentSoft, color: T.accent,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontSize: 10, fontWeight: 700,
                      }}>{c.authorName.charAt(0).toUpperCase()}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{c.authorName}</span>
                      <span style={{ fontSize: 11, color: T.textFaint, flex: 1 }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => { setEditingCommentId(c.id); setEditingCommentBody(c.body) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textFaint, padding: 2 }}
                      ><Icon name="flag" size={11} sw={1.5} /></button>
                      <button
                        onClick={() => deleteComment(c.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.danger, padding: 2 }}
                      ><Icon name="trash" size={11} sw={1.5} /></button>
                    </div>
                    {editingCommentId === c.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <textarea
                          value={editingCommentBody}
                          onChange={e => setEditingCommentBody(e.target.value)}
                          rows={2}
                          autoFocus
                          style={{
                            width: '100%', boxSizing: 'border-box',
                            padding: '6px 8px', fontSize: 13,
                            border: `1px solid ${T.accent}`, borderRadius: 5,
                            background: T.card, color: T.text,
                            resize: 'none', outline: 'none', fontFamily: 'inherit',
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveCommentEdit(c.id) }
                            if (e.key === 'Escape') setEditingCommentId(null)
                          }}
                        />
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => saveCommentEdit(c.id)}
                            style={{
                              height: 26, padding: '0 9px',
                              background: T.accent, color: T.accentText,
                              border: 'none', borderRadius: 5,
                              fontSize: 11, fontWeight: 600, cursor: 'pointer',
                            }}
                          >Save</button>
                          <button
                            onClick={() => setEditingCommentId(null)}
                            style={{
                              height: 26, padding: '0 9px',
                              background: T.chipBg, color: T.textMuted,
                              border: 'none', borderRadius: 5,
                              fontSize: 11, cursor: 'pointer',
                            }}
                          >Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p style={{
                        margin: 0, fontSize: 13, lineHeight: 1.5,
                        color: T.text, paddingLeft: 28,
                        whiteSpace: 'pre-wrap',
                      }}>{c.body}</p>
                    )}
                  </div>
                ))}
              </div>
              <form onSubmit={postComment} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Write a comment…"
                  rows={2}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '7px 10px', fontSize: 13,
                    border: `1px solid ${T.cardBorder}`, borderRadius: 5,
                    background: T.card, color: T.text,
                    resize: 'none', outline: 'none', fontFamily: 'inherit',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = T.accent }}
                  onBlur={e => { e.currentTarget.style.borderColor = T.cardBorder }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); postComment(e as unknown as React.FormEvent) }
                  }}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || postingComment}
                  style={{
                    alignSelf: 'flex-end', height: 28, padding: '0 12px',
                    background: newComment.trim() ? T.accent : T.chipBg,
                    color: newComment.trim() ? T.accentText : T.textFaint,
                    border: 'none', borderRadius: 5,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >Comment</button>
              </form>
            </div>
          </div>
          ) : (
          <div style={{
            flex: 1, padding: '16px 22px', overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {activityLog.length === 0 ? (
              <div style={{ fontSize: 13, color: T.textFaint, textAlign: 'center', paddingTop: 24 }}>
                No activity yet
              </div>
            ) : activityLog.map(entry => (
              <div key={entry.id} style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                padding: '8px 10px', borderRadius: 6,
                background: T.hover, fontSize: 12,
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: T.accentSoft, color: T.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                }}>{entry.actorName?.charAt(0).toUpperCase() ?? '?'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ color: T.text }}>{entry.summary}</span>
                  {entry.actorName && (
                    <span style={{ color: T.textMuted }}> by {entry.actorName}</span>
                  )}
                  <div style={{ fontSize: 10.5, color: T.textFaint, marginTop: 2 }}>
                    {new Date(entry.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
          </div>

          {/* Right: properties */}
          <div style={isMobile ? {
            flexShrink: 0,
            padding: '10px 16px',
            background: T.canvas,
            borderBottom: `1px solid ${T.cardBorder}`,
            display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 12,
            fontSize: 12, overflowX: 'auto',
          } : {
            width: 220, flexShrink: 0,
            padding: 18,
            background: T.canvas,
            borderLeft: `1px solid ${T.cardBorder}`,
            display: 'flex', flexDirection: 'column', gap: 16,
            fontSize: 12, overflowY: 'auto',
          }}>
            <PropRow label="Status">
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 8px', borderRadius: 4,
                background: T.selectedBg, color: T.selectedText,
                fontSize: 11.5, fontWeight: 600,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.selectedText }} />
                {columnName}
              </span>
            </PropRow>

            <PropRow label="Priority">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {PRIORITIES.map(p => (
                  <button
                    key={p}
                    onClick={() => { setPriority(p); setDirty(true) }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '3px 7px', borderRadius: 4, border: 'none',
                      fontSize: 10.5, fontWeight: 600, cursor: 'pointer',
                      letterSpacing: '.03em',
                      background: priority === p ? PRIORITY_COLOR[p] + '28' : T.chipBg,
                      color: priority === p ? PRIORITY_COLOR[p] : T.textMuted,
                      outline: priority === p ? `2px solid ${PRIORITY_COLOR[p]}` : 'none',
                      outlineOffset: 1,
                    }}
                  >
                    {p !== 'NONE' && (
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: PRIORITY_COLOR[p], flexShrink: 0,
                      }} />
                    )}
                    {p}
                  </button>
                ))}
              </div>
            </PropRow>

            <PropRow label="Due date">
              <input
                type="date"
                value={dueDate}
                onChange={e => { setDueDate(e.target.value); setDirty(true) }}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  height: 28, padding: '0 6px',
                  fontSize: 12, fontWeight: 500,
                  color: isOverdue ? T.danger : T.text,
                  background: isOverdue ? '#fee2e2' : T.card,
                  border: `1px solid ${T.cardBorder}`, borderRadius: 4,
                  outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
                }}
              />
            </PropRow>

            <PropRow label="Assignees">
              <div ref={assigneePickerRef} style={{ position: 'relative' }}>
                {/* Avatar stack */}
                <div
                  onClick={() => setAssigneePickerOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    cursor: 'pointer', flexWrap: 'wrap',
                  }}
                >
                  {assignees.length === 0 ? (
                    <span style={{
                      fontSize: 11.5, color: T.textFaint,
                      padding: '3px 7px', borderRadius: 4,
                      border: `1px dashed ${T.cardBorder}`,
                    }}>Add assignee</span>
                  ) : (() => {
                    const shown = assignees.slice(0, 3)
                    const overflow = assignees.length - 3
                    const memberMap = new Map(members.map(m => [m.userId, m]))
                    return (
                      <>
                        {shown.map(uid => {
                          const m = memberMap.get(uid)
                          const initials = m ? m.displayName.slice(0, 2).toUpperCase() : uid.slice(0, 2).toUpperCase()
                          return (
                            <span
                              key={uid}
                              title={m?.displayName ?? uid}
                              style={{
                                width: 24, height: 24, borderRadius: '50%',
                                background: T.accentSoft, color: T.accent,
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 10, fontWeight: 700, flexShrink: 0,
                                border: `2px solid ${T.card}`,
                                marginLeft: -4,
                              }}
                            >{initials}</span>
                          )
                        })}
                        {overflow > 0 && (
                          <span style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: T.chipBg, color: T.textMuted,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 9, fontWeight: 700,
                            border: `2px solid ${T.card}`,
                            marginLeft: -4,
                          }}>+{overflow}</span>
                        )}
                      </>
                    )
                  })()}
                </div>

                {/* Picker dropdown */}
                {assigneePickerOpen && members.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, zIndex: 100,
                    background: T.card, border: `1px solid ${T.cardBorder}`,
                    borderRadius: 7, boxShadow: '0 4px 12px rgba(0,0,0,.14)',
                    minWidth: 180, padding: '4px 0', marginTop: 4,
                    maxHeight: 200, overflowY: 'auto',
                  }}>
                    {members.map(m => {
                      const checked = assignees.includes(m.userId)
                      return (
                        <div
                          key={m.userId}
                          onClick={() => toggleAssignee(m.userId)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '6px 10px', cursor: 'pointer',
                            background: checked ? T.selectedBg : 'transparent',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            readOnly
                            style={{ width: 13, height: 13, accentColor: T.accent }}
                          />
                          <span style={{
                            width: 22, height: 22, borderRadius: '50%',
                            background: T.accentSoft, color: T.accent,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 700, flexShrink: 0,
                          }}>{m.displayName.slice(0, 2).toUpperCase()}</span>
                          <span style={{ fontSize: 12, color: T.text }}>{m.displayName || m.email}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </PropRow>

            {selectedLabelIds.size > 0 && (
              <PropRow label="Labels">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {boardLabels.filter(l => selectedLabelIds.has(l.id)).map(l => (
                    <LabelPill key={l.id} name={l.name} color={l.color} />
                  ))}
                </div>
              </PropRow>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
