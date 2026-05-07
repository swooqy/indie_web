export type ChatMessage = {
  id: number | null
  content: string
  createdAt: string
  userName: string
  userId: number
  userColorHex: string
}

export type WebSocketError = {
  message?: string
}
