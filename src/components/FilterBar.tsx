import { COMPETITIONS, COMPETITION_KEYS, GROUP_LABELS, type CompetitionKey } from '../lib/competitions'
import type { Lens } from '../lib/lens'
import { FilterToggle } from './FilterToggle'

type Props = {
  active: ReadonlySet<CompetitionKey>
  lens: Lens
  open: boolean
  onToggle: (key: CompetitionKey) => void
  onSetGroup: (group: string, on: boolean) => void
  onShowAll: () => void
}

export function FilterBar({ active, lens, open, onToggle, onSetGroup, onShowAll }: Props) {
  return <div id="competition-filters" data-open={open} className="filter-disclosure"
    aria-hidden={!open} inert={!open}>
    <div className="filter-clip">
      <div className="filter-panel" data-lens={lens} data-stock="paper">
        <div className="filter-heading">
          <p>Hide a competition here and it disappears everywhere below.</p>
          <button type="button" disabled={active.size === COMPETITION_KEYS.length} onClick={onShowAll}>Show all</button>
        </div>
        {GROUP_LABELS.map(({ group, label }) => {
          const keys = COMPETITION_KEYS.filter(key => COMPETITIONS[key].group === group)
          const allOn = keys.every(key => active.has(key))
          const action = allOn ? 'Hide all' : 'Show all'
          return <div key={group} role="group" aria-label={label}>
            <div className="filter-heading">
              <span>{label}</span>
              <button type="button" aria-label={`${action} ${label}`}
                onClick={() => onSetGroup(group, !allOn)}>{action}</button>
            </div>
            <div className="filter-options">
              {keys.map(key => <FilterToggle key={key} competition={key} shown={active.has(key)} onToggle={onToggle} />)}
            </div>
          </div>
        })}
      </div>
    </div>
  </div>
}
