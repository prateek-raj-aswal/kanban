import './globals.css'
import type { Metadata } from 'next'
import ThemeProvider from '@/components/ui/ThemeProvider'

export const metadata: Metadata = {
  title: 'Kanban',
  description: 'Collaborative Kanban board',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
