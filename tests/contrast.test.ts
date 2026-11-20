import { globSync, readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { bannerPaint, bannerSource, css, contrastCases, measureContrast, ratio, rgb, scrimComposite, secondEditionPairs, secondEditionTokens } from './contrast'

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
  expect(sites).toEqual([['components/MomentsEmpty.tsx', 1], ['components/TablePage.tsx', 2]])
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
    expect(paper['fb-display']).toBe("'Kickoff Display', Georgia, serif")
    expect(paper['fb-book']).toBe("'Libre Caslon Text', Palatino, serif")
    expect(paper['fb-neon']).toBe("'Chakra Petch', ui-sans-serif, sans-serif")
    expect(paper['fb-label']).toBe("'Oswald', ui-sans-serif, sans-serif")
    expect(paper['fb-mono']).toBe("'Kickoff Mono Text', ui-monospace, 'SF Mono', monospace")
    expect(paper['fb-gutter']).toBe('16px')
    expect(paper['fb-measure']).toBe('640px')
    expect(paper['fb-measure-register']).toBe('780px')
    for (const stop of [1, 2, 3, 4, 5]) expect(black[`fb-foil-${stop}`]).toBe(paper[`fb-foil-${stop}`])
    const theme = css.match(/@theme inline\s*\{([^}]+)\}/)?.[1] ?? ''
    expect(theme).not.toContain('--fb-')
  })
})

it('fb tokens and stock render only from the named surfaces that own them', () => {
  const allowed = new Set(['components/ImprintBand.tsx', 'components/PageFoot.tsx', 'index.css', 'components/WeekRow.tsx', 'components/FilterBar.tsx'])
  const root = new URL('../src/', import.meta.url)
  const hits = globSync('**/*.{css,ts,tsx}', { cwd: root }).filter((file) => {
    if (file === 'shell.css' || allowed.has(file)) return false
    return /--fb-|data-stock/.test(readFileSync(new URL(file, root), 'utf8'))
  })
  expect(hits).toEqual([])
})

it('reads changed token and component alphas instead of certifying yesterday’s fills', () => {
  const measured = (cases: typeof contrastCases, theme: string, role: string) => cases.find((c) => c.theme === theme && c.role === role)!.ratio
  const border = measureContrast(css.replace('rgb(22 33 27 / 0.12)', 'rgb(22 33 27 / 0.22)'))
  expect(measured(border, 'light', 'FT pill')).toBeLessThan(4.5)
  const darkBanner = measureContrast(css.replace('--fb-amber: #F7C948', '--fb-amber: #2A2410'))
  expect(measured(darkBanner, 'dark', '24h banner')).toBeLessThan(4.5)
  const alarm = measureContrast(css.replace('--fb-alarm: #B3121B', '--fb-alarm: #F6C1C3'))
  expect(measured(alarm, 'light', '72h banner')).toBeLessThan(4.5)
  expect(() => measureContrast(css, bannerSource.replace('data-plane={plane}', 'data-plane="surface"'))).toThrow('72h banner tint')
})

it('measures the banner in the colours its own rules paint', () => {
  expect(bannerPaint()).toEqual({ amber: 'fb-amber', alarm: 'fb-alarm', grounds: ['fb-pulp', 'fb-typescript'] })
  const banner = contrastCases.filter((c) => c.role === '24h banner' || c.role === '72h banner')
  // Two planes, two grounds, two themes.
  expect(banner.map((c) => `${c.theme} ${c.role} on ${c.ground} ${c.ratio.toFixed(2)}`)).toEqual([
    'light 24h banner on fb-pulp 5.85', 'light 72h banner on fb-pulp 5.17',
    'light 24h banner on fb-typescript 6.48', 'light 72h banner on fb-typescript 5.73',
    'dark 24h banner on fb-pulp 11.76', 'dark 72h banner on fb-pulp 6.86',
    'dark 24h banner on fb-typescript 11.76', 'dark 72h banner on fb-typescript 6.86',
  ])
  const worst = (source: string, role: string) => Math.min(...measureContrast(source).filter((c) => c.role === role).map((c) => c.ratio))
  // A plane painted in its own ink reads 1:1, on either ground.
  expect(worst(css.replace("  border-left-width: 4px;\n  background: var(--fb-pulp);", "  border-left-width: 4px;\n  background: var(--fb-amber);"), '24h banner')).toBe(1)
  expect(worst(css.replace("[data-ground='typescript'] .staleness {\n  background: var(--fb-typescript);", "[data-ground='typescript'] .staleness {\n  background: var(--fb-amber);"), '24h banner')).toBe(1)
  expect(worst(css.replace(".staleness[data-plane='alarm'] {\n  border-color: var(--fb-alarm);\n  color: var(--fb-alarm);", ".staleness[data-plane='alarm'] {\n  border-color: var(--fb-alarm);\n  color: var(--fb-pulp);"), '72h banner')).toBe(1)
  // A plane painted with a literal is not measured as a token, so it fails closed.
  expect(() => measureContrast(css.replace("  border-left-width: 4px;\n  background: var(--fb-pulp);", "  border-left-width: 4px;\n  background: #6E4B00;"))).toThrow("The banner's background is not a token")
})
