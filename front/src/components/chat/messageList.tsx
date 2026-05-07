import type { ChatMessage } from '../../services/chat/chatTypes'
import { MessageItem } from './messageItem'

type MessageListProps = {
  messages: ChatMessage[]
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <section className="chat-window" aria-live="polite">
      {messages.length === 0 ? (
        <p className="empty-state">No messages yet. Add your nickname and write a message below.</p>
      ) : (
        <ul className="message-list">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
        </ul>
      )}
    </section>
  )
}
