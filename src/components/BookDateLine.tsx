import { bookDateLine } from '../lib/lensSelectors'
import type { Fixture } from '../lib/schema'

export function BookDateLine({ date, shown, closed, showMixedUnset = false }: { date: string; shown: readonly Fixture[]; closed: boolean; showMixedUnset?: boolean }) {
  const line = bookDateLine(date, shown, closed)
  return <>
    <p className="book-date"><span>{line.date}</span>{' · '}<span>{line.count}</span>
      {line.ending && <>{' · '}<span data-voice={line.ending === 'FIRST KICKOFF NOT SET' ? 'amber' : undefined}>
        {line.ending}
      </span></>}
    </p>
    {showMixedUnset && !closed && line.ending !== 'FIRST KICKOFF NOT SET' && <UnsetCount count={line.unset} />}
  </>
}

export function UnsetCount({ count }: { count: number }) {
  if (!count) return null
  return <p className="band-unset" data-voice="amber">{count} {count === 1
    ? 'kickoff, time not yet set by the league' : 'kickoffs, times not yet set by the league'}</p>
}
