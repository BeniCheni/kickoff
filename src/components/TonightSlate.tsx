import { COMPETITIONS, type CompetitionKey } from '../lib/competitions'
import { fixtureTimes } from '../lib/time'
import { fixturesOn, nextMatchday } from '../lib/fixtures'
import { dominantCompetition, slateSubLine } from '../lib/lensSelectors'
import { posterDayTitle } from './PosterWeek'
import type { Fixture } from '../lib/schema'

/** "1:30 PM" → big clock, small meridiem — the Poster template's own split. */
function SlateTime({ fixture }: { fixture: Fixture }) {
  if (fixture.timeConfidence !== 'exact') {
    return <span className="font-mono text-[13px] font-medium text-floodlight italic">TBC</span>
  }
  const time = fixtureTimes(fixture.kickoffUtc, fixture.venueTz).brooklyn.time
  const at = time.lastIndexOf(' ')
  return (
    <>
      <span className="font-mono text-[24px] leading-none font-semibold">{time.slice(0, at)}</span>
      <span className="font-mono text-[10px] font-medium text-ink-muted">{time.slice(at + 1)}</span>
    </>
  )
}

/**
 * Poster's hero: tonight's remaining slate as a full-bleed block railed in the day's
 * dominant competition colour, each fixture on a 4px competition rail with a 24px mono
 * clock. When nothing is left today it shows the next matchday — and says so.
 */
export function TonightSlate({
  today,
  active,
}: {
  today: string
  active: ReadonlySet<CompetitionKey>
}) {
  const remainingToday = fixturesOn(today, active)
    .filter((f) => f.status === 'scheduled' || f.status === 'in_play')
    .sort((a, b) => a.kickoffUtc.localeCompare(b.kickoffUtc))

  const isTonight = remainingToday.length > 0
  const date = isTonight ? today : nextMatchday(today, active)
  const slate = isTonight
    ? remainingToday
    : date
      ? fixturesOn(date, active)
          .filter((f) => f.status === 'scheduled' || f.status === 'in_play')
          .sort((a, b) => a.kickoffUtc.localeCompare(b.kickoffUtc))
      : []

  if (date === null || slate.length === 0) {
    return (
      <div className="rounded border border-line bg-surface px-3.5 py-3 text-[13px] text-ink-muted">
        No upcoming fixtures match your filters.
      </div>
    )
  }

  const dominant = dominantCompetition(slate)
  const sub = slateSubLine(slate, isTonight)

  return (
    <div
      className="-mx-5 border-l-[12px] bg-surface-alt py-4 pr-5 pl-4"
      style={{ borderLeftColor: dominant ? COMPETITIONS[dominant].color : 'var(--border-strong)' }}
    >
      <div className="label-caps text-[11px] text-ink-secondary">
        {isTonight ? "Tonight's slate" : 'Next matchday — nothing left today'}
      </div>
      <div className="font-display mt-1 text-[40px] leading-[1.05] font-bold uppercase">
        {posterDayTitle(date)}
      </div>
      <div className="font-mono mt-1.5 text-[11px] font-medium tracking-[0.06em] text-ink-secondary">
        {sub}
      </div>
      <div className="mt-2.5">
        {slate.map((f) => (
          <div
            key={f.id}
            className="flex items-baseline gap-2.5 border-t border-line border-l-4 py-[7px] pl-2.5"
            style={{ borderLeftColor: COMPETITIONS[f.competition].color }}
          >
            <SlateTime fixture={f} />
            <span className="min-w-0 truncate text-[13.5px] font-semibold">
              {f.home.name} v {f.away.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
