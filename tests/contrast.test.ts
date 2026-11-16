import { globSync, readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { bannerSource, css, contrastCases, measureContrast, ratio, rgb, scrimComposite, secondEditionPairs, secondEditionTokens } from './contrast'

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
  expect(sites).toEqual([['components/MomentsEmpty.tsx', 1], ['components/StalenessBanner.tsx', 1], ['components/TablePage.tsx', 2]])
})

describe('second-edition pairs, read from the tokens', () => {
  const pairs = secondEditionPairs()
  const allowed = pairs.filter((pair) => pair.allowed)
  const refused = pairs.filter((pair) => !pair.allowed)

  it('counts the handoff table, and the five pairs it refuses', () => {
    expect(allowed).toHaveLength(34)
    expect(refused.map((pair) => pair.name)).toEqual([
      'blood on cover-black',
      'first-edition accent on pulp',
      'first-edition floodlight on pulp',
      'first-edition pitch on pulp',
      'first-edition floodlight-strong on pulp',
    ])
  })

  it.each(allowed)('$name reaches its floor at the handoff ratio', ({ ratio: measured, expected, minimum }) => {
    expect(measured).toBeGreaterThanOrEqual(minimum)
    expect(measured.toFixed(2)).toBe(expected.toFixed(2))
  })

  it.each(refused)('$name stays under 4.5 at the handoff ratio', ({ ratio: measured, expected }) => {
    expect(measured).toBeLessThan(4.5)
    expect(measured.toFixed(2)).toBe(expected.toFixed(2))
  })

  it('computes the scrim over white instead of painting the handoff hex', () => {
    expect(scrimComposite()).toEqual(rgb('#1E1E1F'))
  })

  it('resolves a dark page to the black-stock voices, on either stock', () => {
    const { paper, black, stockSelector } = secondEditionTokens()
    expect(stockSelector).toContain(":root[data-theme='dark']")
    expect(stockSelector).toContain("[data-stock='paper']")
    expect(stockSelector).toContain("[data-stock='black']")
    expect(black['fb-pulp']).toBe('#0E1420')
    expect(black['fb-pulp']).not.toBe(paper['fb-pulp'])
    expect(black['fb-cover-ink']).toBe(paper['fb-cover-ink'])
    expect(paper['fb-torch']).toBe('rgb(232 179 111 / 0)')
    expect(black['fb-torch']).toBe('rgb(232 179 111 / 0.2)')
    expect(paper['fb-rule']).toBe('rgb(28 22 17 / 0.22)')
    expect(black['fb-rule']).toBe('rgb(233 228 212 / 0.19)')
    expect(paper['fb-rule-strong']).toBe('rgb(28 22 17 / 0.52)')
    expect(black['fb-rule-strong']).toBe('rgb(233 228 212 / 0.52)')
    expect(paper['fb-rift']).toBe('#9DFFC8')
    expect(black['fb-rift']).toBe('#9DFFC8')
    expect(paper['fb-on-pitch']).toBe('#F2EBDD')
    expect(black['fb-on-pitch']).toBe('#0A0A0C')
    expect(paper['fb-display']).toBe("'Abril Fatface', Georgia, serif")
    expect(paper['fb-book']).toBe("'Libre Caslon Text', Palatino, serif")
    expect(paper['fb-neon']).toBe("'Chakra Petch', ui-sans-serif, sans-serif")
    expect(paper['fb-label']).toBe("'Oswald', ui-sans-serif, sans-serif")
    expect(paper['fb-mono']).toBe("'IBM Plex Mono', ui-monospace, 'SF Mono', monospace")
    expect(paper['fb-gutter']).toBe('16px')
    expect(paper['fb-measure']).toBe('640px')
    expect(paper['fb-measure-register']).toBe('780px')
    for (const stop of [1, 2, 3, 4, 5]) expect(black[`fb-foil-${stop}`]).toBe(paper[`fb-foil-${stop}`])
    const theme = css.match(/@theme inline\s*\{([^}]+)\}/)?.[1] ?? ''
    expect(theme).not.toContain('--fb-')
  })
})

it('no rendered file reads an fb- token yet', () => {
  const root = new URL('../src/', import.meta.url)
  const hits = globSync('**/*.{css,ts,tsx}', { cwd: root }).filter((file) => {
    if (file === 'shell.css') return false
    return /--fb-|data-stock/.test(readFileSync(new URL(file, root), 'utf8'))
  })
  expect(hits).toEqual([])
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
