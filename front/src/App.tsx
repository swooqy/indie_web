import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import { BACKEND_ADDRESS } from './config/backend'

const CHAT_MESSAGES_ENDPOINT = import.meta.env.VITE_CHAT_MESSAGES_ENDPOINT ?? '/chat/messages'
const CHAT_MESSAGES_LIMIT = Number(import.meta.env.VITE_CHAT_MESSAGES_LIMIT ?? 10)

const normalizedMessagesEndpoint = CHAT_MESSAGES_ENDPOINT.startsWith('/')
  ? CHAT_MESSAGES_ENDPOINT
  : `/${CHAT_MESSAGES_ENDPOINT}`
const latestMessagesUrl = `${BACKEND_ADDRESS}${normalizedMessagesEndpoint}/${CHAT_MESSAGES_LIMIT}`

type ChatMessage = {
  id: number
  nickname: string
  text: string
  usernameColorHex?: string
}

type BackendChatMessage = {
  id: number
  content: string
  sender: {
    username: string
    colorHex: string
  }
}

function App() {
  const [nickname, setNickname] = useState('')
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    let isMounted = true

    const fetchLatestMessages = async () => {
      try {
        const response = await fetch(latestMessagesUrl)
        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.status}`)
        }

        const latestMessages: BackendChatMessage[] = await response.json()
        if (!isMounted) {
          return
        }

        setMessages(
          latestMessages
            .slice()
            .reverse()
            .map((message) => ({
              id: message.id,
              nickname: message.sender.username,
              text: message.content,
              usernameColorHex: message.sender.colorHex,
            })),
        )
      } catch (error) {
        console.error(error)
      }
    }

    void fetchLatestMessages()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedNickname = nickname.trim()
    const trimmedMessage = messageText.trim()

    if (!trimmedNickname || !trimmedMessage) {
      return
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: Date.now(),
        nickname: trimmedNickname,
        text: trimmedMessage,
      },
    ])
    setMessageText('')
  }

  return (
    <main className="chat-page">
      <h1>Simple Chat</h1>

      <section className="chat-window" aria-live="polite">
        {messages.length === 0 ? (
          <p className="empty-state">
            No messages yet. Add your nickname and write a message below.
          </p>
        ) : (
          <ul className="message-list">
            {messages.map((message) => (
              <li key={message.id} className="message-item">
                <span
                  className="message-nickname"
                  style={message.usernameColorHex ? { color: message.usernameColorHex } : undefined}
                >
                  {message.nickname}
                </span>
                <p className="message-text">{message.text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form className="chat-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="nickname">Nickname</label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            placeholder="Your name"
            maxLength={32}
          />
        </div>

        <div className="form-row">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            placeholder="Type your message..."
            rows={3}
            maxLength={400}
          />
        </div>

        <button type="submit">Send Message</button>
      </form>
    </main>
  )
}

export default App
