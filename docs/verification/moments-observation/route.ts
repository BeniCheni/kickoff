import type { Decision } from './policy'
import { validateAuthority, type Authority } from './authority'

export type Route = { abort(): Promise<unknown>; continue(): Promise<unknown> }
type Release = (route: Route) => Promise<unknown>
// Only this factory supplies a provider continuation. Stub mode gets a local fulfillment.
export function providerRelease(mode: 'stub' | 'live', raw: unknown, origin: string, now: string, confirmation: string, local: Release): Release {
  const authority: Authority = validateAuthority(raw, origin, now, mode)
  if (mode === 'stub') return local
  if (confirmation !== `RELEASE ${authority.origin}`) throw new Error('confirmation-refused')
  return route => route.continue()
}
export async function applyDecision(route: Route, decision: Decision, release: Release): Promise<void> {
  if (decision.action === 'abort' || decision.action === 'stop') { await route.abort(); return }
  await release(route)
}
