import type { ReactNode } from 'react'
import { COPY } from '../../copy.ts'
import { displayUsd } from '../../shared/display.ts'
import type { ThemeName } from '../../shared/theme.ts'
import { TAB_LABELS, STUDIO_TABS, type ShellView, type StudioTab } from '../../shared/types.ts'

function lead(text: string) {
  const split = text.indexOf('. ')
  if (split === -1) return text
  return (
    <>
      <b>{text.slice(0, split + 1)}</b>
      {text.slice(split + 1)}
    </>
  )
}

export function StudioShell({
  shell,
  tab,
  theme,
  onTab,
  onTheme,
  children,
}: {
  shell: ShellView
  tab: StudioTab
  theme: ThemeName
  onTab: (tab: StudioTab) => void
  onTheme: () => void
  children?: ReactNode
}) {
  const balance = shell.balance
    ? `${displayUsd(shell.balance.amountUsd)}${shell.balance.aboveCeiling ? ' · above the cap' : ''}`
    : 'not recorded'
  const session = shell.session ? displayUsd(shell.session.spendUsd) : 'not open'
  return (
    <div className="studio">
      <div className="studio-wrap">
        <header className="studio-head">
          <div>
            <span className="kh-word">Kickoff</span>
            <span className="kh-sub">Studio · {shell.host}:{shell.port} · this Mac only</span>
            <span className="kh-meta">transport={shell.transport} · fal={shell.fal} · database={shell.databaseEngine} · storage={shell.storage}</span>
          </div>
          <div className="studio-meta">
            <span>fal balance <b>{balance}</b> · cap ≤ {displayUsd(shell.caps.prepaidCeilingUsd)}</span>
            <span>session <b>{session}</b> of {displayUsd(shell.caps.sessionUsd)}</span>
            <span>per job cap <b>{displayUsd(shell.caps.perJobUsd)}</b></span>
            <span>Supabase <b>{shell.database === 'reachable' ? 'reachable' : 'paused'}</b></span>
          </div>
        </header>
        <nav className="studio-tabs" aria-label="Studio">
          {STUDIO_TABS.map((id) => (
            <button key={id} type="button" aria-current={id === tab ? 'page' : undefined} onClick={() => onTab(id)}>
              {TAB_LABELS[id]}
            </button>
          ))}
        </nav>
        {shell.database === 'unavailable' ? (
          <div className="studio-banner" data-kind="ledger" role="status">{lead(COPY.databaseUnavailable)}</div>
        ) : null}
        {shell.outOfCredit ? (
          <div className="studio-banner" role="status">{lead(COPY.outOfCredit)}</div>
        ) : null}
        <main id="studio-main">{children}</main>
        <button type="button" className="studio-theme" onClick={onTheme}>
          {theme === 'dark' ? 'Use light theme' : 'Use dark theme'}
        </button>
      </div>
    </div>
  )
}
