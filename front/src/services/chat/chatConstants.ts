import { BACKEND_ADDRESS } from '../../config/backend'

const CHAT_MESSAGES_ENDPOINT = import.meta.env.VITE_CHAT_MESSAGES_ENDPOINT ?? '/chat/messages'
const CHAT_MESSAGES_LIMIT = Number(import.meta.env.VITE_CHAT_MESSAGES_LIMIT ?? 10)
const REGISTER_USER_ENDPOINT = '/users/register'

const normalizedMessagesEndpoint = CHAT_MESSAGES_ENDPOINT.startsWith('/')
  ? CHAT_MESSAGES_ENDPOINT
  : `/${CHAT_MESSAGES_ENDPOINT}`

export const chatMessagesLimit = CHAT_MESSAGES_LIMIT
export const buildMessagesUrl = ({ beforeId, limit = CHAT_MESSAGES_LIMIT }: { beforeId?: number; limit?: number } = {}) => {
  const searchParams = new URLSearchParams({ limit: String(limit) })

  if (beforeId !== undefined) {
    searchParams.set('beforeId', String(beforeId))
  }

  return `${BACKEND_ADDRESS}${normalizedMessagesEndpoint}?${searchParams.toString()}`
}
export const registerUserBaseUrl = `${BACKEND_ADDRESS}${REGISTER_USER_ENDPOINT}`

export const CHAT_SEND_DESTINATION = '/api/topic/chat'
export const CHAT_SUBSCRIPTION_DESTINATION = '/topic/chat/messages'
export const ERROR_SUBSCRIPTION_DESTINATION = '/user/topic/user/errors'

export const USER_UUID_COOKIE = 'user_uuid'
export const USER_NAME_COOKIE = 'user_name'
export const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365
