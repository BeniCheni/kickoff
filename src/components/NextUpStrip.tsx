import { useMemo } from 'react'
import { COMPETITIONS, type CompetitionKey } from '../lib/competitions'
import { brooklynDate, daysUntil, fixtureTimes } from '../lib/time'
import { useNow } from '../lib/useNow'
import { upcoming } from '../lib/fixtures'
import type { Fixture } from '../lib/schema'

function countdownLabel(date: string, today: string): string {
  const n = daysUntil(date, today)
  return n <= 0 ? 'Today' : n === 1 ? 'Tomorrow' : `${n} days`
}

/** "11:15 AM" → clock at full size, meridiem small (the Poster hero's own split). A worst
 *  case "12:30 PM" is ~63px; the card's padding and the strip's gaps are sized so it fits
 *  at 375px, and the card clips rather than ever spilling across its neighbour. */
function SplitTime({ time }: { time: string }) {
  const at = time.lastIndexOf(' ')
  return (
    <span className="whitespace-nowrap">
      {time.slice(0, at)}
      <span className="ml-0.5 text-[10px] text-ink-muted">{time.slice(at + 1)}</span>
    </span>
  )
}

function Card({ fixture, today }: { fixture: Fixture; today: string }) {
  const comp = COMPETITIONS[fixture.competition]
  const date = brooklynDate(fixture.kickoffUtc)
  const placeholder = fixture.timeConfidence !== 'exact'
  return (
    <div
      className="min-w-0 flex-1 overflow-hidden rounded border border-line border-b-[3px] bg-surface px-2 py-2"
      style={{ borderBottomColor: comp.color }}
    >
      <div className="font-display text-[9px] font-semibold tracking-[0.1em] text-ink-muted uppercase">
        {countdownLabel(date, today)}
      </div>
      <div className="font-mono mt-0.5 text-[15px] font-semibold">
        {placeholder ? (
          <span className="text-floodlight italic">TBC</span>
        ) : (
          <SplitTime time={fixtureTimes(fixture.kickoffUtc, fixture.venueTz).brooklyn.time} />
        )}
      </div>
      <div className="mt-0.5 truncate text-[10.5px] text-ink-secondary">
        {fixture.home.name} v {fixture.away.name}
      </div>
    </div>
  )
}

/**
 * The Ledger hero: the next four kickoffs as narrow cards that actually fit a 390px
 * viewport, each grounded by a 3px bottom border in its competition colour, with a muted
 * overflow line for the rest of today's slate. Replaces the old 200px ticker cards.
 */
export function NextUpStrip({
  today,
  active,
}: {
  today: string
  active: ReadonlySet<CompetitionKey>
}) {
  const { nowUtcIso } = useNow()
  const next = useMemo(() => upcoming(today, nowUtcIso, active, 500), [today, nowUtcIso, active])
  const cards = next.slice(0, 4)
  const moreToday = next.slice(4).filter((f) => brooklynDate(f.kickoffUtc) === today)
  const nextMore = moreToday[0]

  if (cards.length === 0) {
    return (
      <div>
        <div className="label-caps mb-2 text-[10px] text-ink-muted">Next up</div>
        <div className="rounded border border-line bg-surface px-3.5 py-3 text-[13px] text-ink-muted">
          No upcoming fixtures match your filters.
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="label-caps mb-2 text-[10px] text-ink-muted">Next up</div>
      <div className="flex gap-1.5">
        {cards.map((f) => (
          <Card key={f.id} fixture={f} today={today} />
        ))}
      </div>
      {nextMore && (
        <div className="mt-1.5 text-[10.5px] text-ink-muted">
          +{moreToday.length} more today &middot; {nextMore.home.name} v {nextMore.away.name}
          {nextMore.timeConfidence === 'exact' && (
            <>, {fixtureTimes(nextMore.kickoffUtc, nextMore.venueTz).brooklyn.time}</>
          )}
        </div>
      )}
    </div>
  )
}
