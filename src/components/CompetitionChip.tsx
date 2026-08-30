import { COMPETITIONS, type CompetitionKey } from '../lib/competitions'

/**
 * The one competition pill, shared by the fixtures FilterBar and the Table's league
 * picker so the on/off treatment (fill colour, faded outline) can never drift between
 * the two surfaces that show the same competitions.
 */
export function CompetitionChip({
  competition,
  on,
  onClick,
}: {
  competition: CompetitionKey
  on: boolean
  onClick: () => void
}) {
  const c = COMPETITIONS[competition]
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={[
        'cursor-pointer rounded-full border-[1.5px] px-2.5 py-1 text-[11.5px] font-semibold whitespace-nowrap transition-opacity',
        on ? 'border-transparent text-white' : 'border-line-strong text-ink-secondary opacity-50',
      ].join(' ')}
      style={on ? { background: c.color } : undefined}
    >
      {c.flag} {c.name}
    </button>
  )
}
