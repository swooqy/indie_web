import { useCallback, useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { useChatSocket } from './useChatSocket'
import { registerUser, loadLatestMessages, loadMessagesBefore } from '../services/chat/chatApi'
import { userNameCookie, userUuidCookie } from '../services/chat/chatCookies'
import { CHAT_SEND_DESTINATION, chatMessagesLimit } from '../services/chat/chatConstants'
import type { ChatMessage } from '../services/chat/chatTypes'

const toChronologicalMessages = (messages: ChatMessage[]) => messages.slice().reverse()

const getOldestMessageId = (messages: ChatMessage[]) =>
  messages.find((message) => message.id !== null)?.id ?? null

export function useChatSession() {
  const [nickname, setNickname] = useState('')
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [errorText, setErrorText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [isSocketEnabled, setIsSocketEnabled] = useState(false)
  const isLoadingOlderMessagesRef = useRef(false)

  const onChatMessage = useCallback((payload: ChatMessage) => {
    setMessages((currentMessages) => [...currentMessages, payload])
  }, [])

  const onSocketError = useCallback((message: string) => {
    setErrorText(message)
  }, [])

  const { isConnected: isSocketConnected, publishMessage } = useChatSocket({
    enabled: isSocketEnabled,
    onChatMessage,
    onErrorMessage: onSocketError,
  })

  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      const usernameFromCookie = userNameCookie.get()
      if (usernameFromCookie) {
        setNickname(usernameFromCookie)
      }

      try {
        const latestMessages = await loadLatestMessages()
        if (!isMounted) {
          return
        }

        setMessages(toChronologicalMessages(latestMessages))
        setHasMoreMessages(latestMessages.length === chatMessagesLimit)
      } catch (error) {
        console.error(error)
      } finally {
        if (isMounted) {
          setIsSocketEnabled(true)
        }
      }
    }

    void initialize()

    return () => {
      isMounted = false
    }
  }, [])

  const loadOlderMessages = useCallback(async () => {
    if (isLoadingOlderMessagesRef.current || !hasMoreMessages) {
      return
    }

    const oldestMessageId = getOldestMessageId(messages)
    if (oldestMessageId === null) {
      setHasMoreMessages(false)
      return
    }

    isLoadingOlderMessagesRef.current = true
    setIsLoadingOlderMessages(true)
    try {
      const olderMessages = await loadMessagesBefore(oldestMessageId)
      const olderMessagesChronological = toChronologicalMessages(olderMessages)

      setMessages((currentMessages) => {
        const existingMessageIds = new Set(
          currentMessages
            .map((message) => message.id)
            .filter((id): id is number => id !== null),
        )
        const nextOlderMessages = olderMessagesChronological.filter(
          (message) => message.id === null || !existingMessageIds.has(message.id),
        )

        return [...nextOlderMessages, ...currentMessages]
      })
      setHasMoreMessages(olderMessages.length === chatMessagesLimit)
    } catch (error) {
      console.error(error)
      setErrorText('Unable to load older messages right now.')
    } finally {
      isLoadingOlderMessagesRef.current = false
      setIsLoadingOlderMessages(false)
    }
  }, [hasMoreMessages, messages])

  const handleSubmit = useCallback(
    async (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault()

      const trimmedNickname = nickname.trim()
      const trimmedMessage = messageText.trim()

      if (!trimmedNickname || !trimmedMessage) {
        return
      }

      if (!isSocketConnected) {
        setErrorText('Realtime connection is not ready yet.')
        return
      }

      setIsSubmitting(true)
      try {
        let uuid = userUuidCookie.get()
        if (!uuid) {
          uuid = await registerUser(trimmedNickname)
          userUuidCookie.set(uuid)
        }

        userNameCookie.set(trimmedNickname)
        const isPublished = publishMessage(
          CHAT_SEND_DESTINATION,
          JSON.stringify({
            message: trimmedMessage,
            username: trimmedNickname,
            uuid,
          }),
        )

        if (!isPublished) {
          setErrorText('Realtime connection is not ready yet.')
          return
        }

        setMessageText('')
        setErrorText('')
      } catch (error) {
        console.error(error)
        setErrorText('Unable to send your message right now.')
      } finally {
        setIsSubmitting(false)
      }
    },
    [isSocketConnected, messageText, nickname, publishMessage],
  )

  const isSendDisabled = !nickname.trim() || !messageText.trim() || isSubmitting

  return {
    nickname,
    messageText,
    messages,
    errorText,
    isSocketConnected,
    isSubmitting,
    isSendDisabled,
    isLoadingOlderMessages,
    hasMoreMessages,
    setNickname,
    setMessageText,
    handleSubmit,
    loadOlderMessages,
  }
}
