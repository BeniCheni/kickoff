import { describe, expect, it } from 'vitest'
import { COMPETITIONS, LEAGUE_TABLES, TABLE_LEAGUES, ZONES_SEASON } from '../src/lib/competitions'

/**
 * Zone bands (rulings 22 and 23, 17 Nov 2026). Colour says where a zone leads; a broken band
 * says it is not settled yet. `band` is a presentation field beside the zone data, and adding
 * it changed no range and no season: the ranges below are the first edition's, zone for zone.
 */
const zones = TABLE_LEAGUES.flatMap((league) => LEAGUE_TABLES[league]!.zones.map((zone) => ({ league, ...zone })))
const hue = (key: 'ucl' | 'uel' | 'uecl') => COMPETITIONS[key].color

describe('zone bands', () => {
  it('keeps every zone’s range and the season they describe', () => {
    expect(ZONES_SEASON).toBe(2026)
    expect(zones.map((zone) => `${zone.league} ${zone.name} ${zone.from}-${zone.to}`)).toEqual([
      'laliga Champions League 1-5', 'laliga Europa League 6-6', 'laliga Conference League 7-7', 'laliga Relegation 18-20',
      'pl Champions League 1-5', 'pl Europa League 6-6', 'pl Conference League 7-7', 'pl Relegation 18-20',
      'seriea Champions League 1-4', 'seriea Europa League 5-5', 'seriea Conference League 6-6', 'seriea Relegation 18-20',
      'ligue1 Champions League 1-3', 'ligue1 UCL Qualifying 4-4', 'ligue1 Europa League 5-5', 'ligue1 Conference League 6-6', 'ligue1 Relegation play-off 16-16', 'ligue1 Relegation 17-18',
      'bundesliga Champions League 1-4', 'bundesliga Europa League 5-5', 'bundesliga Conference League 6-6', 'bundesliga Relegation play-off 16-16', 'bundesliga Relegation 17-18',
      'ucl Round of 16 1-8', 'ucl Knockout play-offs 9-24', 'ucl Eliminated 25-36',
    ])
  })

  it('draws a place solid in its destination’s hue', () => {
    const places = zones.filter((zone) => zone.band === 'place')
    expect(new Set(places.map((zone) => zone.name))).toEqual(new Set(['Champions League', 'Europa League', 'Conference League', 'Round of 16']))
    for (const zone of places) {
      const expected = zone.name === 'Europa League' ? hue('uel') : zone.name === 'Conference League' ? hue('uecl') : hue('ucl')
      expect(zone.color, `${zone.league} ${zone.name}`).toBe(expected)
    }
  })

  it('breaks a play-off for a place, in the same hue as the place (ruling 22)', () => {
    const playoffs = zones.filter((zone) => zone.band === 'playoff')
    expect(playoffs.map((zone) => `${zone.league} ${zone.name}`)).toEqual(['ligue1 UCL Qualifying', 'ucl Knockout play-offs'])
    for (const zone of playoffs) expect(zone.color).toBe(hue('ucl'))
  })

  it('draws relegation in blood, broken for a play-off, and Eliminated in muted ink (ruling 23)', () => {
    const named = (band: string) => zones.filter((zone) => zone.band === band).map((zone) => `${zone.league} ${zone.name}`)
    expect(named('relegation-playoff')).toEqual(['ligue1 Relegation play-off', 'bundesliga Relegation play-off'])
    expect(named('relegation')).toEqual(['laliga Relegation', 'pl Relegation', 'seriea Relegation', 'ligue1 Relegation', 'bundesliga Relegation'])
    expect(named('eliminated')).toEqual(['ucl Eliminated'])
    // These three kinds lead to no competition, so they carry no hue: the stylesheet names their ink.
    for (const zone of zones.filter((entry) => entry.band !== 'place' && entry.band !== 'playoff')) expect(zone.color, zone.name).toBeUndefined()
  })

  it('retires the first edition’s floodlight play-off band and burnt-orange Eliminated band', () => {
    for (const zone of zones) expect(zone.color ?? '', zone.name).not.toMatch(/var\(|floodlight|accent/)
  })
})
