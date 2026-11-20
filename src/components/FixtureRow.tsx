import { COMPETITIONS } from '../lib/competitions'
import type { Lens } from '../lib/lens'
import { hasKickedOff } from '../lib/lensSelectors'
import { unsettledStatus, type Fixture } from '../lib/schema'
import { fixtureTimes } from '../lib/time'
import { StatusPill } from './StatusPill'

type Props = {
  fixture: Fixture
  lens?: Lens
  hot?: boolean
  stale?: boolean
  next?: boolean
  nowUtcIso?: string
}

/** Both layouts describe the same fixture. Only a league-set, settled kickoff has clocks. */
export function FixtureRow({ fixture, lens = 'ledger', hot, stale, next, nowUtcIso }: Props) {
  const comp = COMPETITIONS[fixture.competition]
  const times = fixtureTimes(fixture.kickoffUtc, fixture.venueTz)
  const unsettled = unsettledStatus(fixture.status)
  const unset = !unsettled && fixture.timeConfidence !== 'exact'
  const timed = !unsettled && !unset
  const poster = lens === 'poster'
  const isStale = fixture.status === 'in_play' && stale === true
  const pastScheduled = nowUtcIso !== undefined && hasKickedOff(fixture, nowUtcIso)
  const dayNote = timed && times.dayDelta ? <small className="fixture-day-note">
    ({times.brooklyn.weekday}, {times.dayDelta < 0 ? 'prev.' : 'next'} day)
  </small> : null
  const clock = <span className="fixture-clock" data-voice={unset ? 'ink' : 'pitch'}>
    {poster && dayNote}{timed ? times.brooklyn.time : unset ? '—' : null}{!poster && dayNote}
  </span>
  const result = fixture.result && !pastScheduled && (
    <span className="fixture-score" data-voice={isStale ? 'amber' : fixture.status === 'in_play' ? 'ink' : 'pitch'}>
      {fixture.result.home}–{fixture.result.away}
      {fixture.shootout && ` (${fixture.shootout.home}–${fixture.shootout.away})`}
    </span>
  )
  const pill = <StatusPill status={fixture.status} kickedOff={isStale || pastScheduled}
    next={next === true && timed} lens={lens} />

  return (
    <div className={`fixture-row fixture-${lens}`} data-fixture-id={fixture.id} data-hot={hot || undefined}>
      <div className="fixture-first">
        {!poster && clock}
        <span className="fixture-names">{fixture.home.name} v {fixture.away.name}</span>
        {poster && timed && <span aria-hidden="true" className="fixture-leader" />}
        {poster ? !unsettled && clock : <span className="fixture-outcome">{result}{pill}</span>}
      </div>
      <div className="fixture-meta">
        {poster && <span className="fixture-outcome">{result}{pill}</span>}
        <span className="fixture-competition"><i aria-hidden="true" style={{ backgroundColor: comp.color }} />{comp.name}</span>
        {fixture.venue && <span> · {fixture.venue}</span>}
        {timed && <span> · <span className="stadium-clock" data-voice={times.local ? 'muted' : 'amber'}>
          {times.local ? `${times.local.clock24} local` : 'local time not known'}
        </span></span>}
      </div>
      {unset && <div className="fixture-unset" data-voice="amber">
        {times.brooklyn.weekday} {times.brooklyn.isoDate} — kickoff time not yet set by the league
      </div>}
      {fixture.note && <div className="fixture-note" data-voice="muted">{fixture.note}</div>}
    </div>
  )
}
