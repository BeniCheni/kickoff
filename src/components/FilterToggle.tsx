import { COMPETITIONS, type CompetitionKey } from '../lib/competitions'

export function FilterToggle({ competition, shown, onToggle }: {
  competition: CompetitionKey; shown: boolean; onToggle: (key: CompetitionKey) => void
}) {
  const { name, color } = COMPETITIONS[competition]
  return <button type="button" className="filter-toggle" aria-pressed={shown} onClick={() => onToggle(competition)}>
    <span className="filter-frame">
      <i aria-hidden="true" className="competition-dot" style={shown ? { backgroundColor: color } : undefined} />
      {name}
    </span>
  </button>
}
