import { useCallback, useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { useChatSocket } from './useChatSocket'
import { registerUser, loadLatestMessages } from '../services/chat/chatApi'
import { userNameCookie, userUuidCookie } from '../services/chat/chatCookies'
import { CHAT_SEND_DESTINATION } from '../services/chat/chatConstants'
import type { ChatMessage } from '../services/chat/chatTypes'

export function useChatSession() {
  const [nickname, setNickname] = useState('')
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [errorText, setErrorText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSocketEnabled, setIsSocketEnabled] = useState(false)
  const nextRealtimeMessageId = useRef(0)

  const onChatMessage = useCallback((payload: ChatMessage) => {
    nextRealtimeMessageId.current += 1
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

        setMessages(
          latestMessages
            .slice()
            .reverse()
        )
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
    setNickname,
    setMessageText,
    handleSubmit,
  }
}
