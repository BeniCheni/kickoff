import { describe, it, expect, vi, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { normalizeEvent, seasonLabel, espnProvider, UnmappedStatusError } from '../scripts/providers/espn'
import { fixtureSchema } from '../src/lib/schema'

const load = (name: string) =>
  JSON.parse(readFileSync(resolve(import.meta.dirname, 'fixtures', name), 'utf8'))

const ligue1 = load('espn-ligue1-md1.json').events
const placeholder = load('espn-laliga-placeholder.json').events
const milanBenfica = load('espn/uel-401915586.json').events[0]

const AT = '2026-08-21T12:00:00.000Z'

describe('seasonLabel', () => {
  it('formats a European split season', () => {
    expect(seasonLabel(2026)).toBe('2026-27')
    expect(seasonLabel(2029)).toBe('2029-30')
  })
})

describe('normalizeEvent', () => {
  it('omits unused domestic phase/season evidence but retains the league-phase guard', () => {
    const domestic = { ...ligue1[0], season: { slug: '2026-27-french-ligue-1', year: 2026 } }
    expect(normalizeEvent(domestic, 'ligue1', AT)).not.toHaveProperty('phase')
    expect(normalizeEvent(domestic, 'ligue1', AT)).not.toHaveProperty('season')
    const ucl = load('espn/ucl-md1.json').events[0]
    expect(normalizeEvent(ucl, 'ucl', AT)).toMatchObject({ phase: 'league-phase', season: 2026, round: '1' })
    const qualifier = { ...ucl, season: { slug: 'qualifying', year: 2026 } }
    expect(normalizeEvent(qualifier, 'ucl', AT)).not.toHaveProperty('phase')
    expect(normalizeEvent(qualifier, 'ucl', AT)).not.toHaveProperty('season')
    expect(normalizeEvent(qualifier, 'ucl', AT)).not.toHaveProperty('round')
  })

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

  it('normalizes ESPN event 401915586 through the Europa League path', () => {
    const f = normalizeEvent(milanBenfica, 'uel', AT)!
    expect(() => fixtureSchema.parse(f)).not.toThrow()
    expect(f).toMatchObject({
      id: 'uel:401915586',
      competition: 'uel',
      kickoffUtc: '2026-09-16T19:00:00.000Z',
      venueTz: 'Europe/Rome',
      home: { name: 'AC Milan' },
      away: { name: 'Benfica' },
      status: 'scheduled',
      timeConfidence: 'exact',
    })
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

  it.each([undefined, null, '', ' ', 'undefined', 'null', {}, NaN, 1.5])('rejects invalid provider identity %j before building a fixture', (id) => {
    expect(normalizeEvent({ ...ligue1[0], id }, 'ligue1', AT)).toBeNull()
  })

  it('accepts a provider numeric id only after validation', () => {
    expect(normalizeEvent({ ...ligue1[0], id: 123 }, 'ligue1', AT)?.id).toBe('ligue1:123')
  })

  it.each(['home', 'away'])('rejects absent or malformed %s team identities before coercion', (role) => {
    for (const id of [undefined, null, '', ' ', 'undefined', 'null', {}, [], ['123'], true, NaN, -1, 1.5]) {
      const event = structuredClone(ligue1[0])
      event.competitions[0].competitors.find((c: any) => c.homeAway === role).team.id = id
      expect(normalizeEvent(event, 'ligue1', AT), `raw ${role} id: ${JSON.stringify(id)}`).toBeNull()
    }
  })

  it('keeps validated numeric team identities, including zero', () => {
    const event = structuredClone(ligue1[0])
    event.competitions[0].competitors.find((c: any) => c.homeAway === 'home').team.id = 0
    event.competitions[0].competitors.find((c: any) => c.homeAway === 'away').team.id = 123
    const fixture = normalizeEvent(event, 'ligue1', AT)!
    expect(fixture.home.sourceId).toBe('0')
    expect(fixture.away.sourceId).toBe('123')
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
    STATUS_SUSPENDED: 'suspended',
    STATUS_ABANDONED: 'abandoned',
  }

  it('maps every ESPN status name this app knows about', () => {
    for (const [name, expected] of Object.entries(MAPPED)) {
      expect(normalizeEvent(withStatus(name), 'ligue1', AT)!.status).toBe(expected)
    }
  })

  it('throws, naming the status and the event, on a name the map does not cover', () => {
    // Real ESPN statuses this app has never seen in a synced window — not a guess about
    // spelling, a guess that the map is complete.
    for (const name of ['STATUS_DELAYED', 'STATUS_FORFEIT', 'STATUS_RAIN_DELAY']) {
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

  it('stores a suspension or abandonment without treating the score as a result', () => {
    for (const name of ['STATUS_SUSPENDED', 'STATUS_ABANDONED'] as const) {
      const event = structuredClone(withStatus(name))
      for (const competitor of event.competitions[0].competitors) competitor.score = '0'
      const fixture = normalizeEvent(event, 'ligue1', AT)!
      expect(fixture.status).toBe(MAPPED[name])
      expect(fixture.result).toBeUndefined()
    }
  })

  it('leaves STATUS_SHOOTOUT unmapped until a receipt shows it', () => {
    let threw: unknown
    try {
      normalizeEvent(withStatus('STATUS_SHOOTOUT'), 'ligue1', AT)
    } catch (err) {
      threw = err
    }
    expect(threw).toBeInstanceOf(UnmappedStatusError)
    expect((threw as UnmappedStatusError).statusName).toBe('STATUS_SHOOTOUT')
  })

  it('throws on a missing status name rather than defaulting to scheduled', () => {
    const e = { ...template, status: {} }
    expect(() => normalizeEvent(e, 'ligue1', AT)).toThrow(UnmappedStatusError)
    const e2 = { ...template, status: undefined }
    expect(() => normalizeEvent(e2, 'ligue1', AT)).toThrow(UnmappedStatusError)
  })
})

describe('extra-time and penalty receipts', () => {
  // Copa del Rey is not a synced competition. The key is only the argument normalizeEvent requires.
  const COPA = 'laliga' as const
  const aet = load('espn/copa-del-rey-401928495.json').events[0]
  const pensAfterExtra = load('espn/copa-del-rey-401928509.json').events[0]
  const pensAfterNinety = load('espn/supercoppa-758976.json').events[0]

  it('maps the Copa del Rey extra-time final, including a receipt with no shootoutScore', () => {
    const fixture = normalizeEvent(aet, COPA, AT)!
    expect(() => fixtureSchema.parse(fixture)).not.toThrow()
    expect(fixture).toMatchObject({
      status: 'after_extra_time',
      result: { home: 4, away: 3 },
      home: { name: 'Sestao' },
      away: { name: 'Espanyol' },
    })
    expect(fixture.shootout).toBeUndefined()
  })

  it('does not read shootoutScore on an extra-time final', () => {
    for (const junk of [null, '', ' ', false, [], 9, '2']) {
      const event = structuredClone(aet)
      for (const competitor of event.competitions[0].competitors) competitor.shootoutScore = junk
      const fixture = normalizeEvent(event, COPA, AT)!
      expect(fixture.shootout, JSON.stringify(junk)).toBeUndefined()
      expect(fixture.result).toEqual({ home: 4, away: 3 })
    }
  })

  it('maps the Copa del Rey penalty final after extra time', () => {
    const fixture = normalizeEvent(pensAfterExtra, COPA, AT)!
    expect(() => fixtureSchema.parse(fixture)).not.toThrow()
    expect(fixture).toMatchObject({
      status: 'after_penalties',
      result: { home: 3, away: 3 },
      shootout: { home: 2, away: 4 },
      home: { name: 'Atlético Tordesillas' },
      away: { name: 'Mirandés' },
    })
  })

  it('maps the Supercoppa penalty final straight after 90 minutes', () => {
    const fixture = normalizeEvent(pensAfterNinety, 'supercoppa', AT)!
    expect(() => fixtureSchema.parse(fixture)).not.toThrow()
    expect(fixture).toMatchObject({
      status: 'after_penalties',
      result: { home: 1, away: 1 },
      shootout: { home: 3, away: 2 },
      home: { name: 'Bologna' },
      away: { name: 'Inter Milan' },
    })
    expect(fixture.venueTz).toBeUndefined()
  })

  it('accepts a zero score with a decisive shootout and refuses a level one', () => {
    const decisive = structuredClone(pensAfterNinety)
    for (const competitor of decisive.competitions[0].competitors) {
      competitor.score = '0'
      competitor.shootoutScore = competitor.homeAway === 'home' ? 0 : 1
    }
    const fixture = normalizeEvent(decisive, 'supercoppa', AT)!
    expect(fixture.result).toEqual({ home: 0, away: 0 })
    expect(fixture.shootout).toEqual({ home: 0, away: 1 })
    expect(() => fixtureSchema.parse(fixture)).not.toThrow()

    for (const goals of [0, 4]) {
      const level = structuredClone(pensAfterNinety)
      for (const competitor of level.competitions[0].competitors) {
        competitor.score = '0'
        competitor.shootoutScore = goals
      }
      let stored: unknown = 'not stored'
      let message = ''
      try {
        stored = normalizeEvent(level, 'supercoppa', AT)
      } catch (err) {
        message = err instanceof Error ? err.message : String(err)
      }
      expect(stored, `shootout ${goals}-${goals}`).toBe('not stored')
      expect(message, `shootout ${goals}-${goals}`).toContain(
        `level shootout ${goals}-${goals} on event ${pensAfterNinety.id}`,
      )
    }
  })

  const scoreTraps = [undefined, null, '', ' ', false, [], 4, '-1', '1.5', '9007199254740993']
  const shootoutTraps = [undefined, null, '', ' ', false, [], '3', -1, 1.5]

  function rewritten(event: any, side: 'home' | 'away', field: 'score' | 'shootoutScore', raw: unknown) {
    const copy = structuredClone(event)
    const competitor = copy.competitions[0].competitors.find((c: any) => c.homeAway === side)
    if (raw === undefined) delete competitor[field]
    else competitor[field] = raw
    return copy
  }

  it.each(['home', 'away'] as const)('refuses a malformed %s score on an extra-time final and stores nothing', (side) => {
    for (const raw of scoreTraps) {
      const event = rewritten(aet, side, 'score', raw)
      let stored: unknown = 'not stored'
      try {
        stored = normalizeEvent(event, COPA, AT)
      } catch (err) {
        expect(err, JSON.stringify(raw)).toBeInstanceOf(Error)
        expect((err as Error).message).toContain(`invalid score for ${side}`)
        expect((err as Error).message).not.toContain('(0)')
      }
      expect(stored, JSON.stringify(raw)).toBe('not stored')
    }
  })

  it.each(['home', 'away'] as const)('refuses a malformed %s score or shootout on a penalty final and stores nothing', (side) => {
    for (const raw of scoreTraps) {
      let stored: unknown = 'not stored'
      try {
        stored = normalizeEvent(rewritten(pensAfterExtra, side, 'score', raw), COPA, AT)
      } catch (err) {
        expect((err as Error).message).toContain(`invalid score for ${side}`)
      }
      expect(stored, `score ${JSON.stringify(raw)}`).toBe('not stored')
    }
    for (const raw of shootoutTraps) {
      let stored: unknown = 'not stored'
      try {
        stored = normalizeEvent(rewritten(pensAfterNinety, side, 'shootoutScore', raw), 'supercoppa', AT)
      } catch (err) {
        expect((err as Error).message).toContain(`invalid shootoutScore for ${side}`)
      }
      expect(stored, `shootout ${JSON.stringify(raw)}`).toBe('not stored')
    }
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
    const bad2 = { ...template, id: 'bad-forfeit', status: { type: { name: 'STATUS_FORFEIT' } } }

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ events: [good, bad1, bad2] }),
      })),
    )

    await expect(espnProvider.fetchWindow('2026-08-21', '2026-08-21')).rejects.toThrow(
      /STATUS_DELAYED[\s\S]*STATUS_FORFEIT|STATUS_FORFEIT[\s\S]*STATUS_DELAYED/,
    )
  })

  it('never writes a fixture for the offenders it collected', async () => {
    const template = ligue1.find((x: any) => x.name.includes('Marseille'))
    const bad = { ...template, id: 'bad-delayed', status: { type: { name: 'STATUS_DELAYED' } } }

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => ({ events: [bad] }) })),
    )

    await expect(espnProvider.fetchWindow('2026-08-21', '2026-08-21')).rejects.toThrow(/STATUS_DELAYED/)
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

  it('reports missing names and both id-less events instead of silently deduplicating them', async () => {
    const idless = { ...ligue1[0], id: undefined }
    const missingAway = { ...ligue1[0], id: 'bad-away', competitions: [{ competitors: [{ homeAway: 'home', team: { displayName: 'Home' } }] }] }
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ events: [idless, idless, missingAway] }) })))
    await expect(espnProvider.fetchWindow('2026-08-21', '2026-08-21')).rejects.toThrow(
      /entry 1, event \(missing\).*missing or invalid event id[\s\S]*entry 2, event \(missing\)[\s\S]*bad-away.*missing away competitor/,
    )
  })

  it('rejects a missing events array rather than interpreting a reshaped response as an empty schedule', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({}) })))
    await expect(espnProvider.fetchWindow('2026-08-21', '2026-08-21')).rejects.toThrow(/missing or invalid events array/)
  })

  it('refuses the whole fetch when a decided final has a malformed score, and stores nothing', async () => {
    const event = structuredClone(load('espn/copa-del-rey-401928495.json').events[0])
    event.competitions[0].competitors.find((c: any) => c.homeAway === 'home').score = null
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ events: [event, ligue1[0]] }) })))
    await expect(espnProvider.fetchWindow('2026-10-27', '2026-10-27')).rejects.toThrow(/invalid score for home \(null\)/)
  })

  it('refuses the whole fetch when a penalty final has a level shootout, and stores nothing', async () => {
    const event = structuredClone(load('espn/supercoppa-758976.json').events[0])
    for (const competitor of event.competitions[0].competitors) competitor.shootoutScore = 4
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ events: [event, ligue1[0]] }) })))
    await expect(espnProvider.fetchWindow('2026-12-19', '2026-12-19')).rejects.toThrow(
      /level shootout 4-4 on event 758976/,
    )
  })

  it('reports invalid team ids even on an event already seen, with role and raw identity', async () => {
    const badHome = structuredClone(ligue1[0])
    badHome.competitions[0].competitors.find((c: any) => c.homeAway === 'home').team.id = ['123']
    const badAway = structuredClone(ligue1[0])
    delete badAway.competitions[0].competitors.find((c: any) => c.homeAway === 'away').team.id
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ events: [ligue1[0], badHome, badAway] }) })))
    await expect(espnProvider.fetchWindow('2026-08-21', '2026-08-21')).rejects.toThrow(
      /fra\.1.*entry 2, event.*home team id \["123"\][\s\S]*entry 3, event.*away team id \(missing\)/,
    )
  })
})
