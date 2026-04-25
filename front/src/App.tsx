import { Client, type IFrame, type IMessage } from '@stomp/stompjs'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import { BACKEND_ADDRESS, WEBSOCKET_ADDRESS } from './config/backend'

const CHAT_MESSAGES_ENDPOINT = import.meta.env.VITE_CHAT_MESSAGES_ENDPOINT ?? '/chat/messages'
const CHAT_MESSAGES_LIMIT = Number(import.meta.env.VITE_CHAT_MESSAGES_LIMIT ?? 10)
const REGISTER_USER_ENDPOINT = '/users/register'
const CHAT_SEND_DESTINATION = '/api/topic/chat'
const CHAT_SUBSCRIPTION_DESTINATION = '/topic/chat/messages'
const ERROR_SUBSCRIPTION_DESTINATION = '/user/topic/user/errors'
const USER_UUID_COOKIE = 'user_uuid'
const USER_NAME_COOKIE = 'user_name'
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

const normalizedMessagesEndpoint = CHAT_MESSAGES_ENDPOINT.startsWith('/')
  ? CHAT_MESSAGES_ENDPOINT
  : `/${CHAT_MESSAGES_ENDPOINT}`
const latestMessagesUrl = `${BACKEND_ADDRESS}${normalizedMessagesEndpoint}/${CHAT_MESSAGES_LIMIT}`
const registerUserBaseUrl = `${BACKEND_ADDRESS}${REGISTER_USER_ENDPOINT}`

type ChatMessage = {
  id: string
  nickname: string
  text: string
  usernameColorHex?: string
}

type BackendChatMessage = {
  id: number | null
  content: string
  sender: {
    username: string
    colorHex: string
  }
}

type WebSocketError = {
  message?: string
}

const getCookieValue = (name: string) => {
  const encodedName = `${encodeURIComponent(name)}=`
  const match = document.cookie
    .split(';')
    .map((segment) => segment.trim())
    .find((segment) => segment.startsWith(encodedName))
  if (!match) {
    return null
  }
  return decodeURIComponent(match.slice(encodedName.length).replace(/\+/g, ' '))
}

const setCookieValue = (name: string, value: string) => {
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`
}

const mapBackendMessage = (message: BackendChatMessage, fallbackId: string): ChatMessage => ({
  id: message.id == null ? fallbackId : String(message.id),
  nickname: message.sender.username,
  text: message.content,
  usernameColorHex: message.sender.colorHex,
})

function App() {
  const [nickname, setNickname] = useState('')
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [errorText, setErrorText] = useState('')
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const nextRealtimeMessageId = useRef(0)
  const stompClientRef = useRef<Client | null>(null)

  useEffect(() => {
    let isMounted = true
    const wsClient = new Client({
      brokerURL: WEBSOCKET_ADDRESS,
      reconnectDelay: 5000,
      onConnect: () => {
        if (!isMounted) {
          return
        }
        setIsSocketConnected(true)
        wsClient.subscribe(CHAT_SUBSCRIPTION_DESTINATION, (frame: IMessage) => {
          const payload = JSON.parse(frame.body) as BackendChatMessage
          const fallbackId = `realtime-${Date.now()}-${nextRealtimeMessageId.current}`
          nextRealtimeMessageId.current += 1
          setMessages((currentMessages) => [...currentMessages, mapBackendMessage(payload, fallbackId)])
        })
        wsClient.subscribe(ERROR_SUBSCRIPTION_DESTINATION, (frame: IMessage) => {
          const payload = JSON.parse(frame.body) as WebSocketError
          setErrorText(payload.message ?? 'Unable to send message.')
        })
      },
      onDisconnect: () => {
        if (!isMounted) {
          return
        }
        setIsSocketConnected(false)
      },
      onWebSocketClose: () => {
        if (!isMounted) {
          return
        }
        setIsSocketConnected(false)
      },
      onStompError: (frame: IFrame) => {
        if (!isMounted) {
          return
        }
        setErrorText(frame.headers.message ?? 'WebSocket broker rejected the message.')
      },
    })

    const initialize = async () => {
      const usernameFromCookie = getCookieValue(USER_NAME_COOKIE)
      if (usernameFromCookie) {
        setNickname(usernameFromCookie)
      }

      try {
        const response = await fetch(latestMessagesUrl, { credentials: 'include' })
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
            .map((message, index) => mapBackendMessage(message, `history-${index}`)),
        )
      } catch (error) {
        console.error(error)
      } finally {
        if (isMounted) {
          stompClientRef.current = wsClient
          wsClient.activate()
        }
      }
    }

    void initialize()

    return () => {
      isMounted = false
      stompClientRef.current = null
      void wsClient.deactivate()
    }
  }, [])

  const registerUser = async (username: string) => {
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

    setCookieValue(USER_UUID_COOKIE, uuid)
    setCookieValue(USER_NAME_COOKIE, username)
    return uuid
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedNickname = nickname.trim()
    const trimmedMessage = messageText.trim()

    if (!trimmedNickname || !trimmedMessage) {
      return
    }

    const wsClient = stompClientRef.current
    if (!wsClient || !wsClient.connected) {
      setErrorText('Realtime connection is not ready yet.')
      return
    }

    setIsSubmitting(true)
    try {
      let uuid = getCookieValue(USER_UUID_COOKIE)
      if (!uuid) {
        uuid = await registerUser(trimmedNickname)
      }

      setCookieValue(USER_NAME_COOKIE, trimmedNickname)
      wsClient.publish({
        destination: CHAT_SEND_DESTINATION,
        body: JSON.stringify({
          message: trimmedMessage,
          username: trimmedNickname,
          uuid,
        }),
      })
      setMessageText('')
      setErrorText('')
    } catch (error) {
      console.error(error)
      setErrorText('Unable to send your message right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isSendDisabled = !nickname.trim() || !messageText.trim() || isSubmitting

  return (
    <main className="chat-page">
      <h1>Simple Chat</h1>
      <p className="connection-status">
        Status: {isSocketConnected ? 'Connected to realtime chat' : 'Connecting to realtime chat...'}
      </p>
      {errorText ? <p className="error-text">{errorText}</p> : null}

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

        <button type="submit" disabled={isSendDisabled}>
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </main>
  )
}

export default App
