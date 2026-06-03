'use client'
import { T } from '@/lib/theme'
import IssuesPanel from '@/components/board/IssuesPanel'

export default function IssuesPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: T.bg,
      padding: '24px 20px 80px',
      maxWidth: 720,
      margin: '0 auto',
    }}>
      <h1 style={{
        fontSize: 20, fontWeight: 700, color: T.text,
        marginBottom: 20, letterSpacing: '-.01em',
      }}>
        Issues
      </h1>
      <IssuesPanel />
    </div>
  )
}
