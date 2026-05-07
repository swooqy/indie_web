export type SameSite = 'strict' | 'lax' | 'none'

export type CookieOptions = {
  path?: string
  domain?: string
  maxAgeSeconds?: number
  sameSite?: SameSite
  secure?: boolean
  expires?: Date
}

export type CookieConfig = CookieOptions & {
  name: string
}

const DEFAULT_COOKIE_PATH = '/'

const getCookieName = (cookie: CookieConfig | string) => (typeof cookie === 'string' ? cookie : cookie.name)

const getCookieOptions = (cookie: CookieConfig | string, overrides: CookieOptions): CookieOptions => {
  if (typeof cookie === 'string') {
    return overrides
  }

  return { ...cookie, ...overrides }
}

const formatCookieAttributes = (options: CookieOptions) => {
  const attributes = [`path=${options.path ?? DEFAULT_COOKIE_PATH}`]

  if (options.domain) {
    attributes.push(`domain=${options.domain}`)
  }

  if (options.maxAgeSeconds !== undefined) {
    attributes.push(`max-age=${options.maxAgeSeconds}`)
  }

  if (options.expires) {
    attributes.push(`expires=${options.expires.toUTCString()}`)
  }

  if (options.sameSite) {
    attributes.push(`samesite=${options.sameSite}`)
  }

  if (options.secure) {
    attributes.push('secure')
  }

  return attributes.join('; ')
}

export const getCookieValue = (cookie: CookieConfig | string) => {
  const encodedName = `${encodeURIComponent(getCookieName(cookie))}=`
  const match = document.cookie
    .split(';')
    .map((segment) => segment.trim())
    .find((segment) => segment.startsWith(encodedName))

  if (!match) {
    return null
  }

  return decodeURIComponent(match.slice(encodedName.length).replace(/\+/g, ' '))
}

export const setCookieValue = (
  cookie: CookieConfig | string,
  value: string,
  overrides: CookieOptions = {},
) => {
  const name = getCookieName(cookie)
  const options = getCookieOptions(cookie, overrides)
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; ${formatCookieAttributes(options)}`
}

export const deleteCookieValue = (cookie: CookieConfig | string, overrides: CookieOptions = {}) => {
  setCookieValue(cookie, '', { ...overrides, maxAgeSeconds: 0 })
}

export const defineCookie = (config: CookieConfig) => ({
  get: () => getCookieValue(config),
  set: (value: string, overrides: CookieOptions = {}) => setCookieValue(config, value, overrides),
  delete: (overrides: CookieOptions = {}) => deleteCookieValue(config, overrides),
})
