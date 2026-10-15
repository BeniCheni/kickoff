'use client'

import { useEffect, useRef } from 'react'
import pkg from '../../package.json'
import { TabNav } from '../../src/components/TabNav'
import { LensSwitcher } from '../../src/components/LensSwitcher'
import { StalenessBanner } from '../../src/components/StalenessBanner'
import { ViewBoundary } from '../../src/components/ViewBoundary'
import { MomentsEmpty } from '../../src/components/MomentsEmpty'
import { META, SYNC_STAMP } from '../../src/lib/fixtures'
import { DEFAULT_LENS, encodeLens, parseLens, type Lens } from '../../src/lib/lens'
import { readStoredTheme, resolveThemeFromEnvironment, themeStorageKey, writeStoredTheme, type Theme } from '../../src/lib/theme'
import { useNow } from '../../src/lib/useNow'
import { SearchProvider, useCanonicalSearch, useUrlState } from '../../src/lib/useUrlState'
import { encodeTab, parseTab } from '../../src/lib/urlCodecs'

export function Shell({ search }: { search: string }) {
  return <SearchProvider search={search}><ShellInner /></SearchProvider>
}

function ShellInner() {
  const { today } = useNow()
  const [tab, setTab] = useUrlState('tab', 'fixtures', encodeTab, parseTab, 'push')
  const [lens, setLens] = useUrlState('lens', DEFAULT_LENS, encodeLens, parseLens, 'replace')
  useCanonicalSearch(today)
  const toggleTheme = useTheme(lens)

  return (
    <div className="mx-auto max-w-[780px] px-5 pt-7 pb-16">
      <header data-moments-background="header" className="mb-4 flex items-start justify-between pb-1">
        <div className="leading-none">
          <span className="font-display block text-[34px] font-bold tracking-wide uppercase">Kickoff</span>
          <span className="label-caps block text-[13px] text-pitch">Brooklyn · ET</span>
          <span className="label-caps mt-1 block text-[10px] text-floodlight-strong">
            v{pkg.version} · {META.total} fixtures · synced {SYNC_STAMP}
          </span>
        </div>
        <button
          onClick={toggleTheme}
          className="label-caps cursor-pointer rounded border-[1.5px] border-ink bg-ink px-3.5 py-2.5 text-[11px] text-bg"
        >
          <span className="dark:hidden">Dark mode</span>
          <span className="hidden dark:inline">Light mode</span>
        </button>
      </header>
      <TabNav tab={tab} onSelect={setTab}>
        <LensSwitcher lens={lens} onSelect={setLens} />
      </TabNav>
      {tab === 'moments' ? <ViewBoundary key={`${tab}:${lens}`}><MomentsEmpty /></ViewBoundary> : (
        <div data-moments-background="route"><ViewBoundary key={`${tab}:${lens}`}>
          <StalenessBanner />
          <p>Not ported yet (N3)</p>
        </ViewBoundary></div>
      )}
    </div>
  )
}

function useTheme(lens: Lens) {
  const prevLens = useRef<Lens | null>(null)
  const fadeTimer = useRef<number | undefined>(undefined)
  const sessionThemes = useRef<Partial<Record<ReturnType<typeof themeStorageKey>, Theme>>>({})

  useEffect(() => {
    const root = document.documentElement
    root.dataset.lens = lens
    const next = sessionThemes.current[themeStorageKey(lens)] ?? resolveThemeFromEnvironment(lens)
    root.dataset.theme = next
    if (
      prevLens.current !== null &&
      prevLens.current !== lens &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      root.classList.add('lens-switching')
      window.clearTimeout(fadeTimer.current)
      fadeTimer.current = window.setTimeout(() => root.classList.remove('lens-switching'), 240)
    }
    prevLens.current = lens
    return () => {
      window.clearTimeout(fadeTimer.current)
      root.classList.remove('lens-switching')
    }
  }, [lens])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const key = themeStorageKey(lens)
    const onChange = () => {
      if (sessionThemes.current[key] || readStoredTheme(key)) return
      document.documentElement.dataset.theme = resolveThemeFromEnvironment(lens)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [lens])

  return () => {
    const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
    const next = current === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    sessionThemes.current[themeStorageKey(lens)] = next
    writeStoredTheme(themeStorageKey(lens), next)
  }
}
