import type { Cell } from './types'

/** `{width}-{lens}-{theme}-{tab}[-{state}]` — the screenshot stem and the cell id. */
export function cellId(cell: {
  width: number
  lens: string
  theme: string
  tab: string
  state?: string | null
}): string {
  const stem = `${cell.width}-${cell.lens}-${cell.theme}-${cell.tab}`
  return cell.state ? `${stem}-${cell.state}` : stem
}

export function screenshotFileName(cell: Pick<Cell, 'id'>): string {
  return `${cell.id}.png`
}

/**
 * `--only` is a comma-separated AND. Each token must equal the width, lens,
 * theme, tab, state, or the whole cell id. `390,poster` keeps 390px Poster cells.
 */
export function cellMatchesOnly(cell: Pick<Cell, 'id' | 'width' | 'lens' | 'theme' | 'tab' | 'state'>, only: string | undefined): boolean {
  if (!only || only.trim() === '') return true
  const tokens = only.split(',').map((token) => token.trim()).filter((token) => token.length > 0)
  if (tokens.length === 0) return true
  return tokens.every((token) => (
    token === cell.id ||
    token === String(cell.width) ||
    token === cell.lens ||
    token === cell.theme ||
    token === cell.tab ||
    token === cell.state
  ))
}

export function formatSummary(cells: readonly { id: string; passed: boolean; reasons: readonly string[] }[]): string {
  const failed = cells.filter((cell) => !cell.passed)
  const lines = [`${cells.length} cells, ${cells.length - failed.length} passed, ${failed.length} failed`]
  for (const cell of failed) {
    lines.push(`FAIL ${cell.id}`)
    for (const reason of cell.reasons) lines.push(`  ${reason}`)
  }
  return lines.join('\n')
}
