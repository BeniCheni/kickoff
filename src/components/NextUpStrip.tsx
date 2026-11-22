import { useMemo } from 'react'
import { COMPETITIONS, COMPETITION_KEYS, type CompetitionKey } from '../lib/competitions'
import { brooklynDate, daysUntil, fixtureTimes, niceDate } from '../lib/time'
import { useNow } from '../lib/useNow'
import { META, upcoming } from '../lib/fixtures'
import type { Fixture } from '../lib/schema'

const ALL = new Set(COMPETITION_KEYS)

function Card({ fixture, today }: { fixture: Fixture; today: string }) {
  const { brooklyn, local } = fixtureTimes(fixture.kickoffUtc, fixture.venueTz)
  const days = daysUntil(brooklyn.isoDate, today)
  return <div className="next-card" data-next-id={fixture.id}>
    <div className="next-day"><i className="competition-dot" aria-hidden="true"
      style={{ backgroundColor: COMPETITIONS[fixture.competition].color }} />
      {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`}
    </div>
    {fixture.timeConfidence === 'exact' ? <div className="next-clocks">
      <span className="fixture-clock" data-voice="pitch">{brooklyn.time}</span>
      <span className="stadium-clock" data-voice={local ? 'muted' : 'amber'}>
        {local ? `${local.clock24} local` : 'local time not known'}
      </span>
    </div> : <i className="fixture-unset italic" data-voice="amber">TBC</i>}
    <div className="next-pairing">{fixture.home.name} v {fixture.away.name}</div>
  </div>
}

export function NextUpStrip({ today, active }: { today: string; active: ReadonlySet<CompetitionKey> }) {
  const { nowUtcIso } = useNow()
  const next = useMemo(() => upcoming(today, nowUtcIso, active, Infinity), [today, nowUtcIso, active])
  const cards = next.slice(0, 4)
  const moreToday = next.slice(4).filter(f => brooklynDate(f.kickoffUtc) === today)
  const nextMore = moreToday[0]
  const filtered = !cards.length && active.size < ALL.size && upcoming(today, nowUtcIso, ALL, 1).length > 0

  return <section className="next-up" aria-label="Next up">
    <h2 className="next-heading">Next up</h2>
    {cards.length ? <div className="next-cards">
      {cards.map(f => <Card key={f.id} fixture={f} today={today} />)}
    </div> : <p className="next-empty">{filtered
      ? 'Your filters hide every upcoming fixture.'
      : `No upcoming fixtures through ${niceDate(META.window.to)}, the end of this snapshot.`}</p>}
    {nextMore && <p className="next-more">
      +{moreToday.length} more today · {nextMore.home.name} v {nextMore.away.name}
      {nextMore.timeConfidence === 'exact' && `, ${fixtureTimes(nextMore.kickoffUtc, nextMore.venueTz).brooklyn.time}`}
    </p>}
  </section>
}
