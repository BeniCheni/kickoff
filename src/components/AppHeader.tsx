import type { ReactNode } from 'react'
import { META, SYNC_STAMP } from '../lib/fixtures'

/** Wordmark, Brooklyn line, version stamp and theme button. The label is a slot:
 *  Vite passes one string, and the Next shell passes two CSS-switched spans. */
export function AppHeader({ version, themeLabel, onToggleTheme }: {
  version: string
  themeLabel: ReactNode
  onToggleTheme: () => void
}) {
  return (
    <header data-moments-background="header" className="mb-4 flex items-start justify-between pb-1">
      <div className="leading-none">
        <span className="font-display block text-[34px] font-bold tracking-wide uppercase">Kickoff</span>
        <span className="label-caps block text-[13px] text-pitch">Brooklyn · ET</span>
        <span className="label-caps mt-1 block text-[10px] text-floodlight-strong">
          v{version} · {META.total} fixtures · synced {SYNC_STAMP}
        </span>
      </div>
      <button
        onClick={onToggleTheme}
        className="label-caps cursor-pointer rounded border-[1.5px] border-ink bg-ink px-3.5 py-2.5 text-[11px] text-bg"
      >
        {themeLabel}
      </button>
    </header>
  )
}
