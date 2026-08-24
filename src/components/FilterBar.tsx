import { COMPETITIONS, COMPETITION_KEYS, GROUP_LABELS, type CompetitionKey } from '../lib/competitions'

type Props = {
  active: ReadonlySet<CompetitionKey>
  onToggle: (key: CompetitionKey) => void
  onSetGroup: (group: string, on: boolean) => void
  onSetAll: (on: boolean) => void
}

export function FilterBar({ active, onToggle, onSetGroup, onSetAll }: Props) {
  return (
    <details className="mb-4 rounded border border-line bg-surface">
      <summary className="label-caps flex cursor-pointer items-center justify-between gap-2 px-3.5 py-3 text-[12.5px]">
        <span>Filters</span>
        <span className="font-sans text-[10.5px] font-normal tracking-normal normal-case text-ink-muted">
          {active.size === COMPETITION_KEYS.length
            ? `All ${COMPETITION_KEYS.length} competitions shown`
            : `${active.size} of ${COMPETITION_KEYS.length} competitions shown`}
        </span>
      </summary>

      <div className="border-t border-line px-3.5 pt-3 pb-3.5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-[11px] leading-snug text-ink-muted">
            Hide a competition here and it disappears everywhere below.
          </span>
          <button
            onClick={() => onSetAll(true)}
            className="cursor-pointer rounded bg-pitch px-2.5 py-1.5 text-[11px] font-semibold tracking-wide text-white uppercase"
          >
            Show all
          </button>
        </div>

        {GROUP_LABELS.map(({ group, label }) => {
          const keys = COMPETITION_KEYS.filter((k) => COMPETITIONS[k].group === group)
          const allOn = keys.every((k) => active.has(k))
          return (
            <div key={group} className="mb-3 last:mb-0">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="label-caps text-[10px] text-ink-muted">{label}</span>
                <button
                  onClick={() => onSetGroup(group, !allOn)}
                  className="cursor-pointer text-[10.5px] font-semibold text-pitch uppercase"
                >
                  {allOn ? 'Hide all' : 'Show all'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {keys.map((key) => {
                  const on = active.has(key)
                  const c = COMPETITIONS[key]
                  return (
                    <button
                      key={key}
                      onClick={() => onToggle(key)}
                      aria-pressed={on}
                      className={[
                        'cursor-pointer rounded-full border-[1.5px] px-2.5 py-1 text-[11.5px] font-semibold transition-opacity',
                        on ? 'border-transparent text-white' : 'border-line-strong text-ink-secondary opacity-45',
                      ].join(' ')}
                      style={on ? { background: c.color } : undefined}
                    >
                      {c.flag} {c.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </details>
  )
}
