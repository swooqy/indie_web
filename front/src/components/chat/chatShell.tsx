import type { ReactNode } from 'react'

type ChatShellProps = {
  children: ReactNode
  title?: string
}

export function ChatShell({ children, title = 'Simple Chat' }: ChatShellProps) {
  return (
    <main className="chat-page">
      <h1>{title}</h1>
      {children}
    </main>
  )
}
