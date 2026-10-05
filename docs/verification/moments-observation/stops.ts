export const stopReasons = [
  'provider-before-play', 'second-element', 'parent-changed', 'queue-covered',
  'navigation-waits', 'second-terminal-failure', 'unsampled-position', 'territory-150',
  'error-153', 'warm-autoplay-blocked', 'parked-return-blank', 'resume-at-zero',
  'ineligible-play', 'unnamed-id',
] as const
export type StopReason = typeof stopReasons[number]
export type Evidence = {
  providerBeforePlay?: boolean; frames?: number; apiElements?: number; parentChanged?: boolean;
  queueCovered?: boolean; navigationWaits?: boolean; terminalFailures?: number;
  position?: number; samples?: readonly number[]; error150Territory?: boolean; providerError?: number;
  warmAutoplayBlocked?: boolean; returnedBlank?: boolean; instanceDied?: boolean;
  resume?: boolean; lastSample?: number; playShown?: boolean; permitted?: boolean; unnamedId?: boolean
}
export function detectStop(e: Evidence): StopReason | null {
  if (e.providerBeforePlay) return 'provider-before-play'
  if ((e.frames ?? 0) > 1 || (e.apiElements ?? 0) > 1) return 'second-element'
  if (e.parentChanged) return 'parent-changed'
  if (e.queueCovered) return 'queue-covered'
  if (e.navigationWaits) return 'navigation-waits'
  if ((e.terminalFailures ?? 0) > 1) return 'second-terminal-failure'
  if (e.position !== undefined && !e.samples?.includes(e.position)) return 'unsampled-position'
  if (e.error150Territory) return 'territory-150'
  if (e.providerError === 153) return 'error-153'
  if (e.warmAutoplayBlocked) return 'warm-autoplay-blocked'
  if (e.returnedBlank || e.instanceDied) return 'parked-return-blank'
  if (e.resume && e.lastSample === 0) return 'resume-at-zero'
  if (e.playShown && e.permitted === false) return 'ineligible-play'
  if (e.unnamedId) return 'unnamed-id'
  return null
}
