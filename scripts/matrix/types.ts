import type { Lens } from '../../src/lib/lens'
import type { Theme } from '../../src/lib/theme'
import type { Tab } from '../../src/lib/urlCodecs'

export type { Lens, Tab, Theme }

/** A short action a later slice can use to reach a state such as Cinema. */
export type CellAction =
  | { click: string }
  | { key: string }
  | { waitFor: string }
  | { waitMs: number }

export type GeometryAssertion = {
  /** `inside`: A's box must lie within B's. `disjoint`: A's box must not meet any B. */
  kind: 'inside' | 'disjoint'
  a: string
  b: string
}

export type HitTestAssertion = { selector: string }

export type Viewport = { width: number; height: number }

/**
 * One cartesian slice. Expansion crosses viewports × lenses × themes × tabs.
 * Lens and tab are written with the app's own URL codecs. Theme is stored the
 * way a visitor's toggle is stored, not as a URL param.
 */
export type MatrixSlice = {
  path?: string
  viewports: readonly Viewport[]
  lenses: readonly Lens[]
  tabs: readonly Tab[]
  themes: readonly Theme[]
  /** Suffix on the screenshot name. Omit for the resting state. */
  state?: string
  query?: Readonly<Record<string, string>>
  /** Defaults to the cell's theme so the stored choice and the media query agree. */
  colorScheme?: 'light' | 'dark'
  /** Default for the shipped config is `reduce`, so lens fades do not move during the shot. */
  reducedMotion?: 'reduce' | 'no-preference'
  /** When true, a media-provider request is allowed. Otherwise it fails the cell. */
  playIntent?: boolean
  actions?: readonly CellAction[]
  /** Overrides the config-wide iframe + video ceiling. */
  maxEmbeds?: number
  geometry?: readonly GeometryAssertion[]
  hitTest?: readonly HitTestAssertion[]
}

export type MatrixConfig = {
  /** Combined iframe + video elements allowed on a cell. Default 1. */
  maxEmbeds?: number
  slices: readonly MatrixSlice[]
}

export type Cell = {
  id: string
  path: string
  width: number
  height: number
  lens: Lens
  tab: Tab
  theme: Theme
  state: string | null
  query: Readonly<Record<string, string>>
  colorScheme: 'light' | 'dark'
  reducedMotion: 'reduce' | 'no-preference'
  playIntent: boolean
  actions: readonly CellAction[]
  maxEmbeds: number
  geometry: readonly GeometryAssertion[]
  hitTest: readonly HitTestAssertion[]
}

export type Box = { left: number; top: number; right: number; bottom: number }
export type Point = { x: number; y: number }

export type HostClass = 'app' | 'font' | 'media-provider' | 'other-external'

export type RunIdentity = {
  gitHead: string
  indexHtmlSha256: string
  baseUrl: string
  chromeVersion: string
  nodeVersion: string
  time: string
}

export type CellResult = {
  id: string
  url: string
  width: number
  height: number
  lens: Lens
  tab: Tab
  theme: Theme
  state: string | null
  passed: boolean
  reasons: string[]
  viewport: { pass: boolean; innerWidth: number | null; innerHeight: number | null }
  scrollWidth: { pass: boolean; scrollWidth: number | null; innerWidth: number | null }
  pageErrors: { pass: boolean; errors: string[] }
  consoleErrors: { pass: boolean; errors: string[]; ignored: string[] }
  network: {
    pass: boolean
    app: string[]
    fonts: string[]
    mediaProvider: string[]
    otherExternal: string[]
  }
  embeds: { pass: boolean; iframes: number; videos: number; limit: number }
  themeCheck: {
    pass: boolean
    storage: string | null
    datasetTheme: string | null
    datasetLens: string | null
  }
  mediaEmulation: { pass: boolean; colorScheme: 'light' | 'dark' | null; reducedMotion: boolean | null }
  geometry: {
    pass: boolean
    assertions: { kind: string; a: string; b: string; pass: boolean; detail: string }[]
  }
  hitTest: {
    pass: boolean
    selectors: { selector: string; pass: boolean; detail: string }[]
  }
  screenshot: string | null
}

export type MatrixReport = {
  identity: RunIdentity
  cells: CellResult[]
}
