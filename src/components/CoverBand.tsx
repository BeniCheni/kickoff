import type { Fixture } from '../lib/schema'
import { believablyLive, coverBand, hasKickedOff, isFinal } from '../lib/lensSelectors'
import { fixtureTimes } from '../lib/time'
import { UnsetCount } from './BookDateLine'

function BandOutcome({ fixture, now }: { fixture: Fixture; now: string }) {
  const { result, shootout, status } = fixture
  const score = result && `${result.home}–${result.away}` + (shootout ? ` (${shootout.home}–${shootout.away})` : '')
  if (isFinal(fixture)) {
    const label = status === 'after_penalties' ? 'PENS' : status === 'after_extra_time' ? 'AET' : 'FT'
    return <span className="band-result" data-voice="pitch">{score && score + ' '}{label}</span>
  }
  if (status === 'in_play' && believablyLive(fixture, now)) {
    return <span className="band-result">{score && score + ' '}<b data-voice="alarm">LIVE</b></span>
  }
  if (status === 'in_play' || hasKickedOff(fixture, now)) {
    return <span className="band-result" data-voice="amber">{status === 'in_play' && score && score + ' '}KICKED OFF</span>
  }
  const { brooklyn, local, dayDelta } = fixtureTimes(fixture.kickoffUtc, fixture.venueTz)
  return <span className="band-clocks" data-day-note={dayDelta || undefined}>
    <span data-voice="pitch">{brooklyn.time} ET{dayDelta ? ` (${brooklyn.weekday}, ${dayDelta < 0 ? 'prev.' : 'next'} day)` : ''}</span>
    {' '}<small data-voice={local ? 'muted' : 'amber'}>{local ? local.clock24 + ' local' : 'local time not known'}</small>
  </span>
}

export function CoverBand({ shown, now }: { shown: readonly Fixture[]; now: string }) {
  const band = coverBand(shown)
  return <div className="cover-band">
    {band.named.map(f => <div className="band-entry" key={f.id} data-band-fixture={f.id}>
      <span className="band-names">{f.home.name} v {f.away.name}</span>
      <BandOutcome fixture={f} now={now} />
    </div>)}
    {band.summary && <p className="band-summary">{band.summary}</p>}
    <UnsetCount count={band.unset} />
  </div>
}
