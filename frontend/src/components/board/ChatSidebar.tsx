'use client'
import { useRef, useEffect, useState } from 'react'
import { useAgentStore } from '@/store/agentStore'
import { T } from '@/lib/theme'

interface Props {
  isOpen: boolean
  onSend?: (message: string) => void
}

export default function ChatSidebar({ isOpen, onSend }: Props) {
  const { messages, isLoading } = useAgentStore()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    bottomRef.current?.scrollIntoView?.({ behavior: 'smooth' })
  }, [messages, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    onSend?.(trimmed)
    setInput('')
  }

  return (
    <div style={{
      width: 320,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: T.sidebar,
      borderLeft: `1px solid ${T.cardBorder}`,
    }}>
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.cardBorder}` }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.text }}>
          AI Assistant
        </h3>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              padding: '8px 12px',
              borderRadius: 8,
              background: msg.role === 'user' ? T.accent : T.card,
              color: msg.role === 'user' ? '#fff' : T.text,
              fontSize: 13,
              lineHeight: 1.5,
              wordBreak: 'break-word',
            }}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div style={{ alignSelf: 'flex-start', color: T.textMuted, fontSize: 13 }}>
            Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          padding: '12px',
          borderTop: `1px solid ${T.cardBorder}`,
          display: 'flex',
          gap: 8,
        }}
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about your board…"
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 6,
            border: `1px solid ${T.cardBorder}`,
            background: T.card,
            color: T.text,
            fontSize: 13,
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          style={{
            padding: '8px 14px',
            borderRadius: 6,
            border: 'none',
            background: T.accent,
            color: '#fff',
            fontSize: 13,
            cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
            opacity: !input.trim() || isLoading ? 0.6 : 1,
          }}
        >
          Send
        </button>
      </form>
    </div>
  )
}
