import { defineCookie } from './cookieService'
import { COOKIE_MAX_AGE_SECONDS, USER_NAME_COOKIE, USER_UUID_COOKIE } from './chatConstants'

export const userUuidCookie = defineCookie({
  name: USER_UUID_COOKIE,
  maxAgeSeconds: COOKIE_MAX_AGE_SECONDS,
  sameSite: 'lax',
})

export const userNameCookie = defineCookie({
  name: USER_NAME_COOKIE,
  maxAgeSeconds: COOKIE_MAX_AGE_SECONDS,
  sameSite: 'lax',
})
