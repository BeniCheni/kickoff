import { useState } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { SearchProvider, useCanonicalSearch, useUrlState } from '../../src/lib/useUrlState'
import { encodeTab, parseTab } from '../../src/lib/urlCodecs'
import { popTo } from './rig'

function Tabs() {
  const [tab, setTab] = useUrlState('tab', 'fixtures', encodeTab, parseTab, 'push')
  useCanonicalSearch('2026-09-14')
  const [, bump] = useState(0)
  return <button onClick={() => { setTab(tab === 'fixtures' ? 'table' : 'moments'); bump(n => n + 1) }}>{tab}</button>
}

describe('one history owner', () => {
  it('a server search and its hydration render the same tab', async () => {
    window.history.replaceState(null, '', '/?tab=table&watch=clip&x=1&x=2#keep')
    const html = renderToString(<SearchProvider search="?tab=table&watch=clip&x=1&x=2"><Tabs /></SearchProvider>)
    expect(html).toContain('table')
    const host = document.createElement('div')
    host.innerHTML = html
    const recoverable: unknown[] = []
    await act(async () => {
      hydrateRoot(host, <SearchProvider search="?tab=table&watch=clip&x=1&x=2"><Tabs /></SearchProvider>, {
        onRecoverableError(error) { recoverable.push(error) },
      })
    })
    expect(recoverable).toEqual([])
    expect(host.textContent).toContain('table')
    expect(window.location.hash).toBe('#keep')
    expect(new URLSearchParams(window.location.search).getAll('x')).toEqual(['1', '2'])
    expect(new URLSearchParams(window.location.search).get('watch')).toBe('clip')
  })

  it('tab pushes, and Back and Forward re-render', () => {
    // jsdom does not traverse session history (history.back is unimplemented). The push is
    // a real pushState. Back and Forward are the popstate those buttons fire.
    window.history.replaceState(null, '', '/')
    render(<SearchProvider search=""><Tabs /></SearchProvider>)
    expect(screen.getByRole('button').textContent).toBe('fixtures')
    fireEvent.click(screen.getByRole('button'))
    expect(window.location.search).toBe('?tab=table')
    expect(screen.getByRole('button').textContent).toBe('table')
    act(() => popTo('/'))
    expect(screen.getByRole('button').textContent).toBe('fixtures')
    act(() => popTo('/?tab=table'))
    expect(screen.getByRole('button').textContent).toBe('table')
  })
})
