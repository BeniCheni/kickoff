import { COMPETITIONS, COMPETITION_KEYS, GROUP_LABELS } from '../lib/competitions'

/** US broadcast reference. Hand-maintained: rights deals are not in the fixture feed. */
export function WatchPanel() {
  return (
    <details className="mb-4 rounded border border-line bg-surface">
      <summary className="label-caps flex cursor-pointer items-center justify-between gap-2 px-3.5 py-3 text-[12.5px]">
        <span>📺 Where to Watch</span>
        <span className="font-sans text-[10.5px] font-normal tracking-normal normal-case text-ink-muted">
          US streaming &amp; TV, by competition
        </span>
      </summary>
      <div className="border-t border-line px-3.5 pt-3 pb-3.5">
        {GROUP_LABELS.map(({ group, label }) => (
          <div key={group}>
            <div className="label-caps mt-3 mb-1 text-[10px] text-ink-muted first:mt-0">{label}</div>
            {COMPETITION_KEYS.filter((k) => COMPETITIONS[k].group === group).map((k) => {
              const c = COMPETITIONS[k]
              return (
                <div key={k} className="flex items-center gap-2 border-b border-line py-1.5 text-[12px] last:border-b-0">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: c.color }} />
                  <span className="flex-1 font-medium">
                    {c.flag} {c.name}
                  </span>
                  <span className="text-right text-[11px] text-ink-secondary">
                    {c.tv}
                    {c.tvNew && (
                      <span className="ml-1 rounded bg-pitch px-1 py-px text-[8.5px] font-bold text-white">
                        NEW
                      </span>
                    )}
                  </span>
                </div>
              )
            })}
          </div>
        ))}
        <p className="mt-3 text-[10.5px] leading-relaxed text-ink-muted">
          2026-27 rights changes: Bundesliga moved from ESPN+ to USA Network plus free
          ad-supported streaming; UEFA club competitions moved from Paramount+ to Disney+ with
          ABC taking select marquee matches. Verify before planning viewing around them.
        </p>
      </div>
    </details>
  )
}
