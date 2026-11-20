import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

const css = readFileSync(new URL('../src/shell.css', import.meta.url), 'utf8')
const table = readFileSync(new URL('../src/components/TablePage.tsx', import.meta.url), 'utf8')

/** Tailwind's spacing step is 4px; an arbitrary value is its own figure. */
function px(utility: string): number {
  const arbitrary = utility.match(/\[([\d.]+)px\]/)
  return arbitrary ? Number(arbitrary[1]) : Number(utility.match(/-([\d.]+)$/)![1]) * 4
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

it('a standings row the keyboard reaches stops below the labels, a pinned divider and its own ring', () => {
  // What pins above a phone row, below the band, from the Table's own classes.
  const labels = px(table.match(/sticky top-0 z-10 grid (h-\d+) /)![1]!)
  const padding = table.match(/wide \? 'pt-[\d.]+ pb-[\d.]+' : 'px-[\d.]+ (pt-[\d.]+) (pb-[\d.]+)'/)
  const label = table.match(/wide \? 'text-\[[\d.]+px\]' : '(text-\[[\d.]+px\])'/)
  expect(padding, 'the phone divider’s padding').not.toBeNull()
  expect(label, 'the phone divider’s label').not.toBeNull()
  // The label names no line height, so it takes Tailwind's: 1.5.
  const divider = px(padding![1]!) + px(padding![2]!) + px(label![1]!) * 1.5
  // The ring is the page's own, and a scroll is rounded to a whole pixel.
  const ring = css.match(/:focus-visible \{\s*outline: (\d+)px solid [^;]+;\s*outline-offset: (\d+)px;/)
  expect(ring, 'the focus ring').not.toBeNull()
  const clear = Number(ring![1]) + Number(ring![2]) + 0.5

  expect([labels, divider, clear]).toEqual([28, 27.5, 4.5])
  expect(css).toContain(`.imprint-band ~ .page-measure [data-table='mobile'] [data-table-row] > button {\n  scroll-margin-top: calc(${labels}px + ${clear}px);\n}`)
  expect(css).toContain(`.imprint-band ~ .page-measure [data-table='mobile'] [data-zone-divider].sticky ~ [data-table-row] > button {\n  scroll-margin-top: calc(${labels}px + ${divider}px + ${clear}px);\n}`)

  // The rules name the Table's markup. A phone row is one button under its row marker,
  // a pinned divider is that row's earlier sibling, and a desktop row holds no control.
  const [phone, desktop] = table.split('data-table="desktop"') as [string, string]
  expect(phone).toMatch(/data-table-row=\{r\.teamId\}>\s*<button/)
  expect(phone).toMatch(/\{band\.zone && <ZoneDivider zone=\{band\.zone\} \/>\}\s*\{band\.rows\.map/)
  expect(table).toContain("data-zone-divider={zone.name}")
  const desktopRows = desktop.slice(desktop.indexOf('data-table-row'))
  expect(desktopRows).not.toMatch(/<button|<a |tabIndex/)
})
