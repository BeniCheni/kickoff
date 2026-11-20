import { COMPETITIONS, TABLE_LEAGUES, type CompetitionKey } from '../lib/competitions'

/**
 * The Table's league tabs: a button per league, pressed on the one being read.
 *
 * Each tab is drawn 30px tall inside a 44px hit area, three to a row, so six leagues make two
 * rows and 88px. The current tab is a black plate with the pitch underline; the others are
 * ink on the page. No tab carries a hue, a tint or a flag: a league's colour appears on the
 * Table only as a zone band.
 *
 * They stay toggle buttons with aria-pressed, as the chips they replace were. The Table is
 * one view filtered by league, not six panels, so there is no tabpanel for a tablist to own.
 */
export function LeagueTabs({
  league,
  onPick,
}: {
  league: CompetitionKey
  onPick: (league: CompetitionKey) => void
}) {
  return (
    <div data-table-picker className="league-tabs" role="group" aria-label="League">
      {TABLE_LEAGUES.map((key) => (
        <button
          key={key}
          type="button"
          className="league-tab"
          aria-pressed={key === league}
          onClick={() => onPick(key)}
        >
          <span data-stock={key === league ? 'black' : undefined}>{COMPETITIONS[key].name}</span>
        </button>
      ))}
    </div>
  )
}
