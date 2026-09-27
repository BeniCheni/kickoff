/**
 * Expectations for the D-06 fixtures. Pure: the Chrome run produces a report,
 * and this function decides whether the checks actually caught the bad page.
 */

export type ControlView = {
  id: string
  state: string | null
  passed: boolean
  reasons: readonly string[]
  scrollWidthPass: boolean
  geometryPass: boolean
  hitTestPass: boolean
}

const BAD_WIDTHS = [768, 1000] as const

function cellsInState(cells: readonly ControlView[], state: string): ControlView[] {
  return cells.filter((cell) => cell.state === state)
}

function hasWidth(cells: readonly ControlView[], width: number): boolean {
  return cells.some((cell) => cell.id.startsWith(`${width}-`))
}

export function positiveControlProblems(cells: readonly ControlView[]): string[] {
  const problems: string[] = []
  const bad = cellsInState(cells, 'bad')
  const good = cellsInState(cells, 'good')
  const media = cellsInState(cells, 'media')
  if (bad.length === 0) problems.push('no bad-page cells')
  if (good.length === 0) problems.push('no good-page cells')
  if (media.length === 0) problems.push('no media-provider cell')
  for (const width of BAD_WIDTHS) {
    if (!hasWidth(bad, width)) problems.push(`bad page was not run at ${width}px`)
    if (!hasWidth(good, width)) problems.push(`good page was not run at ${width}px`)
  }
  for (const cell of bad) {
    if (cell.passed) problems.push(`${cell.id} passed; the overrun must fail`)
    if (cell.scrollWidthPass === false) {
      problems.push(`${cell.id} failed the page-width check; D-06 passed page width and was still wrong`)
    }
    const insideCaught = cell.reasons.some((reason) => reason.includes('geometry inside') && reason.includes('not inside'))
    const disjointCaught = cell.reasons.some((reason) => reason.includes('geometry disjoint') && reason.includes('intersects'))
    const hitCaught = cell.reasons.some((reason) => reason.startsWith('hit-test '))
    if (cell.geometryPass || !insideCaught || !disjointCaught) {
      problems.push(`${cell.id} geometry did not catch the overrun`)
    }
    if (cell.hitTestPass || !hitCaught) problems.push(`${cell.id} hit-test did not catch the covered queue`)
  }
  for (const cell of good) {
    if (!cell.passed) {
      problems.push(`${cell.id} failed (${cell.reasons.join('; ') || 'no reason'})`)
    }
  }
  for (const cell of media) {
    const flagged = cell.reasons.some((reason) => reason.includes('media-provider'))
    if (!flagged) problems.push(`${cell.id} was not flagged as a media-provider request`)
    if (cell.passed) problems.push(`${cell.id} passed with a media-provider request`)
  }
  return problems
}
