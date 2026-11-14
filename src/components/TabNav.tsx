import type { ReactNode } from 'react'

import type { Tab } from '../lib/urlCodecs'
export type { Tab } from '../lib/urlCodecs'

const DEFAULT_TABS: ReadonlyArray<{ key: Tab; label: string }> = [
  { key: 'fixtures', label: 'Fixtures' },
  { key: 'table', label: 'Table' },
  { key: 'moments', label: 'Moments' },
]

/**
 * The persistent Fixtures / Table / Moments switcher, rendered identically on every page. Treatment
 * follows the standings design reference: Oswald caps on a shared hairline, the active tab
 * in ink with an underline in the lens's leading accent (pitch, in both lenses).
 * `children` is the lens switcher,
 * right-aligned on the same hairline. wrap-reverse stacks overflow lines upward, so when
 * the switcher can't fit it moves ABOVE the tabs and the tab row keeps the nav's bottom
 * hairline — the active underline must always kiss that line. With three tabs and two
 * lenses the row needs 331 px once Oswald has loaded (Chrome, 14 Nov 2026): it wraps at
 * 360, fits at 375 with under 4 px to spare and at 390 with 19. Until the webfont arrives
 * the fallback face needs 394 px, so all three phone widths start wrapped.
 * (items-start is the bottom edge under wrap-reverse's flipped cross axis.)
 */
export function TabNav({
  tab,
  onSelect,
  children,
  tabs = DEFAULT_TABS,
}: {
  tab: Tab
  onSelect: (t: Tab) => void
  children?: ReactNode
  /** Defaults to Fixtures, Table and Moments. The offline build passes the first two. */
  tabs?: ReadonlyArray<{ key: Tab; label: string }>
}) {
  return (
    <nav
      aria-label="Primary"
      data-moments-background="tabs"
      className="mb-5 flex flex-wrap-reverse items-start gap-x-4 border-b-[1.5px] border-line"
    >
      <div className="flex gap-x-4">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            aria-current={tab === key ? 'page' : undefined}
            className={[
              'label-caps cursor-pointer pb-2 text-[13px]',
              tab === key
                ? 'text-ink shadow-[inset_0_-2.5px_0_var(--accent-lead-strong)]'
                : 'text-ink-muted hover:text-ink-secondary',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>
      {children}
    </nav>
  )
}
