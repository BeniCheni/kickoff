import type { TableLane } from '../lib/standings'

/**
 * The Table's next-fixture cell, the same in both layouts.
 *
 * Day, opponent's tile code and (H) or (A) in ink; the Brooklyn clock in pitch; the stadium
 * clock in muted ink, smaller, as "20:30 local". Both clocks are the lane's own, formatted
 * from one UTC instant by fixtureTimes; this file formats nothing. Each unit is a no-break
 * unit, so a clock drops under the opponent where the line is short and is never cut.
 *
 * What it will not print: a clock for a kickoff the league has not set (an amber line takes
 * both clocks' place); a clock or a score beside KICKED OFF; a zone abbreviation or an offset;
 * a stadium clock where the venue's zone is not known ("local time not known" stands there).
 */
export function NextFixtureCell({
  lane,
  kickedOff,
  compact = false,
}: {
  lane: TableLane
  /** The lane is the match underway: its league-set kickoff has passed and no result is in. */
  kickedOff: boolean
  /** The desktop column is narrow, so it keeps the first edition's short words for "not set". */
  compact?: boolean
}) {
  const { brooklyn, local } = lane.times
  const state = kickedOff ? 'kicked-off' : lane.timeConfidence === 'exact' ? 'set' : 'unset'
  return (
    <span className="next-cell" data-next-cell={state}>
      <span data-voice="ink">
        {lane.weekday} · {lane.opponentAbbrev} ({lane.home ? 'H' : 'A'})
      </span>
      {state === 'kicked-off' && (
        <span className="next-cell-state" data-voice="amber">KICKED OFF</span>
      )}
      {state === 'set' && (
        <>
          <span className="next-cell-brooklyn" data-voice="pitch">{brooklyn.time}</span>
          {local ? (
            <span className="next-cell-local" data-voice="muted">{local.clock24} local</span>
          ) : (
            <span className="next-cell-local" data-voice="amber">local time not known</span>
          )}
        </>
      )}
      {state === 'unset' && (
        <span className="next-cell-unset" data-voice="amber">
          {compact ? 'time TBC' : `${brooklyn.isoDate} — kickoff time not yet set`}
        </span>
      )}
    </span>
  )
}
