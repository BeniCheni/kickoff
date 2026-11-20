import type { Tab } from '../lib/urlCodecs'
export type { Tab } from '../lib/urlCodecs'

const DEFAULT_TABS: ReadonlyArray<{ key: Tab; label: string }> = [
  { key: 'fixtures', label: 'Fixtures' },
  { key: 'table', label: 'Table' },
  { key: 'moments', label: 'Moments' },
]

/** Fixtures, Table and Moments. Each hit area is 44px tall and at least 44 wide; the
 *  span is the tab as drawn, 22px tall, the label over an underline at the label's width.
 *  The offline build passes the first two. The lens switch lives in the control row. */
export function TabNav({
  tab,
  onSelect,
  tabs = DEFAULT_TABS,
}: {
  tab: Tab
  onSelect: (t: Tab) => void
  tabs?: ReadonlyArray<{ key: Tab; label: string }>
}) {
  return (
    <nav
      aria-label="Primary"
      data-moments-background="tabs"
      className="imprint-tabs"
      data-imprint-row="tabs"
    >
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          aria-current={tab === key ? 'page' : undefined}
        >
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
