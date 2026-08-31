import type { ReactNode } from 'react'

export type Tab = 'fixtures' | 'table'

const TABS: Array<{ key: Tab; label: string }> = [
  { key: 'fixtures', label: 'Fixtures' },
  { key: 'table', label: 'Table' },
]

/**
 * The persistent Fixtures / Table switcher, rendered identically on every page. Treatment
 * follows the standings design reference: Oswald caps on a shared hairline, the active tab
 * in ink with an underline in the lens's leading accent (pitch; floodlight in Broadcast).
 * A "Results" tab joins this row when that view exists. `children` is the lens switcher,
 * right-aligned on the same hairline — flex-wrap drops it to its own line at 390px.
 */
export function TabNav({
  tab,
  onSelect,
  children,
}: {
  tab: Tab
  onSelect: (t: Tab) => void
  children?: ReactNode
}) {
  return (
    <nav className="mb-5 flex flex-wrap items-end gap-x-4 border-b-[1.5px] border-line">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          aria-current={tab === key ? 'page' : undefined}
          className={[
            'label-caps cursor-pointer pb-2 text-[13px]',
            tab === key
              ? 'text-ink shadow-[inset_0_-2.5px_0_var(--accent-lead)]'
              : 'text-ink-muted hover:text-ink-secondary',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
      {children}
    </nav>
  )
}
