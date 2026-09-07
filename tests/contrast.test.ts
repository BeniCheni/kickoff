import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { bannerSource, css, contrastCases, measureContrast, ratio, rgb } from './contrast'

describe('measured semantic color contrast against rendered grounds', () => {
  it.each(contrastCases)('$theme $role on $ground', ({ ratio, minimum }) => {
    expect(ratio).toBeGreaterThanOrEqual(minimum)
  })
  it('independently reproduces the rejected accent-on-alt gap and unsafe floodlight repaint', () => {
    expect(ratio(rgb('#bd4720'), rgb('#efead9'))).toBeLessThan(4.5)
    expect(ratio(rgb('#16211b'), rgb('#8a5f00'))).toBeLessThan(4.5)
  })
})

// A new tint site requires extending the mounted inventory, not another silent exclusion.
it('keeps every floodlight tint site in the mounted inventory', () => {
  const root = new URL('../src/', import.meta.url)
  const sites = readdirSync(root, { recursive: true, encoding: 'utf8' }).sort().filter((p) => /\.tsx?$/.test(p))
    .flatMap((p) => {
      const count = [...readFileSync(new URL(p, root), 'utf8').matchAll(/\bbg-floodlight-bg\b/g)].length
      return count ? [[p, count]] : []
    })
  expect(sites).toEqual([['components/StalenessBanner.tsx', 1], ['components/TablePage.tsx', 2]])
})

it('reads changed token and component alphas instead of certifying yesterday’s fills', () => {
  const measured = (cases: typeof contrastCases, theme: string, role: string) => cases.find((c) => c.theme === theme && c.role === role)!.ratio
  const border = measureContrast(css.replace('rgb(22 33 27 / 0.12)', 'rgb(22 33 27 / 0.22)'))
  expect(measured(border, 'light', 'FT pill')).toBeLessThan(4.5)
  const darkTint = measureContrast(css.replace('--floodlight-bg: rgb(247 201 72 / 0.14)', '--floodlight-bg: rgb(247 201 72 / 0.50)'))
  expect(measured(darkTint, 'dark', '24h banner')).toBeLessThan(4.5)
  const alarm = measureContrast(css, bannerSource.replace('bg-accent/10', 'bg-accent/15'))
  expect(measured(alarm, 'light', '72h banner')).toBeLessThan(4.5)
  expect(() => measureContrast(css, bannerSource.replace('bg-accent/10', 'bg-surface'))).toThrow('72h banner tint')
})
