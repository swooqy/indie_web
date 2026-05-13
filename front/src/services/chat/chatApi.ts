import { buildMessagesUrl, registerUserBaseUrl } from './chatConstants'
import type { ChatMessage } from './chatTypes'

const loadMessages = async (url: string) => {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.status}`)
  }

  return (await response.json()) as ChatMessage[]
}

export const loadLatestMessages = async () => loadMessages(buildMessagesUrl())

export const loadMessagesBefore = async (beforeId: number) =>
  loadMessages(buildMessagesUrl({ beforeId }))

export const registerUser = async (username: string) => {
  const response = await fetch(`${registerUserBaseUrl}/${encodeURIComponent(username)}`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to register user: ${response.status}`)
  }

  const uuid = (await response.json()) as string
  if (!uuid) {
    throw new Error('Backend returned an empty UUID.')
  }

  return uuid
}
