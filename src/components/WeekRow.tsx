import { COMPETITION_KEYS } from '../lib/competitions'
import { addDays, weekRange } from '../lib/time'
import { META } from '../lib/fixtures'
import { Glyph } from './glyphs'
import type { Lens } from '../lib/lens'

type Props = {
  start: string; today: string; lens: Lens; count: number; expanded: boolean
  onNavigate: (direction: number) => void; onToday: () => void; onFilters: () => void
}

export function WeekRow({ start, today, lens, count, expanded, onNavigate, onToday, onFilters }: Props) {
  const firstWeek = start <= META.window.from
  const lastWeek = addDays(start, 6) >= META.window.to
  const total = COMPETITION_KEYS.length
  const all = count === total
  const countText = all ? String(total) : `${count} of ${total}`
  return <div className="week-row" data-lens={lens} data-stock={lens === 'poster' ? 'black' : 'paper'}>
    <button aria-label="Previous" type="button" className="week-prev" aria-disabled={firstWeek}
      onClick={firstWeek ? undefined : () => onNavigate(-1)}><Glyph name="chevron" /></button>
    <span className="week-range">{weekRange(start, today)}</span>
    <button type="button" className="week-next" aria-label="Next" aria-disabled={lastWeek}
      onClick={lastWeek ? undefined : () => onNavigate(1)}><Glyph name="chevron" /></button>
    <button type="button" className="week-today" onClick={onToday}>Today</button>
    <button type="button" className="week-filters" aria-expanded={expanded} aria-controls="competition-filters"
      aria-label={`Filters, ${count} of ${total} competitions shown`} onClick={onFilters}>
      <Glyph name="filters" /><span className="filter-prefix">Filters · </span>
      {all && <span className="filter-all">all </span>}{countText}<Glyph name="chevron" />
    </button>
  </div>
}
