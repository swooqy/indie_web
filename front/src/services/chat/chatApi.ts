import { latestMessagesUrl, registerUserBaseUrl } from './chatConstants'
import type { ChatMessage } from './chatTypes'

export const loadLatestMessages = async () => {
  const response = await fetch(latestMessagesUrl, { credentials: 'include' })
  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.status}`)
  }

  return (await response.json()) as ChatMessage[]
}

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
