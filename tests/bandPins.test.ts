import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

const css = readFileSync(new URL('../src/shell.css', import.meta.url), 'utf8')
const table = readFileSync(new URL('../src/components/TablePage.tsx', import.meta.url), 'utf8')

/** Tailwind's spacing step is 4px; an arbitrary value is its own figure. */
function px(utility: string): number {
  const arbitrary = utility.match(/\[(\d+)px\]/)
  return arbitrary ? Number(arbitrary[1]) : Number(utility.match(/-(\d+)$/)![1]) * 4
}

it('the Table’s pinned rows start at the band’s foot, at the height the band measures', () => {
  expect(css).toMatch(/html \{\s*--band-height: 118px;\s*scroll-padding-top: var\(--band-height\);\s*\}/)
  expect(css).toContain(".imprint-band ~ .page-measure [data-table] > .sticky {\n  top: var(--band-height);")

  // The offsets below are the Table's own figures. If its label row or its divider
  // moves, this fails here and names the stylesheet that has to move with it.
  const mobileLabels = table.match(/sticky top-0 z-10 grid (h-\d+) /)
  const desktopLabels = table.match(/sticky top-0 z-10 bg-bg grid (h-\[\d+px\]) /)
  const dividers = table.match(/sticky z-\[1\] bg-bg \$\{wide \? '(top-\[\d+px\])' : '(top-\d+)'\}/)
  expect(mobileLabels, 'the mobile label row').not.toBeNull()
  expect(desktopLabels, 'the desktop label row').not.toBeNull()
  expect(dividers, 'the deep-zone divider').not.toBeNull()
  const mobile = px(mobileLabels![1]!)
  const desktop = px(desktopLabels![1]!)
  expect(px(dividers![2]!), 'the mobile divider pins under the mobile labels').toBe(mobile)
  expect(px(dividers![1]!), 'the desktop divider pins under the desktop labels').toBe(desktop)
  expect(css).toContain(`[data-table='mobile'] [data-zone-divider].sticky {\n  top: calc(var(--band-height) + ${mobile}px);`)
  expect(css).toContain(`[data-table='desktop'] [data-zone-divider].sticky {\n  top: calc(var(--band-height) + ${desktop}px);`)
})

it('the band stays pinned, above the rows that pin below it', () => {
  const band = css.slice(css.indexOf('.imprint-band {'), css.indexOf('}', css.indexOf('.imprint-band {')))
  expect(band).toContain('position: sticky')
  expect(band).toContain('top: 0')
  expect(Number(band.match(/z-index: (\d+)/)![1])).toBeGreaterThan(10)
})
