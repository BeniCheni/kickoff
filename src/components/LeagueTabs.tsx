import type { CSSProperties } from 'react'
import { COMPETITIONS, TABLE_LEAGUES, type CompetitionKey } from '../lib/competitions'

/**
 * The Table's league tabs: a button per league, pressed on the one being read.
 *
 * Each tab is drawn 30px tall inside a 44px hit area, three to a row, so six leagues make two
 * rows and 88px. The current tab is a black plate with the pitch underline; the others are
 * ink on the page.
 *
 * The current tab also carries its competition's 8px dot, ahead of the name, as boards 07 and
 * 08 draw it. That is the whole of a league's colour here: the handoff allows a competition
 * hue as a dot or a zone band, never as text and never as a tint, so no label takes the hue,
 * no plate is washed with it, and no tab has a flag. The dot is decoration: the name and
 * aria-pressed say which league is being read. Each tab carries its league's key, so what a
 * page shows can be checked against the league that was asked for.
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
          data-league={key}
          onClick={() => onPick(key)}
        >
          <span data-stock={key === league ? 'black' : undefined}>
            {key === league && <i className="league-tab-dot" aria-hidden="true" style={{ '--comp-hue': COMPETITIONS[key].color } as CSSProperties} />}
            {COMPETITIONS[key].name}
          </span>
        </button>
      ))}
    </div>
  )
}
