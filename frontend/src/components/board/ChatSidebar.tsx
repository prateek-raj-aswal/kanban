'use client'
import { useRef, useEffect, useState } from 'react'
import { useAgentStore } from '@/store/agentStore'
import { sendChatMessage } from '@/lib/agentApi'
import { getToken } from '@/lib/auth'
import styles from './ChatSidebar.module.css'

interface Props {
  isOpen: boolean
}

export default function ChatSidebar({ isOpen }: Props) {
  const { messages, isLoading, addMessage, setLoading } = useAgentStore()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    bottomRef.current?.scrollIntoView?.({ behavior: 'smooth' })
  }, [messages, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    const jwt = getToken()
    if (!jwt) {
      addMessage({ role: 'assistant', content: 'Error: Not authenticated. Please log in again.' })
      return
    }
    setInput('')
    const outgoing = [...useAgentStore.getState().messages, { role: 'user' as const, content: trimmed }]
    addMessage({ role: 'user', content: trimmed })
    setLoading(true)
    try {
      const { reply } = await sendChatMessage(outgoing, jwt)
      addMessage({ role: 'assistant', content: reply })
    } catch {
      addMessage({ role: 'assistant', content: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h3 className={styles.title}>AI Assistant</h3>
      </div>

      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant}`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && <div className={styles.thinking}>Thinking…</div>}
        <div ref={bottomRef} />
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about your board…"
        />
        <button
          className={styles.sendBtn}
          type="submit"
          disabled={!input.trim() || isLoading}
        >
          Send
        </button>
      </form>
    </div>
  )
}
