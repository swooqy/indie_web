import { Client, type IFrame, type IMessage } from '@stomp/stompjs'
import { useCallback, useEffect, useRef, useState } from 'react'
import { WEBSOCKET_ADDRESS } from '../config/backend'
import {
  CHAT_SUBSCRIPTION_DESTINATION,
  ERROR_SUBSCRIPTION_DESTINATION,
} from '../services/chat/chatConstants'
import type { ChatMessage, WebSocketError } from '../services/chat/chatTypes'

type UseChatSocketOptions = {
  enabled: boolean
  onChatMessage: (message: ChatMessage) => void
  onErrorMessage: (message: string) => void
}

export function useChatSocket({ enabled, onChatMessage, onErrorMessage }: UseChatSocketOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    let isMounted = true
    const wsClient = new Client({
      brokerURL: WEBSOCKET_ADDRESS,
      reconnectDelay: 5000,
      onConnect: () => {
        if (!isMounted) {
          return
        }

        setIsConnected(true)
        wsClient.subscribe(CHAT_SUBSCRIPTION_DESTINATION, (frame: IMessage) => {
          const payload = JSON.parse(frame.body) as ChatMessage
          onChatMessage(payload)
        })
        wsClient.subscribe(ERROR_SUBSCRIPTION_DESTINATION, (frame: IMessage) => {
          const payload = JSON.parse(frame.body) as WebSocketError
          onErrorMessage(payload.message ?? 'Unable to send message.')
        })
      },
      onDisconnect: () => {
        if (!isMounted) {
          return
        }
        setIsConnected(false)
      },
      onWebSocketClose: () => {
        if (!isMounted) {
          return
        }
        setIsConnected(false)
      },
      onStompError: (frame: IFrame) => {
        if (!isMounted) {
          return
        }
        onErrorMessage(frame.headers.message ?? 'WebSocket broker rejected the message.')
      },
    })

    clientRef.current = wsClient
    wsClient.activate()

    return () => {
      isMounted = false
      clientRef.current = null
      setIsConnected(false)
      void wsClient.deactivate()
    }
  }, [enabled, onChatMessage, onErrorMessage])

  const publishMessage = useCallback((destination: string, body: string) => {
    const client = clientRef.current
    if (!client || !client.connected) {
      return false
    }

    client.publish({ destination, body })
    return true
  }, [])

  return { isConnected, publishMessage }
}
