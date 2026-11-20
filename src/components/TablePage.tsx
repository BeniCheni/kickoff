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
  groupTableRows,
  hoursSinceStandingsSync,
  matchdayProgress,
  STANDINGS,
  tableFor,
  type TableRow,
} from '../lib/standings'
import { useUrlState } from '../lib/useUrlState'
import { encodeLeague, parseLeague } from '../lib/urlCodecs'
import { useNow } from '../lib/useNow'
import { META } from '../lib/fixtures'
import { CompetitionChip } from './CompetitionChip'
import { FormPips } from './FormPips'
import { NextFixtureCell } from './NextFixtureCell'
import { PageFoot } from './PageFoot'

/**
 * The league table, built to the standings design reference (docs/Kickoff Standings.html):
 * zone bands in the calendar's competition colours, lettered form pips, a PPG column and a
 * games-in-hand chip while played counts are uneven, per-row expansion on mobile, sortable
 * full columns on desktop. Position, points and records come from the provider's official
 * table; sorting off points keeps the Pos column canonical and says so in a banner rather
 * than letting a re-sorted row imply a league position it does not hold.
 */

type SortKey = 'pts' | 'pl' | 'gf' | 'ga' | 'gd' | 'ppg'

/* One source of truth per breakpoint — the header row and every body row must agree. */
const MOBILE_COLS = 'grid-cols-[3px_36px_minmax(0,1fr)_48px_48px]'
const DESKTOP_COLS =
  'grid-cols-[3px_34px_36px_minmax(0,1fr)_44px_26px_26px_26px_44px_44px_44px_44px_44px_88px_146px]'

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

function syncedAgo(now: Date): string {
  const h = hoursSinceStandingsSync(now)
  if (h < 1) return 'synced under an hour ago'
  if (h < 48) return `synced ${Math.round(h)}h ago`
  return `synced ${Math.floor(h / 24)}d ago`
}

/* ------------------------------------ small pieces ------------------------------------ */

/** Up is pitch, down is ink and level is muted ink; the glyph says which, not the colour. */
function Movement({ change }: { change: number }) {
  const glyph = change > 0 ? '▲' : change < 0 ? '▼' : '–'
  return (
    <span className="register-move" data-voice={change > 0 ? 'pitch' : change < 0 ? 'ink' : 'muted'}>
      {glyph}
    </span>
  )
}

/** The sign carries the direction. The second edition has no hue for a goal difference. */
function gdText(gd: number): string {
  return gd > 0 ? `+${gd}` : String(gd)
}

function InHandChip({ n }: { n: number }) {
  return (
    <span className="flex-none rounded-[3px] border border-floodlight px-[3px] font-mono text-[8px] leading-normal font-semibold text-floodlight-strong">
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
    <div data-zone-divider={zone.name} className={['register-zone flex items-center gap-2', wide ? 'pt-2.5 pb-1.5' : 'px-3.5 pt-2 pb-1.5', zone.to - zone.from + 1 > 8 ? `sticky z-[1] ${wide ? 'top-[34px]' : 'top-11'}` : ''].join(' ')}>
      <span className="register-zone-square" style={{ background: zone.color }} />
      <span className="register-zone-name text-[10px]">{zone.name}</span>
      <span className="register-zone-range" data-voice="muted">· {zoneRange(zone)}</span>
      <span className="register-zone-rule" />
    </div>
  )
}

/* -------------------------------------- the page -------------------------------------- */

export function TablePage() {
  const [league, setLeague] = useUrlState<CompetitionKey>(
    'league', 'laliga',
    encodeLeague, parseLeague,
  )
  const [openRow, setOpenRow] = useState<string | null>(null)
  const [legendOpen, setLegendOpen] = useState(false)
  const [sort, setSort] = useState<SortKey>('pts')
  const { today, nowUtcIso } = useNow()

  const rows = useMemo(() => tableFor(league, today, nowUtcIso), [league, today, nowUtcIso])
  const meta = LEAGUE_TABLES[league]!
  const comp = COMPETITIONS[league]
  const progress = matchdayProgress(rows, meta)
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

  const picker = (
    <div data-table-picker className="mb-2.5 flex flex-wrap gap-1.5">
      {TABLE_LEAGUES.map((k) => (
        <CompetitionChip key={k} competition={k} on={k === league} onClick={() => pickLeague(k)} />
      ))}
    </div>
  )
  if (!rows.length) {
    return <div className="register">{picker}
      <div className="rounded border border-line bg-surface px-3.5 py-3 text-[13px] text-ink-muted">
        No table in the snapshot for {comp.name} — {META.standingsDegraded?.includes(league)
          ? 'the provider no longer supplies the configured league-phase table.'
          : <>run <code className="font-mono">npm run sync</code>.</>}
      </div>
    </div>
  }

  return (
    <div className="register">
      {picker}

      {/* freshness + games-in-hand callout */}
      <div className="mb-2.5 rounded-[5px] border border-line border-l-3 border-l-floodlight bg-floodlight-bg px-2.5 py-2">
        <div className="label-caps text-[9.5px] text-floodlight-strong">
          {progress ? `As of matchday ${progress.played} of ${progress.of}${meta.phase ? ` · ${meta.phase}` : ''}` : 'League table'} · {syncedAgo(new Date(nowUtcIso))}
        </div>
        {inHand > 0 && (
          <div className="mt-0.5 text-[11px] leading-normal text-ink-secondary">
            {inHand === 1 ? 'One club has' : `${inHand} clubs have`}{meta.phase
              ? ' played fewer matches.'
              : <> a game in hand — sort by <b>PPG</b> to compare like with like.</>}
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
            game — {meta.phase ? 'different opponents limit the comparison' : 'the honest comparator while clubs have games in hand'} · <b>Form</b> results oldest
            to newest, W / D / L lettered, not colour alone · <b>Next</b> the club's next{' '}
            {meta.phase ? <>match in this competition; domestic and other cup ties are not shown here.</> : <><i>league</i> match — midweek European and cup ties are not shown here.</>}
          </div>
          <div className="label-caps mt-3.5 text-[10px] text-ink-muted">How ties are broken</div>
          <div className="mt-1 text-[10.5px] leading-relaxed text-ink-secondary">{meta.tieBreak}</div>
        </div>
      )}

      {/* -------- mobile table -------- */}
      <div data-table="mobile" className="-mx-5 md:hidden">
        <div className={`sticky top-0 z-10 grid h-11 ${MOBILE_COLS} register-labels`}>
          <div />
          <div className="pl-2">Pos</div>
          <div>Club · Form · Next</div>
          <div className="register-labels-pair"><span>GD</span><span>GF–GA</span></div>
          <div className="register-labels-pair"><span data-voice="ink">Pts</span><span>Played</span></div>
        </div>

        {groupTableRows(rows, zonesCurrent).map((band) => (
          <div key={band.rows[0]!.teamId} data-zone-band={band.zone?.name ?? 'none'}>
            {band.zone && <ZoneDivider zone={band.zone} />}
            {band.rows.map((r) => {
          const open = openRow === r.teamId
          // One fixture per row: the match underway outranks the one after it, so the opponent
          // line and the state beneath it never describe different matches. Whether the lane
          // should show the next fixture as well is a product call, not this component's.
          const matchLane = r.underway ?? r.next
          const matchLabel = r.underway
            ? `Kicked off: ${r.underway.opponentAbbrev} ${r.underway.home ? 'H' : 'A'}`
            : r.next
              ? `Next match: ${r.next.opponentAbbrev} ${r.next.home ? 'H' : 'A'}`
              : `No scheduled ${meta.phase ? 'competition' : 'league'} match`
          return (
            <div key={r.teamId} data-table-row={r.teamId}>
              <button
                onClick={() => setOpenRow(open ? null : r.teamId)}
                aria-expanded={open}
                aria-label={`${r.rank}. ${r.name}, ${r.pts} points from ${r.played} played, ${matchLabel}`}
                className={`grid w-full ${MOBILE_COLS} register-row`}
              >
                <span className="register-band" style={{ background: zonesCurrent ? (r.zone?.color ?? 'transparent') : 'transparent' }} />
                <span className="register-pos">
                  <span>{r.rank}</span>
                  <Movement change={r.rankChange} />
                </span>
                <span className="register-main">
                  <span className="register-club">
                    <span className="register-tile">{r.abbrev}</span>
                    <span className="register-name">{r.shortName}</span>
                    {r.gamesInHand > 0 && <InHandChip n={r.gamesInHand} />}
                  </span>
                  <span className="register-form"><FormPips form={r.form} /></span>
                  {matchLane && <NextFixtureCell lane={matchLane} kickedOff={Boolean(r.underway)} />}
                  {open && (
                    <span className="register-more" data-row-more="">
                      <span><span className="register-more-label" data-voice="muted">W-D-L</span> {r.w}-{r.d}-{r.l}</span>
                      <span><span className="register-more-label" data-voice="muted">PPG</span> {r.ppg}</span>
                    </span>
                  )}
                </span>
                <span className="register-figures">
                  <span>{gdText(r.gd)}</span>
                  <span className="register-sub" data-voice="muted">{r.gf}–{r.ga}</span>
                </span>
                <span className="register-figures">
                  <span className="register-points">{r.pts}</span>
                  <span className="register-sub" data-voice="muted">{r.played}</span>
                </span>
              </button>
            </div>
          )
            })}
          </div>
        ))}
      </div>

      {/* -------- desktop table -------- */}
      <div data-table="desktop" className="hidden md:block">
        {sort !== 'pts' && (
          <div className="mb-1 rounded border border-line bg-floodlight-bg px-3 py-2 text-[11.5px] text-ink-secondary">
            Sorted by {SORT_LABEL[sort]}. The Pos column still shows league position, and zone
            bands are hidden because they only describe the canonical order.
          </div>
        )}
        <div className={`sticky top-0 z-10 grid h-[34px] ${DESKTOP_COLS} register-labels register-labels-wide`}>
          <div />
          <div className="pl-2">Pos</div>
          <div />
          <div>Club</div>
          {(
            [
              ['pl', 'Pl'], [null, 'W'], [null, 'D'], [null, 'L'],
              ['gf', 'GF'], ['ga', 'GA'], ['gd', 'GD'], ['pts', 'Pts'], ['ppg', 'PPG'],
            ] as Array<[SortKey | null, string]>
          ).map(([key, label], i) => (
            <button
              key={i}
              onClick={key ? () => setSort(key) : undefined}
              className={['register-sort', key ? 'cursor-pointer' : 'cursor-default'].join(' ')}
              data-sorted={key && sort === key ? '' : undefined}
            >
              {label}
            </button>
          ))}
          <div className="pl-1.5">Form →</div>
          <div className="pl-1.5">Next</div>
        </div>

        {groupTableRows(sorted, showZonesDesktop).map((band) => (
          <div key={band.rows[0]!.teamId} data-zone-band={band.zone?.name ?? 'none'}>
            {band.zone && <ZoneDivider zone={band.zone} wide />}
            {band.rows.map((r) => {
          const matchLane = r.underway ?? r.next // same precedence as the mobile rows above
          return (
            <div key={r.teamId} data-table-row={r.teamId}>
              <div className={`grid min-h-[46px] ${DESKTOP_COLS} register-row register-row-wide`}>
                <div className="register-band" style={{ background: showZonesDesktop ? (r.zone?.color ?? 'transparent') : 'transparent' }} />
                <div className="register-pos register-pos-wide">
                  <span>{r.rank}</span>
                  <Movement change={r.rankChange} />
                </div>
                <div className="flex justify-center">
                  <span className="register-tile">{r.abbrev}</span>
                </div>
                <div className="register-club pr-2.5">
                  <span className="register-name">{r.name}</span>
                  {r.gamesInHand > 0 && <InHandChip n={r.gamesInHand} />}
                </div>
                <div className="register-num">{r.played}</div>
                <div className="register-num">{r.w}</div>
                <div className="register-num">{r.d}</div>
                <div className="register-num">{r.l}</div>
                <div className="register-num">{r.gf}</div>
                <div className="register-num">{r.ga}</div>
                <div className="register-num">{gdText(r.gd)}</div>
                <div className="register-num register-points">{r.pts}</div>
                <div className="register-num">{r.ppg}</div>
                <div className="pl-1.5">
                  <FormPips form={r.form} />
                </div>
                <div className="min-w-0 pl-1.5">
                  {matchLane && <NextFixtureCell lane={matchLane} kickedOff={Boolean(r.underway)} compact />}
                </div>
              </div>
            </div>
          )
            })}
          </div>
        ))}

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

      <PageFoot kind="table">
        Table read from ESPN's standings feed by npm run sync, never recomputed locally. Form and next fixture join to the fixtures snapshot.
      </PageFoot>
    </div>
  )
}
