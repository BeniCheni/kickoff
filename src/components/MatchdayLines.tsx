import { matchdayLines } from '../lib/matchdays'
import type { Fixture } from '../lib/schema'

/** Day-level provenance, shared by every lens; each baseline has its own line. */
export function MatchdayLines({ fixtures, className = '' }: { fixtures: readonly Fixture[]; className?: string }) {
  const lines = matchdayLines(fixtures)
  if (!lines.length) return null
  return <div className={className}>
    {lines.map(line => <div key={line.key} data-matchday-state={line.state}
      className={`font-mono text-[10px] font-medium tracking-[0.06em] uppercase text-floodlight-strong${line.state === 'absent' ? ' italic' : ''}`}>
      {line.text}
    </div>)}
  </div>
}
