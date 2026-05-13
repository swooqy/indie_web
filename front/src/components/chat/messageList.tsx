import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../../services/chat/chatTypes'
import { MessageItem } from './messageItem'

type MessageListProps = {
  messages: ChatMessage[]
  onLoadOlderMessages: () => Promise<void> | void
  isLoadingOlderMessages: boolean
  hasMoreMessages: boolean
}

const NEAR_BOTTOM_OFFSET_PX = 100
const NEAR_TOP_OFFSET_PX = 80

export function MessageList({
  messages,
  onLoadOlderMessages,
  isLoadingOlderMessages,
  hasMoreMessages,
}: MessageListProps) {
  const scrollContainerRef = useRef<HTMLElement | null>(null)
  const previousScrollHeightRef = useRef(0)
  const scrollRestoreSnapshotRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null)
  const isProgrammaticScrollRef = useRef(false)
  const hasUserInteractedWithScrollRef = useRef(false)

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) {
      return
    }

    const scrollRestoreSnapshot = scrollRestoreSnapshotRef.current
    if (scrollRestoreSnapshot) {
      scrollContainer.scrollTop =
        scrollContainer.scrollHeight - scrollRestoreSnapshot.scrollHeight + scrollRestoreSnapshot.scrollTop
      scrollRestoreSnapshotRef.current = null
      previousScrollHeightRef.current = scrollContainer.scrollHeight
      return
    }

    const previousScrollHeight = previousScrollHeightRef.current
    const distanceFromBottomBeforeUpdate =
      previousScrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight
    const isNearBottom =
      previousScrollHeight === 0 || distanceFromBottomBeforeUpdate <= NEAR_BOTTOM_OFFSET_PX

    if (isNearBottom) {
      isProgrammaticScrollRef.current = true
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: previousScrollHeight === 0 ? 'auto' : 'smooth',
      })
      window.setTimeout(() => {
        isProgrammaticScrollRef.current = false
      }, 100)
    }

    previousScrollHeightRef.current = scrollContainer.scrollHeight
  }, [hasMoreMessages, messages.length])

  const handleScroll = () => {
    const scrollContainer = scrollContainerRef.current
    if (
      !scrollContainer ||
      isProgrammaticScrollRef.current ||
      !hasUserInteractedWithScrollRef.current ||
      scrollContainer.scrollTop > NEAR_TOP_OFFSET_PX ||
      isLoadingOlderMessages ||
      !hasMoreMessages ||
      messages.length === 0
    ) {
      return
    }

    scrollRestoreSnapshotRef.current = {
      scrollHeight: scrollContainer.scrollHeight,
      scrollTop: scrollContainer.scrollTop,
    }
    void onLoadOlderMessages()
  }

  const markUserScrollInteraction = () => {
    hasUserInteractedWithScrollRef.current = true
  }

  return (
    <section
      className="chat-window"
      aria-live="polite"
      ref={scrollContainerRef}
      onScroll={handleScroll}
      onWheel={markUserScrollInteraction}
      onTouchMove={markUserScrollInteraction}
      onPointerDown={markUserScrollInteraction}
    >
      {messages.length === 0 ? (
        <p className="empty-state">No messages yet. Add your nickname and write a message below.</p>
      ) : (
        <ul className="message-list">
          {isLoadingOlderMessages ? (
            <li className="message-history-status">Loading older messages...</li>
          ) : null}
          {messages.map((message, index) => (
            <MessageItem key={message.id ?? `${message.createdAt}-${message.userId}-${index}`} message={message} />
          ))}
        </ul>
      )}
    </section>
  )
}
