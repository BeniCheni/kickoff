import { timingSafeEqual } from 'node:crypto'

export const SESSION_COOKIE = 'studio_session'
export const TICKET_QUERY = 'ticket'

const CHANGING = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export function sameToken(left: string, right: string): boolean {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function cookieValue(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined
  for (const part of header.split(';')) {
    const trimmed = part.trim()
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    if (trimmed.slice(0, eq) === name) return trimmed.slice(eq + 1)
  }
  return undefined
}

export function oneTimeUrl(origin: string, token: string): string {
  return `${origin}/?${TICKET_QUERY}=${encodeURIComponent(token)}`
}

export type GuardInput = {
  method: string
  host: string | undefined
  origin: string | undefined
  cookieToken: string | undefined
  ticket: string | undefined
  token: string
  expectedOrigin: string
  port: number
  loopbackHost: boolean
  spentTickets: Set<string>
}

export type GuardResult = { ok: true; setCookie: boolean } | { ok: false }

/**
 * Every request needs this run's token, in the cookie or the one-time ticket.
 * A state-changing request also needs this server's own loopback Origin.
 */
export function guardRequest(input: GuardInput): GuardResult {
  if (!input.loopbackHost) return { ok: false }
  const cookieOk = input.cookieToken !== undefined && sameToken(input.cookieToken, input.token)
  const ticketOk = input.ticket !== undefined && sameToken(input.ticket, input.token) && !input.spentTickets.has(input.token)
  if (ticketOk) input.spentTickets.add(input.token)
  if (!cookieOk && !ticketOk) return { ok: false }
  if (CHANGING.has(input.method.toUpperCase()) && input.origin !== input.expectedOrigin) {
    return { ok: false }
  }
  return { ok: true, setCookie: !cookieOk && ticketOk }
}

export function sessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/`
}
