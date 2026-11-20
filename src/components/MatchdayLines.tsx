import { matchdayLines, type MatchdayLine } from '../lib/matchdays'
import type { Fixture } from '../lib/schema'

/** Day-level provenance, shared by every lens; each baseline has its own line. */
export function MatchdayLines({ fixtures, className = '' }: { fixtures: readonly Fixture[]; className?: string }) {
  return <MatchdayText lines={matchdayLines(fixtures)} className={className} />
}

export function MatchdayText({ lines, className }: { lines: MatchdayLine[]; className?: string }) {
  if (!lines.length) return null
  return <div className={className}>
    {lines.map(line => <div key={line.key} data-matchday-state={line.state}
      className="matchday-line" data-voice={line.state === 'computed' ? 'ink' : 'amber'}>
      {line.text.replace(/(?<![·—]) /g, '\u00a0')}
    </div>)}
  </div>
}
