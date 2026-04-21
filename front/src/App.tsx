import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type ChatMessage = {
  id: number
  nickname: string
  text: string
}

function App() {
  const [nickname, setNickname] = useState('')
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])

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
                <span className="message-nickname">{message.nickname}</span>
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
