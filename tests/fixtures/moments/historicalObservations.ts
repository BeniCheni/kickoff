import type { AvailabilityObservation } from '../../../src/lib/moments'

// Isolated historical evidence, never production curation or a fresh provider check.
export const historicalObservations: Record<string, { scope: string; observations: AvailabilityObservation[] }> = {
  pkEpLtePJm0: {
    scope: 'pkEpLtePJm0 is an Origi commentary-reaction reel, not a verified standalone goal clip',
    observations: [{ observedAt: '2026-09-21T00:09:25.690Z', environment: 'Historical Codex in-app browser, macOS Chrome/153 user agent, 1000×900',
      outcome: 'unknown', note: 'The recorded commentary attempt timed out; no cause established.' }],
  },
  iBuTEywEQ6U: {
    scope: 'iBuTEywEQ6U was blocked from embedding by its owner with error 150, with no territory diagnosis',
    observations: [{ observedAt: '2026-09-21T00:22:38Z', environment: 'Historical Chrome spike; observedAt is the recorded window end (00:09:25–00:22:38 UTC), not an exact per-asset timestamp',
      outcome: 'owner-blocked', providerError: 150,
      note: 'iBuTEywEQ6U was blocked from embedding by its owner with error 150, with no territory diagnosis' }],
  },
  sXAkBsEcXSo: {
    scope: 'sXAkBsEcXSo trophy footage played in the recorded Chrome environments',
    observations: [{ observedAt: '2026-09-21T00:22:38Z', environment: 'Historical Chrome spike; observedAt is the recorded window end (00:09:25–00:22:38 UTC), not an exact per-asset timestamp',
      outcome: 'played', note: 'sXAkBsEcXSo trophy footage played in the recorded Chrome environments' }],
  },
}
