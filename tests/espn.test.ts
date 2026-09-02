import { describe, it, expect, vi, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { normalizeEvent, seasonLabel, espnProvider, UnmappedStatusError } from '../scripts/providers/espn'
import { fixtureSchema } from '../src/lib/schema'

const load = (name: string) =>
  JSON.parse(readFileSync(resolve(import.meta.dirname, 'fixtures', name), 'utf8'))

const ligue1 = load('espn-ligue1-md1.json').events
const placeholder = load('espn-laliga-placeholder.json').events

const AT = '2026-08-21T12:00:00.000Z'

describe('seasonLabel', () => {
  it('formats a European split season', () => {
    expect(seasonLabel(2026)).toBe('2026-27')
    expect(seasonLabel(2029)).toBe('2029-30')
  })
})

describe('normalizeEvent', () => {
  it('produces a schema-valid fixture from a real payload', () => {
    for (const e of ligue1) {
      const f = normalizeEvent(e, 'ligue1', AT)
      expect(f).not.toBeNull()
      expect(() => fixtureSchema.parse(f)).not.toThrow()
    }
  })

  it('pins the Ligue 1 season opener to its true kickoff instant', () => {
    const e = ligue1.find((x: any) => x.name.includes('Marseille'))
    const f = normalizeEvent(e, 'ligue1', AT)!
    // The prototype had this on Thu 20 Aug. It is Fri 21 Aug, 20:45 CEST = 18:45 UTC.
    expect(f.kickoffUtc).toBe('2026-08-21T18:45:00.000Z')
    expect(f.home.name).toBe('Olympique de Marseille')
    expect(f.away.name).toBe('RC Strasbourg')
    expect(f.timeConfidence).toBe('exact')
  })

  it('records Rennes as the home side against PSG', () => {
    // The LFP moved this out of the Parc des Princes on 19 Aug 2026. Home/away inversion
    // flips the moneyline, so this assertion is deliberately explicit.
    const e = ligue1.find((x: any) => x.shortName === 'PSG @ REN')
    const f = normalizeEvent(e, 'ligue1', AT)!
    expect(f.home.name).toBe('Stade Rennais')
    expect(f.away.name).toBe('Paris Saint-Germain')
    expect(f.venue).toBe('Roazhon Park')
    expect(f.id).toBe(`ligue1:${e.id}`)
  })

  it('marks an unscheduled kickoff as a placeholder rather than exact', () => {
    // El Clásico, 25 Oct 2026: LaLiga has fixed the date but not the time. The prototype
    // presented a 16:15 kickoff as confirmed.
    const f = normalizeEvent(placeholder[0], 'laliga', AT)!
    expect(f.timeConfidence).toBe('round_placeholder')
    expect(f.kickoffUtc.slice(0, 10)).toBe('2026-10-25')
  })

  it('returns null instead of a half-built fixture when the payload is malformed', () => {
    expect(normalizeEvent({ id: '1' }, 'ligue1', AT)).toBeNull()
    expect(normalizeEvent({ competitions: [{ competitors: [] }] }, 'ligue1', AT)).toBeNull()
    expect(
      normalizeEvent({ competitions: [{ competitors: [{ homeAway: 'home', team: {} }] }] }, 'ligue1', AT),
    ).toBeNull()
  })

  it('generates an id that survives a fixture being rescheduled or relocated', () => {
    const e = ligue1.find((x: any) => x.name.includes('Marseille'))
    const moved = { ...e, date: '2026-09-15T18:45Z' }
    expect(normalizeEvent(moved, 'ligue1', AT)!.id).toBe(normalizeEvent(e, 'ligue1', AT)!.id)
  })

  it('gives the two legs of a season distinct ids', () => {
    const [a, b] = ligue1
    expect(normalizeEvent(a, 'ligue1', AT)!.id).not.toBe(normalizeEvent(b, 'ligue1', AT)!.id)
  })
})

describe('normalizeEvent — status mapping', () => {
  const template = ligue1.find((x: any) => x.name.includes('Marseille'))
  const withStatus = (name: unknown) => ({ ...template, status: { type: { name } } })

  const MAPPED: Record<string, string> = {
    STATUS_SCHEDULED: 'scheduled',
    STATUS_IN_PROGRESS: 'in_play',
    STATUS_FIRST_HALF: 'in_play',
    STATUS_SECOND_HALF: 'in_play',
    STATUS_HALFTIME: 'in_play',
    STATUS_FULL_TIME: 'full_time',
    STATUS_FINAL: 'full_time',
    STATUS_POSTPONED: 'postponed',
    STATUS_CANCELED: 'cancelled',
    STATUS_CANCELLED: 'cancelled',
  }

  it('maps every ESPN status name this app knows about', () => {
    for (const [name, expected] of Object.entries(MAPPED)) {
      expect(normalizeEvent(withStatus(name), 'ligue1', AT)!.status).toBe(expected)
    }
  })

  it('throws, naming the status and the event, on a name the map does not cover', () => {
    // Real ESPN statuses this app has never seen in a synced window — not a guess about
    // spelling, a guess that the map is complete.
    for (const name of [
      'STATUS_DELAYED', 'STATUS_SUSPENDED', 'STATUS_ABANDONED', 'STATUS_FORFEIT',
      'STATUS_FINAL_AET', 'STATUS_FINAL_PEN', 'STATUS_RAIN_DELAY',
    ]) {
      let threw: unknown
      try {
        normalizeEvent(withStatus(name), 'ligue1', AT)
      } catch (err) {
        threw = err
      }
      expect(threw).toBeInstanceOf(UnmappedStatusError)
      expect((threw as UnmappedStatusError).statusName).toBe(name)
      expect((threw as UnmappedStatusError).eventId).toBe(String(template.id))
    }
  })

  it('throws on a missing status name rather than defaulting to scheduled', () => {
    const e = { ...template, status: {} }
    expect(() => normalizeEvent(e, 'ligue1', AT)).toThrow(UnmappedStatusError)
    const e2 = { ...template, status: undefined }
    expect(() => normalizeEvent(e2, 'ligue1', AT)).toThrow(UnmappedStatusError)
  })
})

describe('espnProvider.fetchWindow — unmapped statuses abort before any write', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('collects every offender across the whole window and rejects once, naming them all', async () => {
    const template = ligue1.find((x: any) => x.name.includes('Marseille'))
    const good = template
    const bad1 = { ...template, id: 'bad-delayed', status: { type: { name: 'STATUS_DELAYED' } } }
    const bad2 = { ...template, id: 'bad-abandoned', status: { type: { name: 'STATUS_ABANDONED' } } }

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ events: [good, bad1, bad2] }),
      })),
    )

    await expect(espnProvider.fetchWindow('2026-08-21', '2026-08-21')).rejects.toThrow(
      /STATUS_DELAYED[\s\S]*STATUS_ABANDONED|STATUS_ABANDONED[\s\S]*STATUS_DELAYED/,
    )
  })

  it('never writes a fixture for the offenders it collected', async () => {
    const template = ligue1.find((x: any) => x.name.includes('Marseille'))
    const bad = { ...template, id: 'bad-suspended', status: { type: { name: 'STATUS_SUSPENDED' } } }

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => ({ events: [bad] }) })),
    )

    await expect(espnProvider.fetchWindow('2026-08-21', '2026-08-21')).rejects.toThrow(/STATUS_SUSPENDED/)
  })

  it('still reports a non-2xx response as a hard failure, unrelated to status mapping', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 503, json: async () => ({}) })))
    await expect(espnProvider.fetchWindow('2026-08-21', '2026-08-21')).rejects.toThrow(/responded 503/)
  })

  it('refuses a chunk at ESPN\'s 100-event cap rather than writing a possibly-truncated list', async () => {
    const template = ligue1.find((x: any) => x.name.includes('Marseille'))
    const events = Array.from({ length: 100 }, (_, i) => ({ ...template, id: `cap-${i}` }))
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ events }) })))
    await expect(espnProvider.fetchWindow('2026-08-21', '2026-08-21')).rejects.toThrow(/100-event cap/)
  })
})
