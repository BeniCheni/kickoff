import { useMemo, useState } from 'react'
import {
  COMPETITIONS,
  LEAGUE_TABLES,
  ZONES_SEASON,
  zoneRange,
  type CompetitionKey,
} from '../lib/competitions'
import {
  clubsInHand,
  groupTableRows,
  matchdayProgress,
  STANDINGS,
  tableFor,
  type TableRow,
} from '../lib/standings'
import { useUrlState } from '../lib/useUrlState'
import { encodeLeague, parseLeague } from '../lib/urlCodecs'
import { useNow } from '../lib/useNow'
import { META } from '../lib/fixtures'
import { FormPips } from './FormPips'
import { LeagueTabs } from './LeagueTabs'
import { NextFixtureCell } from './NextFixtureCell'
import { ZoneMark, ZonesKey } from './ZonesKey'
import { PageFoot } from './PageFoot'
import { RegisterCover } from './RegisterCover'

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

/* The nine figure columns of the desktop table, in order, each with the key it sorts by.
 * W, D and L have none: the sort has never read them, and the repaint does not add one. */
const DESKTOP_HEADS: ReadonlyArray<readonly [SortKey | null, string]> = [
  ['pl', 'Pl'], [null, 'W'], [null, 'D'], [null, 'L'],
  ['gf', 'GF'], ['ga', 'GA'], ['gd', 'GD'], ['pts', 'Pts'], ['ppg', 'PPG'],
]

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

/** Beside each club that has played fewer matches than the league's most-played: how many. */
function InHandChip({ n }: { n: number }) {
  return (
    <span className="inhand-chip" data-voice="amber">
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
    <div data-zone-divider={zone.name} className={['register-zone flex items-center gap-2', wide ? 'pt-2.5 pb-1.5' : 'px-3.5 pt-2 pb-1.5', zone.to - zone.from + 1 > 8 ? `sticky z-[1] ${wide ? 'top-[44px]' : 'top-11'}` : ''].join(' ')}>
      <ZoneMark zone={zone} shape="square" />
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

  const picker = <LeagueTabs league={league} onPick={pickLeague} />
  if (!rows.length) {
    return <div className="register">
      <RegisterCover league={comp.name} asOf={null} />
      {picker}
      <p className="register-note" data-voice="ink" data-empty-table="">
        No table in the snapshot for {comp.name} — {META.standingsDegraded?.includes(league)
          ? 'the provider no longer supplies the configured league-phase table.'
          : <>run <code>npm run sync</code>.</>}
      </p>
    </div>
  }

  return (
    <div className="register">
      <RegisterCover
        league={comp.name}
        asOf={progress ? `As of matchday ${progress.played} of ${progress.of}${meta.phase ? ` · ${meta.phase}` : ''}` : null}
      />
      {picker}

      {/* games in hand: amber heading and left rule, the sentence in ink */}
      {inHand > 0 && (
        <div className="inhand-note" data-inhand-note="">
          <p className="inhand-note-heading" data-voice="amber">{meta.phase ? 'Matches played' : 'Games in hand'}</p>
          <p className="inhand-note-copy" data-voice="ink">
            {inHand === 1 ? 'One club has' : `${inHand} clubs have`}{meta.phase
              ? ' played fewer matches.'
              : <> a game in hand — sort by <b>PPG</b> to compare like with like.</>}
          </p>
        </div>
      )}
      <ZonesKey
        meta={meta}
        open={legendOpen}
        onToggle={() => setLegendOpen((v) => !v)}
        zonesCurrent={zonesCurrent}
        snapshotSeason={STANDINGS.season}
        zonesSeason={ZONES_SEASON}
      />

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
                <ZoneMark zone={zonesCurrent ? r.zone : null} shape="band" />
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
          <p className="register-note" data-voice="ink" data-sorted-note="">
            Sorted by {SORT_LABEL[sort]}. The Pos column still shows league position, and zone
            bands are hidden because they only describe the canonical order.
          </p>
        )}
        <div className={`sticky top-0 z-10 grid h-[44px] ${DESKTOP_COLS} register-labels register-labels-wide`}>
          <div />
          <div className="pl-2">Pos</div>
          <div />
          <div className="register-head-club">Club</div>
          {/* Six columns sort, and each of those is a button. W, D and L do not, so they are
              text: a button that does nothing is a stop on the way that leads nowhere. */}
          {DESKTOP_HEADS.map(([key, label]) => key ? (
            <button
              key={label}
              type="button"
              onClick={() => setSort(key)}
              className="register-sort"
              data-sorted={sort === key ? '' : undefined}
            >
              {label}
            </button>
          ) : (
            <div key={label} className="register-head">{label}</div>
          ))}
          <div className="pl-1">Form →</div>
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
                <ZoneMark zone={showZonesDesktop ? r.zone : null} shape="band" />
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
                {/* Five 15px pips and four 2px gaps are 83px, in an 88px column. */}
                <div className="pl-1">
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
      </div>

      <PageFoot kind="table">
        Table read from ESPN's standings feed by npm run sync, never recomputed locally. Form and next fixture join to the fixtures snapshot.
      </PageFoot>
    </div>
  )
}
