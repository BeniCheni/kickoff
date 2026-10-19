import { useEffect, useState } from 'react'
import { getShell } from './api.ts'
import { ComposePage } from './compose.tsx'
import { JobsPage } from './jobs.tsx'
import { PublishPage } from './publish.tsx'
import { ReviewPage } from './review.tsx'
import { StudioShell } from './shell.tsx'
import { readStoredTheme, resolveTheme, type ThemeName } from '../../shared/theme.ts'
import { TAB_LABELS, type ShellView, type StudioTab } from '../../shared/types.ts'

function tabFromHash(): StudioTab {
  const name = window.location.hash.replace('#', '')
  if (name === 'jobs' || name === 'review' || name === 'publish' || name === 'import' || name === 'compose') return name
  return 'compose'
}

export function App() {
  const [shell, setShell] = useState<ShellView | null>(null)
  const [failed, setFailed] = useState(false)
  const [tab, setTab] = useState<StudioTab>(tabFromHash)
  const [theme, setTheme] = useState<ThemeName>(() => resolveTheme(
    readStoredTheme(() => localStorage.getItem('kickoff-theme')),
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  ))

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('kickoff-theme', theme)
    } catch {
      /* a thrown store still leaves the attribute set */
    }
  }, [theme])

  useEffect(() => {
    const onHash = () => setTab(tabFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  function refreshShell() {
    getShell().then(setShell).catch(() => setFailed(true))
  }

  useEffect(() => {
    refreshShell()
  }, [])

  if (failed) return <p className="studio-help" role="alert">The Studio admin refused this request.</p>
  if (!shell) return <p className="studio-help">Reading the Studio’s records.</p>
  return (
    <StudioShell
      shell={shell}
      tab={tab}
      theme={theme}
      onTab={(next) => {
        window.location.hash = next
        setTab(next)
      }}
      onTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {tab === 'jobs' ? <JobsPage shell={shell} onShell={refreshShell} /> : tab === 'compose' ? <ComposePage shell={shell} onShell={refreshShell} /> : tab === 'review' ? <ReviewPage shell={shell} onShell={refreshShell} /> : tab === 'publish' ? <PublishPage shell={shell} onShell={refreshShell} /> : <h1>{TAB_LABELS[tab]}</h1>}
    </StudioShell>
  )
}
