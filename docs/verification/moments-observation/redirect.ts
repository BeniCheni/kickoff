// Playwright's Chromium route handler auto-continues redirects without re-routing them.
// A response-stage CDP guard therefore refuses a redirect before it can be followed.
export function redirectLocation(status: number, headers: readonly { name: string; value: string }[]): string | null {
  if (status < 300 || status >= 400) return null
  return headers.find(h => h.name.toLowerCase() === 'location')?.value ?? null
}
