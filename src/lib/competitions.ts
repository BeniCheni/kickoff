/**
 * Competition metadata. `espnCode` is the path segment in ESPN's public scoreboard API;
 * `tz` is the competition's reference zone, never a fixture's stadium clock. Competitions
 * without an `espnCode` are reference-only: no fixture rows are hand-authored for them.
 */
const RAW = {
  supercup:     { name: 'UEFA Super Cup',        group: 'europe',   tz: 'Europe/Vienna', flag: '⭐', color: '#C4272F', tv: 'Paramount+ · CBS', espnCode: 'uefa.super_cup' },
  shield:       { name: 'FA Community Shield',   group: 'supercup', tz: 'Europe/London', flag: '🏴', color: '#6B4226', tv: 'ESPN · ESPN+',     espnCode: 'eng.charity' },
  tdc:          { name: 'Trophée des Champions', group: 'supercup', tz: 'Europe/Paris',  flag: '🇫🇷', color: '#C05780', tv: 'beIN Sports',      espnCode: 'fra.super_cup' },
  dflsupercup:  { name: 'DFL-Supercup',          group: 'supercup', tz: 'Europe/Berlin', flag: '🇩🇪', color: '#2F4B7C', tv: 'USA Network · Fandango', espnCode: 'ger.super_cup' },
  supercoppa:   { name: 'Supercoppa Italiana',   group: 'supercup', tz: 'Asia/Riyadh',   flag: '🇮🇹', color: '#1B4B5A', tv: 'Paramount+ · CBS Sports Golazo' },
  supercopa:    { name: 'Supercopa de España',   group: 'supercup', tz: 'Asia/Riyadh',   flag: '🇪🇸', color: '#8B1E3F', tv: 'ESPN+' },
  ucl:          { name: 'Champions League',      group: 'europe',   tz: 'Europe/Zurich', flag: '⭐', color: '#8B6FE8', tv: 'Disney+ · ABC (marquee)', tvNew: true, espnCode: 'uefa.champions' },
  uel:          { name: 'Europa League',         group: 'europe',   tz: 'Europe/Zurich', flag: '⭐', color: '#FF7A00', tv: 'Disney+', tvNew: true },
  uecl:         { name: 'Conference League',     group: 'europe',   tz: 'Europe/Zurich', flag: '⭐', color: '#2FB8C4', tv: 'Disney+', tvNew: true },
  laliga:       { name: 'La Liga',               group: 'domestic', tz: 'Europe/Madrid', flag: '🇪🇸', color: '#D85A30', tv: 'ESPN+',            espnCode: 'esp.1' },
  pl:           { name: 'Premier League',        group: 'domestic', tz: 'Europe/London', flag: '🏴', color: '#7F77DD', tv: 'NBC · USA Network · Peacock', espnCode: 'eng.1' },
  seriea:       { name: 'Serie A',               group: 'domestic', tz: 'Europe/Rome',   flag: '🇮🇹', color: '#1D9E75', tv: 'Paramount+ · CBS Sports Golazo', espnCode: 'ita.1' },
  ligue1:       { name: 'Ligue 1',               group: 'domestic', tz: 'Europe/Paris',  flag: '🇫🇷', color: '#378ADD', tv: 'beIN Sports',      espnCode: 'fra.1' },
  bundesliga:   { name: 'Bundesliga',            group: 'domestic', tz: 'Europe/Berlin', flag: '🇩🇪', color: '#BA7517', tv: 'USA Network · Fandango', espnCode: 'ger.1', tvNew: true },
} as const satisfies Record<string, CompetitionMeta>

export type CompetitionKey = keyof typeof RAW

/**
 * Re-typed as a uniform Record so optional members (`espnCode`, `tvNew`) are visible on every
 * entry. `RAW` keeps the literal keys; this view keeps the value type consistent.
 */
export const COMPETITIONS = RAW as Record<CompetitionKey, CompetitionMeta>

type CompetitionMeta = {
  name: string
  group: 'domestic' | 'europe' | 'supercup'
  tz: string
  flag: string
  color: string
  tv: string
  espnCode?: string
  tvNew?: boolean
}

export const COMPETITION_KEYS = Object.keys(COMPETITIONS) as CompetitionKey[]

/** Competitions we can actually sync, paired with their ESPN path segment. */
export const SYNCABLE = COMPETITION_KEYS.flatMap((key) => {
  const code = COMPETITIONS[key].espnCode
  return code ? [{ key, code }] : []
})

/** Display order: one-off trophies first, then European cups, then the domestic leagues. */
const GROUP_RANK = { supercup: 0, europe: 1, domestic: 2 } as const
export function competitionRank(key: CompetitionKey): number {
  return GROUP_RANK[COMPETITIONS[key].group]
}

export const GROUP_LABELS = [
  { group: 'domestic', label: 'Big 5 Leagues' },
  { group: 'europe', label: 'European Cups' },
  { group: 'supercup', label: 'Domestic Supercups' },
] as const

export const BROOKLYN_TZ = 'America/New_York'

/** Venue reference data, keyed on ESPN's country spelling; cities are not reliable keys.
 * IANA zone.tab: https://data.iana.org/time-zones/tzdb/zone.tab
 * Mainland defaults for the countries in the European feeds; island/neutral exceptions
 * belong in the venue-id map below. Kazakhstan has shared UTC+5 since March 2024.
 */
export const VENUE_TZ_BY_COUNTRY: Readonly<Record<string, string>> = {
  England: 'Europe/London', Spain: 'Europe/Madrid', Germany: 'Europe/Berlin',
  France: 'Europe/Paris', Italy: 'Europe/Rome', Netherlands: 'Europe/Amsterdam',
  Portugal: 'Europe/Lisbon', Belgium: 'Europe/Brussels', Greece: 'Europe/Athens',
  Türkiye: 'Europe/Istanbul', Czechia: 'Europe/Prague', Norway: 'Europe/Oslo',
  Austria: 'Europe/Vienna', Denmark: 'Europe/Copenhagen', Poland: 'Europe/Warsaw',
  Cyprus: 'Asia/Nicosia', Romania: 'Europe/Bucharest', Bulgaria: 'Europe/Sofia',
  Scotland: 'Europe/London', Croatia: 'Europe/Zagreb', Switzerland: 'Europe/Zurich',
  Slovakia: 'Europe/Bratislava', Armenia: 'Asia/Yerevan', Slovenia: 'Europe/Ljubljana',
  Hungary: 'Europe/Budapest', Albania: 'Europe/Tirane', Finland: 'Europe/Helsinki',
  Sweden: 'Europe/Stockholm', Latvia: 'Europe/Riga', Kazakhstan: 'Asia/Almaty',
  Georgia: 'Asia/Tbilisi', Andorra: 'Europe/Andorra', Lithuania: 'Europe/Vilnius',
  Serbia: 'Europe/Belgrade', 'Bosnia and Herzegovina': 'Europe/Sarajevo',
  Gibraltar: 'Europe/Gibraltar',
}

/** ESPN venue id → zone. A Canary/Madeira ground or a neutral venue can override a country. */
export const VENUE_TZ_OVERRIDES: Readonly<Record<string, string>> = {}

export function venueTimeZone(country?: string, venueId?: string): string | undefined {
  if (venueId && Object.hasOwn(VENUE_TZ_OVERRIDES, venueId)) return VENUE_TZ_OVERRIDES[venueId]
  return country && Object.hasOwn(VENUE_TZ_BY_COUNTRY, country) ? VENUE_TZ_BY_COUNTRY[country] : undefined
}

/* ------------------------------- league table metadata ------------------------------- */

/**
 * Qualification/relegation zones and tie-break rules for the domestic league tables.
 * Hand-authored reference data, like `tv` above: allocation rules are not in the standings
 * feed. Ranges are for 2026-27 — England and Spain hold a fifth Champions League berth via
 * the 2025-26 association coefficients (a European Performance Spot, not permanent).
 * Zone colours are looked up from the european competitions above, so a Champions League
 * band in the table matches a Champions League fixture in the calendar; relegation uses the
 * theme's accent via `var(--accent)` so it tracks light/dark.
 */
export type Zone = {
  name: string
  /** Inclusive league positions, e.g. from 1 to 5. */
  from: number
  to: number
  /** Static hex from a competition above, or a CSS var for theme-dependent hues. */
  color: string
  note: string
}

export type LeagueTableMeta = {
  /**
   * Expected table size. Cross-checked against the standings feed at sync time — a feed
   * row that fails normalization would otherwise shrink the league silently, which skews
   * games-in-hand and the matchday label downstream.
   */
  teams: number
  /** Phase competitions do not play a double round robin. */
  matches?: number
  phase?: string
  /** One sentence on how level clubs are separated — shown in the Zones & key legend. */
  tieBreak: string
  zones: Zone[]
}

/**
 * The season the zone ranges above describe (start year: 2026 = 2026-27). Zone allocations
 * move year to year — the fifth UCL berths are coefficient-dependent — so the UI compares
 * this against the synced snapshot's season and hides the bands rather than painting last
 * season's zones over this season's table.
 */
export const ZONES_SEASON = 2026

export const MATCHDAY_WINDOWS_SEASON = 2026
export type MatchdayWindow = { md: number; from: string; to: string }
/** UEFA Annex C, inspected 10 Sep 2026: all eight league-phase windows confirmed.
 * https://documents.uefa.com/r/Regulations-of-the-UEFA-Champions-League-2026/27/Annex-C-2026/27-UEFA-Match-Calendar-Online
 * These are reference windows, not per-event official round identities.
 */
export const MATCHDAY_WINDOWS: Partial<Record<CompetitionKey, MatchdayWindow[]>> = {
  ucl: [
    { md: 1, from: '2026-09-08', to: '2026-09-10' },
    { md: 2, from: '2026-10-13', to: '2026-10-14' },
    { md: 3, from: '2026-10-20', to: '2026-10-21' },
    { md: 4, from: '2026-11-03', to: '2026-11-04' },
    { md: 5, from: '2026-11-24', to: '2026-11-25' },
    { md: 6, from: '2026-12-08', to: '2026-12-09' },
    { md: 7, from: '2027-01-19', to: '2027-01-20' },
    { md: 8, from: '2027-01-27', to: '2027-01-27' },
  ],
}

/** "1–5" or "6" — the one place the range formatting rule lives. */
export function zoneRange(z: Zone): string {
  return z.from === z.to ? String(z.from) : `${z.from}–${z.to}`
}

const UCL = RAW.ucl.color
const UEL = RAW.uel.color
const UECL = RAW.uecl.color
const REL = 'var(--accent)'
const PLAYOFF = 'var(--floodlight)'

export const LEAGUE_TABLES: Partial<Record<CompetitionKey, LeagueTableMeta>> = {
  ucl: {
    teams: 36, matches: 8, phase: 'league phase',
    // Article 18: https://documents.uefa.com/r/Regulations-of-the-UEFA-Champions-League-2026/27/Article-18-Equality-of-points-league-phase-Online
    tieBreak: "The Champions League league phase separates level clubs on goal difference first, then goals scored, then away goals, then wins and away wins; only after that do the opponents' collective records, disciplinary points and the club coefficient come into it (Article 18, UEFA Champions League regulations 2026/27).",
    zones: [
      { name: 'Round of 16', from: 1, to: 8, color: UCL, note: 'Direct entry to the round of 16.' },
      { name: 'Knockout play-offs', from: 9, to: 24, color: PLAYOFF, note: 'Two-legged play-offs for the remaining round-of-16 places; ranks 9–16 are seeded.' },
      { name: 'Eliminated', from: 25, to: 36, color: REL, note: 'No transfer to another UEFA competition.' },
    ],
  },
  laliga: {
    teams: 20,
    tieBreak:
      'La Liga separates level clubs on head-to-head record first, then goal difference, then goals scored — which is why a club can sit above another with a worse GD.',
    zones: [
      { name: 'Champions League', from: 1, to: 5, color: UCL, note: 'League phase. Spain holds a fifth berth on the 2025-26 association coefficient — it is not permanent.' },
      { name: 'Europa League', from: 6, to: 6, color: UEL, note: 'League phase. Can shift to 7th if the Copa del Rey winner already qualifies through the league.' },
      { name: 'Conference League', from: 7, to: 7, color: UECL, note: 'Play-off round, not the league phase directly.' },
      { name: 'Relegation', from: 18, to: 20, color: REL, note: 'Straight drop to LALIGA Hypermotion. No play-off in Spain.' },
    ],
  },
  pl: {
    teams: 20,
    tieBreak:
      'The Premier League separates level clubs on goal difference first, then goals scored; head-to-head only comes into it after both of those.',
    zones: [
      { name: 'Champions League', from: 1, to: 5, color: UCL, note: 'League phase. England holds a fifth berth on the 2025-26 association coefficient — it is not permanent.' },
      { name: 'Europa League', from: 6, to: 6, color: UEL, note: 'League phase. Shifts down a place when the FA Cup winner has already qualified through the league.' },
      { name: 'Conference League', from: 7, to: 7, color: UECL, note: 'Play-off round. Nominally the League Cup winner’s spot; it falls to the league when they qualify elsewhere.' },
      { name: 'Relegation', from: 18, to: 20, color: REL, note: 'Straight drop to the Championship. No play-off in England.' },
    ],
  },
  seriea: {
    teams: 20,
    tieBreak:
      'Serie A separates level clubs on head-to-head record first, then goal difference — except a tie for the title or relegation, which goes to a one-off play-off.',
    zones: [
      { name: 'Champions League', from: 1, to: 4, color: UCL, note: 'League phase.' },
      { name: 'Europa League', from: 5, to: 5, color: UEL, note: 'League phase. Shifts down a place when the Coppa Italia winner has already qualified through the league.' },
      { name: 'Conference League', from: 6, to: 6, color: UECL, note: 'Play-off round, not the league phase directly.' },
      { name: 'Relegation', from: 18, to: 20, color: REL, note: 'Straight drop to Serie B.' },
    ],
  },
  ligue1: {
    teams: 18,
    tieBreak:
      'Ligue 1 separates level clubs on goal difference first, then goals scored.',
    zones: [
      { name: 'Champions League', from: 1, to: 3, color: UCL, note: 'League phase for the top three; France is outside the coefficient top four.' },
      { name: 'UCL Qualifying', from: 4, to: 4, color: PLAYOFF, note: 'Enters the third qualifying round, not the league phase.' },
      { name: 'Europa League', from: 5, to: 5, color: UEL, note: 'League phase. Shifts when the Coupe de France winner already qualifies through the league.' },
      { name: 'Conference League', from: 6, to: 6, color: UECL, note: 'Play-off round, not the league phase directly.' },
      { name: 'Relegation play-off', from: 16, to: 16, color: PLAYOFF, note: 'Two-legged barrage against the Ligue 2 play-off winner.' },
      { name: 'Relegation', from: 17, to: 18, color: REL, note: 'Straight drop to Ligue 2.' },
    ],
  },
  bundesliga: {
    teams: 18,
    tieBreak:
      'The Bundesliga separates level clubs on goal difference first, then goals scored, then head-to-head.',
    zones: [
      { name: 'Champions League', from: 1, to: 4, color: UCL, note: 'League phase.' },
      { name: 'Europa League', from: 5, to: 5, color: UEL, note: 'League phase. Shifts down a place when the DFB-Pokal winner has already qualified through the league.' },
      { name: 'Conference League', from: 6, to: 6, color: UECL, note: 'Play-off round, not the league phase directly.' },
      { name: 'Relegation play-off', from: 16, to: 16, color: PLAYOFF, note: 'Two-legged play-off against the third-placed 2. Bundesliga side.' },
      { name: 'Relegation', from: 17, to: 18, color: REL, note: 'Straight drop to 2. Bundesliga.' },
    ],
  },
}

/** Supported tables — domestic leagues first, then European competitions. */
export const TABLE_LEAGUES = COMPETITION_KEYS.filter((k) => k in LEAGUE_TABLES).sort((a, b) => competitionRank(b) - competitionRank(a))

export function zoneFor(key: CompetitionKey, rank: number): Zone | null {
  return LEAGUE_TABLES[key]?.zones.find((z) => rank >= z.from && rank <= z.to) ?? null
}
