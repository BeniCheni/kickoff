import { useMemo, useState } from 'react'
import {
  COMPETITIONS,
  LEAGUE_TABLES,
  TABLE_LEAGUES,
  ZONES_SEASON,
  zoneRange,
  type CompetitionKey,
} from '../lib/competitions'
import {
  clubsInHand,
  hoursSinceStandingsSync,
  matchdayProgress,
  STANDINGS,
  tableFor,
  type FormResult,
  type TableRow,
} from '../lib/standings'
import { useUrlState } from '../lib/useUrlState'
import { CompetitionChip } from './CompetitionChip'

/**
 * The league table, built to the standings design reference (Kickoff Standings.html):
 * zone bands in the calendar's competition colours, lettered form pips, a PPG column and a
 * games-in-hand chip while played counts are uneven, per-row expansion on mobile, sortable
 * full columns on desktop. Position, points and records come from the provider's official
 * table; sorting off points keeps the Pos column canonical and says so in a banner rather
 * than letting a re-sorted row imply a league position it does not hold.
 */

type SortKey = 'pts' | 'pl' | 'gf' | 'ga' | 'gd' | 'ppg'

/* One source of truth per breakpoint — the header row and every body row must agree. */
const MOBILE_COLS = 'grid-cols-[3px_30px_34px_1fr_38px_38px]'
const DESKTOP_COLS =
  'grid-cols-[3px_42px_32px_minmax(150px,1fr)_34px_28px_28px_28px_36px_36px_42px_46px_48px_100px_120px]'

/** First row of a zone band: the previous row is in a different zone (or there is none). */
function isZoneStart(rows: TableRow[], i: number): boolean {
  const zone = rows[i]?.zone
  return !!zone && rows[i - 1]?.zone?.name !== zone.name
}

const SORT_LABEL: Record<SortKey, string> = {
  pts: 'points', pl: 'matches played', gf: 'goals for', ga: 'goals against',
  gd: 'goal difference', ppg: 'points per game',
}

function sortRows(rows: TableRow[], sort: SortKey): TableRow[] {
  if (sort === 'pts') return rows
  const key = (r: TableRow): number =>
    sort === 'gd' ? r.gd
    : sort === 'gf' ? r.gf
    : sort === 'ga' ? -r.ga
    : sort === 'ppg' ? (r.played ? r.pts / r.played : -1)
    : r.played
  return [...rows].sort((a, b) => key(b) - key(a) || a.rank - b.rank)
}

function syncedAgo(): string {
  const h = hoursSinceStandingsSync()
  if (h < 1) return 'synced under an hour ago'
  if (h < 48) return `synced ${Math.round(h)}h ago`
  return `synced ${Math.floor(h / 24)}d ago`
}

/* ------------------------------------ small pieces ------------------------------------ */

function Movement({ change }: { change: number }) {
  const glyph = change > 0 ? '▲' : change < 0 ? '▼' : '–'
  const color = change > 0 ? 'text-pitch' : change < 0 ? 'text-accent' : 'text-ink-muted'
  return <span className={`text-[8px] leading-none ${color}`}>{glyph}</span>
}

function GdText({ gd, className = '' }: { gd: number; className?: string }) {
  const color = gd > 0 ? 'text-pitch' : gd < 0 ? 'text-accent' : 'text-ink-secondary'
  return (
    <span className={`font-mono font-medium ${color} ${className}`}>
      {gd > 0 ? `+${gd}` : gd}
    </span>
  )
}

/** Lettered W/D/L pips, oldest -> newest, padded to five — legible without colour. */
function FormPips({ form, size = 13 }: { form: FormResult[]; size?: number }) {
  const cells: Array<FormResult | null> = [...form]
  while (cells.length < 5) cells.push(null)
  return (
    <span className="flex gap-0.5">
      {cells.map((c, i) => (
        <span
          key={i}
          style={{ width: size, height: size }}
          className={[
            'inline-flex items-center justify-center rounded-[3px] text-[8px] leading-none font-bold',
            c === 'W' ? 'bg-pitch text-white dark:text-bg'
            : c === 'D' ? 'bg-ink-muted text-white dark:text-bg'
            : c === 'L' ? 'bg-accent text-white dark:text-bg'
            : 'bg-surface-alt text-ink-muted',
          ].join(' ')}
        >
          {c ?? '·'}
        </span>
      ))}
    </span>
  )
}

function InHandChip({ n }: { n: number }) {
  return (
    <span className="flex-none rounded-[3px] border border-floodlight px-[3px] font-mono text-[8px] leading-normal font-semibold text-floodlight">
      +{n}
    </span>
  )
}

function ZoneDivider({
  zone,
  wide = false,
}: {
  zone: NonNullable<TableRow['zone']>
  wide?: boolean
}) {
  return (
    <div className={['flex items-center gap-2', wide ? 'pt-2.5 pb-1.5' : 'px-3.5 pt-2 pb-1.5'].join(' ')}>
      <span
        className={['h-[3px] rounded-[2px]', wide ? 'w-4' : 'w-3.5'].join(' ')}
        style={{ background: zone.color }}
      />
      <span className={['label-caps text-ink-secondary', wide ? 'text-[9.5px]' : 'text-[9px]'].join(' ')}>
        {zone.name}
      </span>
      <span className="h-px flex-1 opacity-35" style={{ background: zone.color }} />
    </div>
  )
}

/* -------------------------------------- the page -------------------------------------- */

export function TablePage() {
  const [league, setLeague] = useUrlState<CompetitionKey>(
    'league', 'laliga',
    (v) => (v === 'laliga' ? null : v),
    (s) => (TABLE_LEAGUES.includes(s as CompetitionKey) ? (s as CompetitionKey) : 'laliga'),
  )
  const [openRow, setOpenRow] = useState<string | null>(null)
  const [legendOpen, setLegendOpen] = useState(false)
  const [sort, setSort] = useState<SortKey>('pts')

  const rows = useMemo(() => tableFor(league), [league])
  const meta = LEAGUE_TABLES[league]!
  const comp = COMPETITIONS[league]
  const progress = matchdayProgress(rows)
  const inHand = clubsInHand(rows)
  // Zone bands only paint when the hand-authored ranges describe the synced season —
  // last season's allocations over this season's table would be confidently wrong.
  const zonesCurrent = STANDINGS.season === ZONES_SEASON
  // The sort control is desktop-only, and the mobile table always renders canonical
  // order — so only the desktop bands follow the sort; mobile keeps its zones.
  const showZonesDesktop = zonesCurrent && sort === 'pts'
  const sorted = useMemo(() => sortRows(rows, sort), [rows, sort])

  const pickLeague = (k: CompetitionKey) => {
    setLeague(k)
    setOpenRow(null)
    setSort('pts')
  }

  if (!rows.length) {
    return (
      <div className="rounded border border-line bg-surface px-3.5 py-3 text-[13px] text-ink-muted">
        No table in the snapshot for {comp.name} — run <code className="font-mono">npm run sync</code>.
      </div>
    )
  }

  return (
    <div>
      {/* league picker */}
      <div className="mb-2.5 flex flex-wrap gap-1.5">
        {TABLE_LEAGUES.map((k) => (
          <CompetitionChip key={k} competition={k} on={k === league} onClick={() => pickLeague(k)} />
        ))}
      </div>

      {/* freshness + games-in-hand callout */}
      <div className="mb-2.5 rounded-[5px] border border-line border-l-3 border-l-floodlight bg-floodlight-bg px-2.5 py-2">
        <div className="label-caps text-[9.5px] text-floodlight">
          {progress ? `As of matchday ${progress.played} of ${progress.of}` : 'League table'} · {syncedAgo()}
        </div>
        {inHand > 0 && (
          <div className="mt-0.5 text-[11px] leading-normal text-ink-secondary">
            {inHand === 1 ? 'One club has' : `${inHand} clubs have`} a game in hand — sort by{' '}
            <b>PPG</b> to compare like with like.
          </div>
        )}
        {!zonesCurrent && (
          <div className="mt-0.5 text-[11px] leading-normal text-ink-secondary">
            Zone bands are hidden: the snapshot is the {STANDINGS.season}-
            {(STANDINGS.season + 1) % 100} season but the zone metadata describes{' '}
            {ZONES_SEASON}-{(ZONES_SEASON + 1) % 100}. Update <code className="font-mono">LEAGUE_TABLES</code>.
          </div>
        )}
      </div>

      {/* zones & key toggle */}
      <button
        onClick={() => setLegendOpen((v) => !v)}
        aria-expanded={legendOpen}
        className="mb-3 flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-line bg-surface px-2.5 py-2 text-left"
      >
        <span className="flex items-center gap-1.5">
          {meta.zones.slice(0, 4).map((z) => (
            <span key={z.name} className="size-[9px] rounded-[2px]" style={{ background: z.color }} />
          ))}
          <span className="label-caps ml-1 text-[10.5px] text-ink">Zones &amp; key</span>
        </span>
        <span className="text-[15px] leading-none text-ink-muted">{legendOpen ? '▴' : '▾'}</span>
      </button>

      {legendOpen && (
        <div className="mb-3 rounded-lg border border-line bg-surface p-3">
          <div className="label-caps text-[10px] text-ink-muted">Qualification zones</div>
          {meta.zones.map((z) => (
            <div key={z.name} className="flex items-start gap-2 border-b border-line py-2 last:border-b-0">
              <span className="mt-0.5 h-[30px] w-1 flex-none rounded-[2px]" style={{ background: z.color }} />
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-semibold">
                  {z.name}{' '}
                  <span className="font-mono text-[9.5px] font-medium text-ink-muted">{zoneRange(z)}</span>
                </div>
                <div className="mt-px text-[10.5px] leading-snug text-ink-secondary">{z.note}</div>
              </div>
            </div>
          ))}
          <div className="label-caps mt-3.5 text-[10px] text-ink-muted">Columns</div>
          <div className="mt-1 text-[10.5px] leading-relaxed text-ink-secondary">
            <b>Pts</b> points · <b>Pl</b> played · <b>GD</b> goal difference · <b>PPG</b> points per
            game — the honest comparator while clubs have games in hand · <b>Form</b> results oldest
            to newest, W / D / L lettered, not colour alone · <b>Next</b> the club's next{' '}
            <i>league</i> match — midweek European and cup ties are not shown here.
          </div>
          <div className="label-caps mt-3.5 text-[10px] text-ink-muted">How ties are broken</div>
          <div className="mt-1 text-[10.5px] leading-relaxed text-ink-secondary">{meta.tieBreak}</div>
        </div>
      )}

      {/* -------- mobile table -------- */}
      <div className="-mx-5 md:hidden">
        <div className={`sticky top-0 z-10 grid h-7 ${MOBILE_COLS} items-center border-y border-t-line border-b-line-strong bg-surface-alt pr-3.5`}>
          <div />
          <div className="label-caps pl-2 text-[9px] text-ink-muted">Pos</div>
          <div />
          <div className="label-caps text-[9px] text-ink-muted">Club</div>
          <div className="label-caps text-right text-[9px] text-ink-muted">GD</div>
          <div className="label-caps text-right text-[9px] text-ink">Pts</div>
        </div>

        {rows.map((r, i) => {
          const open = openRow === r.teamId
          return (
            <div key={r.teamId}>
              {zonesCurrent && isZoneStart(rows, i) && r.zone && <ZoneDivider zone={r.zone} />}
              <button
                onClick={() => setOpenRow(open ? null : r.teamId)}
                aria-expanded={open}
                aria-label={`${r.rank}. ${r.name}, ${r.pts} points from ${r.played} played`}
                className={`grid min-h-[54px] w-full cursor-pointer ${MOBILE_COLS} items-center border-b border-line bg-surface pr-3.5 text-left`}
              >
                <div className="self-stretch" style={{ background: zonesCurrent ? (r.zone?.color ?? 'transparent') : 'transparent' }} />
                <div className="flex flex-col items-center justify-center gap-px pl-2">
                  <span className="font-display text-[15px] leading-none font-semibold">{r.rank}</span>
                  <Movement change={r.rankChange} />
                </div>
                <div className="flex justify-center">
                  <span className="flex size-6 items-center justify-center rounded-[5px] bg-surface-alt font-mono text-[8.5px] font-semibold text-ink-secondary">
                    {r.abbrev}
                  </span>
                </div>
                <div className="min-w-0 pr-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[13.5px] font-semibold">{r.shortName}</span>
                    {r.gamesInHand > 0 && <InHandChip n={r.gamesInHand} />}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <FormPips form={r.form} />
                    {r.next && (
                      <span className="truncate text-[10px] text-ink-muted">
                        {r.next.weekday} · {r.next.opponentAbbrev} ({r.next.home ? 'H' : 'A'})
                      </span>
                    )}
                  </div>
                </div>
                <GdText gd={r.gd} className="text-right text-[11.5px]" />
                <div className="text-right">
                  <div className="font-display text-[19px] leading-none font-bold">{r.pts}</div>
                  <div className="mt-0.5 font-mono text-[8.5px] text-ink-muted">{r.played} pl</div>
                </div>
              </button>

              {open && (
                <div className="border-b border-line-strong bg-surface-alt px-3.5 pt-3 pb-3.5">
                  <div className="text-[12.5px] font-semibold">{r.name}</div>
                  <div className="mt-0.5 text-[10.5px] text-ink-secondary">
                    {r.zone
                      ? `${r.zone.name} place (${zoneRange(r.zone)}). ${r.zone.note}`
                      : 'No qualification or relegation consequence at this position.'}
                  </div>
                  <div className="mt-2.5 grid grid-cols-4 gap-px overflow-hidden rounded-[5px] border border-line bg-line">
                    {(
                      [
                        ['W-D-L', `${r.w}-${r.d}-${r.l}`],
                        ['GF-GA', `${r.gf}-${r.ga}`],
                        ['PPG', r.ppg],
                        ['Played', r.gamesInHand > 0 ? `${r.played} of ${r.played + r.gamesInHand}` : String(r.played)],
                      ] as const
                    ).map(([label, value]) => (
                      <div key={label} className="bg-surface px-1 py-2 text-center">
                        <div className="label-caps text-[8.5px] text-ink-muted">{label}</div>
                        <div className="mt-0.5 font-mono text-[12px] font-semibold">{value}</div>
                      </div>
                    ))}
                  </div>
                  {r.next && (
                    <div className="mt-2.5 rounded-[5px] border border-line border-l-3 border-l-pitch bg-surface px-2.5 py-2">
                      <div className="label-caps text-[8.5px] text-ink-muted">Next league match</div>
                      <div className="mt-0.5 text-[12px] font-semibold">
                        {r.next.home ? 'vs' : 'away at'} {r.next.opponent} · {r.next.weekday}
                      </div>
                      <div className="mt-px text-[10.5px] text-ink-secondary">
                        {r.next.timeConfidence === 'exact' ? (
                          <>
                            🗽 {r.next.times.brooklyn.time} {r.next.times.abbrev} ·{' '}
                            {r.next.times.local.time} local
                          </>
                        ) : (
                          <i className="text-floodlight">
                            {r.next.times.brooklyn.isoDate} — kickoff time not yet set
                          </i>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* -------- desktop table -------- */}
      <div className="hidden md:block">
        {sort !== 'pts' && (
          <div className="mb-1 rounded border border-line bg-floodlight-bg px-3 py-2 text-[11.5px] text-ink-secondary">
            Sorted by {SORT_LABEL[sort]}. The Pos column still shows league position, and zone
            bands are hidden because they only describe the canonical order.
          </div>
        )}
        <div className={`grid h-[34px] ${DESKTOP_COLS} items-center border-b border-line-strong`}>
          <div />
          <div className="label-caps pl-2 text-[9.5px] text-ink-muted">Pos</div>
          <div />
          <div className="label-caps text-[9.5px] text-ink-muted">Club</div>
          {(
            [
              ['pl', 'Pl'], [null, 'W'], [null, 'D'], [null, 'L'],
              ['gf', 'GF'], ['ga', 'GA'], ['gd', 'GD'], ['pts', 'Pts'], ['ppg', 'PPG'],
            ] as Array<[SortKey | null, string]>
          ).map(([key, label], i) => (
            <button
              key={i}
              onClick={key ? () => setSort(key) : undefined}
              className={[
                'label-caps border-0 bg-transparent p-0 text-center text-[9.5px]',
                key ? 'cursor-pointer' : 'cursor-default',
                key && sort === key
                  ? 'text-ink underline decoration-pitch decoration-2 underline-offset-[5px]'
                  : 'text-ink-muted',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
          <div className="label-caps pl-1.5 text-[9.5px] text-ink-muted">Form →</div>
          <div className="label-caps pl-1.5 text-[9.5px] text-ink-muted">Next</div>
        </div>

        {sorted.map((r, i) => {
          return (
            <div key={r.teamId}>
              {showZonesDesktop && isZoneStart(sorted, i) && r.zone && (
                <ZoneDivider zone={r.zone} wide />
              )}
              <div className={`grid min-h-[46px] ${DESKTOP_COLS} items-center border-b border-line bg-surface hover:bg-surface-alt`}>
                <div className="self-stretch" style={{ background: showZonesDesktop ? (r.zone?.color ?? 'transparent') : 'transparent' }} />
                <div className="flex items-center gap-1 pl-2">
                  <span className="font-display text-[16px] leading-none font-semibold">{r.rank}</span>
                  <Movement change={r.rankChange} />
                </div>
                <div className="flex justify-center">
                  <span className="flex size-[26px] items-center justify-center rounded-[5px] bg-surface-alt font-mono text-[9px] font-semibold text-ink-secondary">
                    {r.abbrev}
                  </span>
                </div>
                <div className="flex min-w-0 items-center gap-1.5 pr-2.5">
                  <span className="truncate text-[14px] font-semibold">{r.name}</span>
                  {r.gamesInHand > 0 && <InHandChip n={r.gamesInHand} />}
                </div>
                <div className="text-center font-mono text-[12px] text-ink-secondary">{r.played}</div>
                <div className="text-center font-mono text-[12px] text-ink-secondary">{r.w}</div>
                <div className="text-center font-mono text-[12px] text-ink-secondary">{r.d}</div>
                <div className="text-center font-mono text-[12px] text-ink-secondary">{r.l}</div>
                <div className="text-center font-mono text-[12px] text-ink-secondary">{r.gf}</div>
                <div className="text-center font-mono text-[12px] text-ink-secondary">{r.ga}</div>
                <GdText gd={r.gd} className="text-center text-[12.5px] font-semibold" />
                <div className="font-display text-center text-[19px] leading-none font-bold">{r.pts}</div>
                <div className="text-center font-mono text-[11.5px] text-ink-secondary">{r.ppg}</div>
                <div className="pl-1.5">
                  <FormPips form={r.form} size={16} />
                </div>
                <div className="min-w-0 pl-1.5">
                  {r.next && (
                    <>
                      <div className="truncate text-[11.5px] font-semibold">
                        {r.next.weekday} · {r.next.opponentAbbrev} ({r.next.home ? 'H' : 'A'})
                      </div>
                      <div className="mt-px font-mono text-[9.5px] text-ink-muted">
                        {r.next.timeConfidence === 'exact'
                          ? `${r.next.times.brooklyn.time} ${r.next.times.abbrev}`
                          : 'time TBC'}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-3.5">
          {meta.zones.map((z) => (
            <div key={z.name} className="flex items-center gap-1.5">
              <span className="size-[11px] rounded-[2px]" style={{ background: z.color }} />
              <span className="text-[11.5px] font-semibold">{z.name}</span>
              <span className="font-mono text-[10px] text-ink-muted">{zoneRange(z)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-line pt-3.5 text-[10px] leading-relaxed text-ink-muted">
        Table read from ESPN's public standings feed by <code className="font-mono">npm run sync</code>{' '}
        — league position, points and records are the provider's official table, never recomputed
        locally, because tie-breakers differ by competition. Form and next-fixture join to the
        fixtures snapshot. Zone hues are the competition colours from the calendar, so a Champions
        League band here matches a Champions League fixture there.
      </div>
    </div>
  )
}
