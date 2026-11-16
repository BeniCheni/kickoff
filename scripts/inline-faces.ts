import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

// The single and offline files render these four faces. Each file is inlined
// once. A variable file keeps the weight range of the faces that pointed at it,
// so the bytes are not repeated for every weight.
const RENDERED = [
  './fonts/oswald/Oswald.woff2',
  './fonts/inter/Inter.woff2',
  './fonts/kickoff-mono/KickoffMono-Medium.woff2',
  './fonts/kickoff-mono/KickoffMono-SemiBold.woff2',
]
// Kickoff Mono Text points at the same two files. It is a second family, and
// the bundled page does not render it.
const FAMILIES = new Set(['"Oswald"', '"Inter"', '"Kickoff Mono"'])

interface Face {
  family: string
  style: string
  weight: string
  src: string
}

function faces(css: string): Face[] {
  return [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(match => {
    const block = match[1] ?? ''
    const value = (name: string) => block.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1]?.trim()
    const family = value('font-family')
    const style = value('font-style')
    const weight = value('font-weight')
    const declared = value('src') ?? ''
    const src = declared.match(/url\("([^"]+)"\)/)?.[1]
    if (!family || !style || !weight || !declared) throw new Error('A face is missing family, style, weight or src')
    return { family, style, weight, src: src ?? declared }
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
    `  src: url("${data}") format("woff2");`,
    '}',
  ].join('\n')
}

// The bytes are read by the caller so a test can refuse a local() face without the
// files. A local() fallback is not copied: the one that was measured drew U+2192,
// which Oswald does not contain, and changed the loaded page (e34e032). A later
// fallback has to carry its unicode-range into this function before it can ship.
export function inlineFaceCss(css: string, read: (src: string) => Buffer): string {
  const parsed = faces(css)
  const local = parsed.filter(face => face.src.startsWith('local('))
  if (local.length) {
    throw new Error(`A local() face is not inlined (${local.map(face => face.family).join(', ')}). Carry its unicode-range into the offline file before shipping one.`)
  }
  const rendered = new Set(RENDERED)
  const bySrc = new Map<string, { face: Face, weights: number[] }>()
  for (const face of parsed) {
    if (!rendered.has(face.src) || !FAMILIES.has(face.family)) continue
    const weight = Number(face.weight)
    if (!Number.isInteger(weight)) throw new Error(`Unexpected weight ${face.weight}`)
    const existing = bySrc.get(face.src)
    if (existing) existing.weights.push(weight)
    else bySrc.set(face.src, { face, weights: [weight] })
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
