import { availabilityObservationSchema, type AvailabilityObservation } from '../../../src/lib/moments'
import { detectStop, type StopReason } from './stops'
export type Hook = { kind: string; value: unknown }
type Notice = { itemId: string; attempt: number; event: string; position?: number; failure?: { providerError?: number; kind: string } }
export class Telemetry {
  current: { itemId: string; attempt: number; videoId: string } | null = null
  samples: number[] = []
  lastSample: number | undefined
  ready = false
  warmDirect = false
  failures = new Map<string, number>()
  played = new Set<string>()
  errors = new Map<string, number>()
  events: Hook[] = []
  constructor(readonly ids: readonly string[]) {}
  accept(hook: Hook): StopReason | null {
    this.events.push(hook)
    if (hook.kind === 'play') {
      this.current = hook.value as NonNullable<Telemetry['current']>
      this.samples = []; this.lastSample = undefined
      return detectStop({ unnamedId: !this.ids.includes(this.current.videoId) })
    }
    if (hook.kind === 'sample' && typeof hook.value === 'number') {
      this.samples.push(hook.value); this.lastSample = hook.value
    }
    if (hook.kind === 'ready') this.ready = true
    if (hook.kind === 'error') {
      if (this.current) this.errors.set(this.current.videoId, Number(hook.value))
      return detectStop({ providerError: Number(hook.value) })
    }
    if (hook.kind === 'blocked') return detectStop({ warmAutoplayBlocked: this.warmDirect })
    if (hook.kind === 'resume') return detectStop({ resume: hook.value === true, lastSample: this.lastSample })
    if (hook.kind === 'dispatch') {
      const event = hook.value as Notice, key = `${event.itemId}:${event.attempt}`
      if (event.event === 'failure') {
        this.failures.set(key, (this.failures.get(key) ?? 0) + 1)
        if (event.failure?.providerError !== undefined && this.current) this.errors.set(this.current.videoId, event.failure.providerError)
      }
      if (event.event === 'playing' && this.current) this.played.add(this.current.videoId)
      return detectStop({ terminalFailures: this.failures.get(key), position: event.position, samples: this.samples,
        providerError: event.failure?.providerError,
        error150Territory: event.failure?.providerError === 150 && event.failure.kind !== 'owner-blocked' })
    }
    return null
  }
}
export function observations(ids: readonly string[], telemetry: Telemetry, environment: string, observedAt: string, stub: boolean): AvailabilityObservation[] {
  return availabilityObservationSchema.array().parse(ids.map(id => {
    const code = telemetry.errors.get(id)
    return { observedAt, environment,
      outcome: code === 150 || code === 101 ? 'owner-blocked' : code !== undefined ? [2, 5, 100].includes(code) ? 'unavailable' : 'unknown' : telemetry.played.has(id) ? 'played' : 'unknown',
      ...(code === undefined ? {} : { providerError: code }),
      note: `Test id ${id}. ${stub ? 'Synthetic stub events only; no provider playback observed.' : 'Single visit; API events are observations, not content or rights verification.'} ${code === 150 ? 'Error 150 is an owner block.' : 'No territory diagnosis.'}` }
  }))
}
