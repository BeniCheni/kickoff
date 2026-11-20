import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { stripFaceCssComments } from './strip-face-css-comments.ts'

const root = fileURLToPath(new URL('..', import.meta.url))

// Both halves of the six faces the offline and single files carry. Oswald
// and Inter are variable, so one pair of halves covers every weight that
// pointed at the file. Kickoff Mono 400 stays on Kickoff Mono Text: a real
// 400 on Kickoff Mono would replace the 500 the page gets as the nearest
// weight. The offline page selects all six: its band's provenance line is
// set in that 400, and its page foot and staleness banner in Caslon 400.
const RENDERED = [
  './fonts/oswald/Oswald.woff2',
  './fonts/oswald/Oswald-ext.woff2',
  './fonts/inter/Inter.woff2',
  './fonts/inter/Inter-ext.woff2',
  './fonts/kickoff-mono/KickoffMono-Regular.woff2',
  './fonts/kickoff-mono/KickoffMono-Regular-ext.woff2',
  './fonts/kickoff-mono/KickoffMono-Medium.woff2',
  './fonts/kickoff-mono/KickoffMono-Medium-ext.woff2',
  './fonts/kickoff-mono/KickoffMono-SemiBold.woff2',
  './fonts/kickoff-mono/KickoffMono-SemiBold-ext.woff2',
  './fonts/libre-caslon-text/LibreCaslonText-Regular.woff2',
  './fonts/libre-caslon-text/LibreCaslonText-Regular-ext.woff2',
]
const FAMILIES = new Set(['"Oswald"', '"Inter"', '"Kickoff Mono"', '"Libre Caslon Text"'])

interface Face {
  family: string
  style: string
  weight: string
  src: string
  range: string
}

function faces(css: string): Face[] {
  return [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(match => {
    const block = match[1] ?? ''
    const value = (name: string) => block.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1]?.trim()
    const family = value('font-family')
    const style = value('font-style')
    const weight = value('font-weight')
    const declared = value('src') ?? ''
    const range = value('unicode-range') ?? ''
    const src = declared.match(/url\("([^"]+)"\)/)?.[1]
    if (!family || !style || !weight || !declared) throw new Error('A face is missing family, style, weight or src')
    return { family, style, weight, src: src ?? declared, range }
  })
}

function rule(face: Face, weights: number[], data: string): string {
  const weight = weights.length === 1 ? String(weights[0]) : `${Math.min(...weights)} ${Math.max(...weights)}`
  return [
    '@font-face {',
    `  font-family: ${face.family};`,
    `  font-style: ${face.style};`,
    `  font-weight: ${weight};`,
    '  font-display: swap;',
    `  unicode-range: ${face.range};`,
    `  src: url("${data}") format("woff2");`,
    '}',
  ].join('\n')
}

// Kickoff Mono Text also points 500 and 600 at the Medium and SemiBold files.
// Those rules must not widen the weight range of the Kickoff Mono faces.
function selected(face: Face): boolean {
  if (!RENDERED.includes(face.src)) return false
  if (FAMILIES.has(face.family)) return true
  return face.family === '"Kickoff Mono Text"' && face.style === 'normal' && face.weight === '400'
}

// The bytes are read by the caller so a test can refuse a local() face without the
// files. A local() fallback is not copied: the one that was measured drew U+2192,
// which Oswald does not contain, and changed the loaded page (e34e032). A later
// fallback has to carry its unicode-range into this function before it can ship.
export function inlineFaceCss(css: string, read: (src: string) => Buffer): string {
  // Scan uncommented CSS so a second src or a src without a trailing
  // semicolon also fails the check.
  const uncommented = stripFaceCssComments(css)
  if (/local\(/i.test(uncommented)) {
    throw new Error('A local() face is not inlined. Carry its unicode-range into the offline file before shipping one.')
  }
  const parsed = faces(uncommented)
  const bySrc = new Map<string, { face: Face, weights: number[] }>()
  for (const face of parsed) {
    if (!selected(face)) continue
    if (!face.range) throw new Error(`${face.src} has no unicode-range`)
    const weight = Number(face.weight)
    if (!Number.isInteger(weight)) throw new Error(`Unexpected weight ${face.weight}`)
    const existing = bySrc.get(face.src)
    if (existing) {
      if (existing.face.range !== face.range) throw new Error(`${face.src} has two unicode ranges`)
      existing.weights.push(weight)
    } else bySrc.set(face.src, { face, weights: [weight] })
  }
  for (const src of RENDERED) {
    if (!bySrc.has(src)) throw new Error(`${src} is not declared`)
  }
  return [...bySrc.entries()].map(([src, entry]) => {
    return rule(entry.face, entry.weights, `data:font/woff2;base64,${read(src).toString('base64')}`)
  }).join('\n')
}

export function inlineBundledFaces(html: string): string {
  if (html.includes('data-kickoff-faces')) return html
  if (!html.includes('href="./faces.css"')) throw new Error('The bundled page does not link ./faces.css')
  const css = readFileSync(path.join(root, 'public/faces.css'), 'utf8')
  const blocks = inlineFaceCss(css, src => readFileSync(path.join(root, 'public', src.slice(2))))
  const style = `<style data-kickoff-faces="">\n${blocks}\n</style>`
  return html
    .replace(/^[ \t]*<link rel="preload" href="\.\/fonts\/[^"]+" as="font"[^>]*>\n?/gm, '')
    .replace(/^[ \t]*<link rel="stylesheet" href="\.\/faces\.css" \/>\n?/m, `${style}\n`)
}
