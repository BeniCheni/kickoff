import { encodeLens, LENSES, type Lens } from '../../src/lib/lens'
import { encodeTab, type Tab } from '../../src/lib/urlCodecs'
import { cellId } from './names'
import type { Cell, CellAction, MatrixConfig, MatrixSlice } from './types'

const TABS = ['fixtures', 'table', 'moments'] as const satisfies readonly Tab[]
const THEMES = ['light', 'dark'] as const
const STATE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const ACTION_KEYS = ['click', 'key', 'waitFor', 'waitMs'] as const

function assertMember<T extends string>(value: string, allowed: readonly T[], label: string): T {
  if ((allowed as readonly string[]).includes(value)) return value as T
  throw new Error(`${label} is not one of ${allowed.join(', ')}: ${value}`)
}

function assertAction(action: CellAction): CellAction {
  const present = ACTION_KEYS.filter((name) => Object.hasOwn(action, name))
  const only = present[0]
  if (present.length !== 1 || !only) {
    throw new Error(`an action must set exactly one of ${ACTION_KEYS.join(', ')}`)
  }
  if (only === 'waitMs' && 'waitMs' in action) {
    const ms = action.waitMs
    if (!Number.isFinite(ms) || ms < 0 || ms > 30_000) throw new Error(`waitMs must be 0..30000, got ${ms}`)
    return { waitMs: ms }
  }
  if (only === 'click' && 'click' in action) {
    if (!action.click) throw new Error('click action needs a selector')
    return { click: action.click }
  }
  if (only === 'waitFor' && 'waitFor' in action) {
    if (!action.waitFor) throw new Error('waitFor action needs a selector')
    return { waitFor: action.waitFor }
  }
  if (only === 'key' && 'key' in action) {
    if (!action.key) throw new Error('key action needs a key name')
    return { key: action.key }
  }
  throw new Error(`an action must set exactly one of ${ACTION_KEYS.join(', ')}`)
}

function assertSlice(slice: MatrixSlice, index: number): void {
  if (slice.viewports.length === 0) throw new Error(`slice ${index} has no viewports`)
  if (slice.lenses.length === 0 || slice.tabs.length === 0 || slice.themes.length === 0) {
    throw new Error(`slice ${index} needs at least one lens, tab and theme`)
  }
  for (const viewport of slice.viewports) {
    if (!Number.isInteger(viewport.width) || viewport.width < 200 || viewport.width > 3840) {
      throw new Error(`viewport width out of range: ${viewport.width}`)
    }
    if (!Number.isInteger(viewport.height) || viewport.height < 200 || viewport.height > 2160) {
      throw new Error(`viewport height out of range: ${viewport.height}`)
    }
  }
  if (slice.state !== undefined && !STATE_SLUG.test(slice.state)) {
    throw new Error(`state must be a short slug (a-z, 0-9, hyphens): ${slice.state}`)
  }
  for (const lens of slice.lenses) assertMember(lens, LENSES, 'lens')
  for (const tab of slice.tabs) assertMember(tab, TABS, 'tab')
  for (const theme of slice.themes) assertMember(theme, THEMES, 'theme')
}

/** Expand slices into concrete cells. Duplicate ids throw: screenshots would overwrite. */
export function expandConfig(config: MatrixConfig): Cell[] {
  const fallbackEmbeds = config.maxEmbeds ?? 1
  if (!Number.isInteger(fallbackEmbeds) || fallbackEmbeds < 0) {
    throw new Error(`maxEmbeds must be a non-negative integer, got ${fallbackEmbeds}`)
  }
  const cells: Cell[] = []
  const seen = new Set<string>()
  config.slices.forEach((slice, index) => {
    assertSlice(slice, index)
    const pathName = slice.path ?? '/'
    if (!pathName.startsWith('/')) throw new Error(`slice path must start with /: ${pathName}`)
    for (const viewport of slice.viewports) {
      for (const lens of slice.lenses) {
        for (const theme of slice.themes) {
          for (const tab of slice.tabs) {
            const state = slice.state ?? null
            const id = cellId({ width: viewport.width, lens, theme, tab, state })
            if (seen.has(id)) throw new Error(`duplicate cell ${id}`)
            seen.add(id)
            const maxEmbeds = slice.maxEmbeds ?? fallbackEmbeds
            cells.push({
              id,
              path: pathName,
              width: viewport.width,
              height: viewport.height,
              lens,
              tab,
              theme,
              state,
              query: slice.query ?? {},
              colorScheme: slice.colorScheme ?? theme,
              reducedMotion: slice.reducedMotion ?? 'no-preference',
              playIntent: slice.playIntent ?? false,
              actions: (slice.actions ?? []).map(assertAction),
              maxEmbeds,
              geometry: slice.geometry ?? [],
              hitTest: slice.hitTest ?? [],
            })
          }
        }
      }
    }
  })
  return cells
}

/** Lens and tab go through the app's codecs. Poster and Fixtures stay out of the query. */
export function cellSearch(cell: Pick<Cell, 'lens' | 'tab' | 'query'>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(cell.query)) {
    if (key === 'lens' || key === 'tab') continue
    params.set(key, value)
  }
  const lens = encodeLens(cell.lens)
  if (lens) params.set('lens', lens)
  const tab = encodeTab(cell.tab)
  if (tab) params.set('tab', tab)
  const search = params.toString()
  return search ? `?${search}` : ''
}

export function cellUrl(baseUrl: string, cell: Pick<Cell, 'path' | 'lens' | 'tab' | 'query'>): string {
  const base = new URL(baseUrl)
  if (!base.pathname.endsWith('/')) base.pathname += '/'
  const url = new URL(cell.path, base)
  url.search = cellSearch(cell).replace(/^\?/, '')
  return url.toString()
}
