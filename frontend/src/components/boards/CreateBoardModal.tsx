'use client'
import { useState } from 'react'

interface Props {
  onClose: () => void
  onCreate: (name: string) => Promise<void>
}

export default function CreateBoardModal({ onClose, onCreate }: Props) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onCreate(name)
    setLoading(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
    }}>
      <form onSubmit={handleSubmit} style={{
        background: '#fff', borderRadius: 8, padding: 24, minWidth: 320,
        display: 'flex', flexDirection: 'column', gap: 12
      }}>
        <h2 style={{ margin: 0 }}>Create Board</h2>
        <input
          type="text"
          placeholder="Board name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          autoFocus
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" disabled={loading || !name.trim()}>
            {loading ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}
