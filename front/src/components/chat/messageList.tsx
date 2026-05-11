import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../../services/chat/chatTypes'
import { MessageItem } from './messageItem'

type MessageListProps = {
  messages: ChatMessage[]
}

const NEAR_BOTTOM_OFFSET_PX = 100

export function MessageList({ messages }: MessageListProps) {
  const scrollContainerRef = useRef<HTMLElement | null>(null)
  const previousScrollHeightRef = useRef(0)

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) {
      return
    }

    const previousScrollHeight = previousScrollHeightRef.current
    const distanceFromBottomBeforeUpdate =
      previousScrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight
    const isNearBottom =
      previousScrollHeight === 0 || distanceFromBottomBeforeUpdate <= NEAR_BOTTOM_OFFSET_PX

    if (isNearBottom) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      })
    }

    previousScrollHeightRef.current = scrollContainer.scrollHeight
  }, [messages.length])

  return (
    <section className="chat-window" aria-live="polite" ref={scrollContainerRef}>
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
