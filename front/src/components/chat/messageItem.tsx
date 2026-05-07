import type { ChatMessage } from '../../services/chat/chatTypes'

type MessageItemProps = {
  message: ChatMessage
}

export function MessageItem({ message }: MessageItemProps) {
  return (
    <li className="message-item">
      <span
        className="message-nickname"
        style={message.userColorHex ? { color: message.userColorHex } : undefined}
      >
        {message.userName}
      </span>
      <p className="message-text">{message.content}</p>
    </li>
  )
}
