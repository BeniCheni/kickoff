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
  playing = false
  reached = new Set<string>()
  malformed = new Set<string>()
  resumeSample: number | undefined
  errors = new Map<string, number>()
  events: Hook[] = []
  constructor(readonly ids: readonly string[]) {}
  accept(hook: Hook): StopReason | null {
    this.events.push(hook)
    if (hook.kind === 'play') {
      this.current = hook.value as NonNullable<Telemetry['current']>
      this.samples = []; this.lastSample = undefined; this.playing = false; this.resumeSample = undefined
      this.reached.add(this.current.videoId)
      return detectStop({ unnamedId: !this.ids.includes(this.current.videoId) })
    }
    if (hook.kind === 'sample' && typeof hook.value === 'number') {
      this.samples.push(hook.value); this.lastSample = hook.value
      if (this.current && this.playing && Number.isFinite(hook.value) && hook.value > 0) this.played.add(this.current.videoId)
    }
    if (hook.kind === 'ready') this.ready = true
    if (hook.kind === 'error') {
      if (this.current) {
        if (typeof hook.value === 'number' && Number.isSafeInteger(hook.value) && hook.value >= 0) this.errors.set(this.current.videoId, hook.value)
        else { this.errors.delete(this.current.videoId); this.malformed.add(this.current.videoId) }
      }
      return detectStop({ providerError: typeof hook.value === 'number' && Number.isSafeInteger(hook.value) && hook.value >= 0 ? hook.value : undefined })
    }
    if (hook.kind === 'blocked') return detectStop({ warmAutoplayBlocked: this.warmDirect })
    if (hook.kind === 'resume') {
      this.resumeSample = hook.value === true ? this.lastSample : undefined
      return detectStop({ resume: hook.value === true, lastSample: this.resumeSample })
    }
    if (hook.kind === 'dispatch') {
      const event = hook.value as Notice, key = `${event.itemId}:${event.attempt}`
      if (event.event === 'failure') {
        this.failures.set(key, (this.failures.get(key) ?? 0) + 1)
        if (event.failure?.providerError !== undefined && this.current) {
          if (Number.isSafeInteger(event.failure.providerError) && event.failure.providerError >= 0) this.errors.set(this.current.videoId, event.failure.providerError)
          else { this.errors.delete(this.current.videoId); this.malformed.add(this.current.videoId) }
        }
      }
      if (this.current && event.itemId === this.current.itemId && event.attempt === this.current.attempt) {
        if (event.event === 'playing') this.playing = true
        if (['paused', 'ended', 'failure'].includes(event.event)) this.playing = false
      }
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
    return { observedAt, environment: `${stub ? 'STUB; ' : ''}${environment}`,
      outcome: telemetry.malformed.has(id) && code === undefined ? 'unknown' : code === 150 || code === 101 ? 'owner-blocked' : code !== undefined ? [2, 5, 100].includes(code) ? 'unavailable' : 'unknown' : telemetry.played.has(id) ? 'played' : 'unknown',
      ...(code === undefined ? {} : { providerError: code }),
      note: `Test id ${id}. ${telemetry.reached.has(id) ? 'Attempt reached.' : 'Id not reached.'} ${telemetry.malformed.has(id) ? 'Malformed provider error callback observed; invalid code omitted.' : ''} ${stub ? 'Synthetic stub events only; no provider playback observed.' : 'Single visit; API events are observations, not content or rights verification.'} ${code === 150 ? 'Error 150 is an owner block.' : 'No territory diagnosis.'}` }
  }))
}
