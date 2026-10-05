// Playwright's Chromium route handler auto-continues redirects without re-routing them.
// A response-stage CDP guard therefore refuses a redirect before it can be followed.
export function redirectLocation(status: number, headers: readonly { name: string; value: string }[]): string | null {
  if (status < 300 || status >= 400) return null
  return headers.find(h => h.name.toLowerCase() === 'location')?.value ?? null
}

// Chrome may cancel a paused response while a new document commits. The event's own
// request id is then gone, so continuing it reports InvalidParams; no hop is released.
export function cancelledInterception(method: string, code: number, message: string): boolean {
  return method === 'Fetch.continueResponse' && code === -32602 && message === 'Invalid InterceptionId.'
}
