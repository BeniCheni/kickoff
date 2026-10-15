'use client'

import { SearchProvider, useCanonicalSearch, useUrlState } from '../../src/lib/useUrlState'
import { encodeLens, parseLens, DEFAULT_LENS } from '../../src/lib/lens'
import { encodeTab, parseTab } from '../../src/lib/urlCodecs'
import { useNow } from '../../src/lib/useNow'

export function Shell({ search }: { search: string }) {
  return <SearchProvider search={search}><ShellInner /></SearchProvider>
}

function ShellInner() {
  const { today } = useNow()
  const standings = 'tab' + 'le'
  const [tab, setTab] = useUrlState('tab', 'fixtures', encodeTab, parseTab, 'push')
  const [lens, setLens] = useUrlState('lens', DEFAULT_LENS, encodeLens, parseLens, 'replace')
  useCanonicalSearch(today)
  return (
    <main>
      <h1>Kickoff — unreleased scaffold</h1>
      <p>This is an unreleased scaffold of the next Kickoff app. It shows no fixtures.</p>
      <p>{tab}</p>
      <button onClick={() => setTab(tab === standings ? 'moments' : standings)}>Switch tab</button>
      <button onClick={() => setLens(lens === 'broadcast' ? 'poster' : 'broadcast')}>Switch lens</button>
    </main>
  )
}
