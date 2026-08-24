/**
 * Competition metadata. `espnCode` is the path segment in ESPN's public scoreboard API;
 * `tz` is the IANA zone of the competition's home country, used to render stadium-local
 * kickoff times. Competitions without an `espnCode` are reference-only (their fixtures are
 * not published yet, e.g. UEFA draws) and carry hand-authored placeholder rows.
 */
const RAW = {
  supercup:     { name: 'UEFA Super Cup',        group: 'europe',   tz: 'Europe/Vienna', flag: '⭐', color: '#C4272F', tv: 'Paramount+ · CBS', espnCode: 'uefa.super_cup' },
  shield:       { name: 'FA Community Shield',   group: 'supercup', tz: 'Europe/London', flag: '🏴', color: '#6B4226', tv: 'ESPN · ESPN+',     espnCode: 'eng.charity' },
  tdc:          { name: 'Trophée des Champions', group: 'supercup', tz: 'Europe/Paris',  flag: '🇫🇷', color: '#C05780', tv: 'beIN Sports',      espnCode: 'fra.super_cup' },
  dflsupercup:  { name: 'DFL-Supercup',          group: 'supercup', tz: 'Europe/Berlin', flag: '🇩🇪', color: '#2F4B7C', tv: 'USA Network · Fandango', espnCode: 'ger.super_cup' },
  supercoppa:   { name: 'Supercoppa Italiana',   group: 'supercup', tz: 'Asia/Riyadh',   flag: '🇮🇹', color: '#1B4B5A', tv: 'Paramount+ · CBS Sports Golazo' },
  supercopa:    { name: 'Supercopa de España',   group: 'supercup', tz: 'Asia/Riyadh',   flag: '🇪🇸', color: '#8B1E3F', tv: 'ESPN+' },
  ucl:          { name: 'Champions League',      group: 'europe',   tz: 'Europe/Zurich', flag: '⭐', color: '#8B6FE8', tv: 'Disney+ · ABC (marquee)', tvNew: true },
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
