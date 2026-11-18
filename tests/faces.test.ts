import { createRequire } from 'node:module'
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { expect, it } from 'vitest'
import { inlineBundledFaces, inlineFaceCss } from '../scripts/inline-faces.ts'

const { copyFaces, nextFacesCss } = createRequire(import.meta.url)('../web/scripts/copy-faces.mjs') as {
  copyFaces: (targetDir?: string) => void
  nextFacesCss: (css: string) => string
}

const pages = ['index.html', 'offline.html', 'web/app/layout.tsx', 'tests/harness/states.html', 'tests/harness/moments.html']

const FACES: [string, string, string, string][] = [
  ['Oswald', 'normal', '500', 'oswald/Oswald.woff2'],
  ['Oswald', 'normal', '600', 'oswald/Oswald.woff2'],
  ['Oswald', 'normal', '700', 'oswald/Oswald.woff2'],
  ['Inter', 'normal', '400', 'inter/Inter.woff2'],
  ['Inter', 'normal', '500', 'inter/Inter.woff2'],
  ['Inter', 'normal', '600', 'inter/Inter.woff2'],
  ['Kickoff Mono', 'normal', '500', 'kickoff-mono/KickoffMono-Medium.woff2'],
  ['Kickoff Mono', 'normal', '600', 'kickoff-mono/KickoffMono-SemiBold.woff2'],
  ['Kickoff Display', 'normal', '400', 'kickoff-display/KickoffDisplay-Regular.woff2'],
  ['Libre Caslon Text', 'normal', '400', 'libre-caslon-text/LibreCaslonText-Regular.woff2'],
  ['Libre Caslon Text', 'italic', '400', 'libre-caslon-text/LibreCaslonText-Italic.woff2'],
  ['Chakra Petch', 'normal', '700', 'chakra-petch/ChakraPetch-Bold.woff2'],
  ['Kickoff Mono Text', 'normal', '400', 'kickoff-mono/KickoffMono-Regular.woff2'],
  ['Kickoff Mono Text', 'italic', '400', 'kickoff-mono/KickoffMono-Italic.woff2'],
  ['Kickoff Mono Text', 'normal', '500', 'kickoff-mono/KickoffMono-Medium.woff2'],
  ['Kickoff Mono Text', 'normal', '600', 'kickoff-mono/KickoffMono-SemiBold.woff2'],
]

interface Face {
  family: string
  style: string
  weight: string
  file: string
  display: string
  range: string
}

const record = readFileSync('public/fonts/RECORD.md', 'utf8')
const latin = record.match(/^Latin:\n\n```\n([^\n]+)\n```$/m)?.[1]
const latinExt = record.match(/^Latin-ext:\n\n```\n([^\n]+)\n```$/m)?.[1]

function half(range: string): string {
  if (range === latin) return 'latin'
  if (range === latinExt) return 'ext'
  return `invalid range: ${range}`
}

function facesOf(css: string): Face[] {
  return [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(match => {
    const block = match[1] ?? ''
    const value = (name: string) => block.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1]?.trim() ?? ''
    const declared = value('src')
    const src = declared.match(/url\("([^"]+)"\)/)?.[1] ?? declared
    return {
      family: value('font-family').replaceAll('"', ''),
      style: value('font-style'),
      weight: value('font-weight'),
      file: src.includes('fonts/') ? src.slice(src.indexOf('fonts/') + 'fonts/'.length) : src,
      display: value('font-display'),
      range: value('unicode-range'),
    }
  })
}

function identity(face: { family: string, style: string, weight: string, file: string, range: string }): string {
  return `${face.family} ${face.style} ${face.weight} ${face.file} ${half(face.range)}`
}

const declared = FACES.flatMap(([family, style, weight, file]) => {
  const ext = file.replace(/\.woff2$/, '-ext.woff2')
  return [
    `${family} ${style} ${weight} ${ext} ext`,
    `${family} ${style} ${weight} ${file} latin`,
  ]
})

const vite = readFileSync('public/faces.css', 'utf8')

it('the stylesheet names both halves of each face, and every face swaps', () => {
  const left = facesOf(vite)
  expect(left.map(face => face.display)).toEqual(left.map(() => 'swap'))
  expect(left.map(identity)).toEqual(declared)
  expect(left.every(face => face.range.length > 0)).toBe(true)
})

it('the split script uses the ranges recorded for the two halves', () => {
  const script = readFileSync('scripts/split-font-ranges.py', 'utf8')
  for (const [name, range] of [['LATIN', latin], ['LATIN_EXT', latinExt]]) {
    expect(range, name).toBeTruthy()
    const assignment = script.match(new RegExp(`^${name} = \\(([\\s\\S]*?)^\\)`, 'm'))?.[1] ?? ''
    const fragments = [...assignment.matchAll(/"([^"]+)"/g)].map(match => match[1])
    expect(fragments.join(''), name).toBe(range)
  }
})

it('preloads the two first-paint faces, and the href equals the src', () => {
  const index = readFileSync('index.html', 'utf8')
  const layout = readFileSync('web/app/layout.tsx', 'utf8')
  const vitePreloads = [...index.matchAll(/rel="preload" href="([^"]+)" as="font"/g)].map(match => match[1])
  const nextPreloads = [...layout.matchAll(/rel="preload" href="([^"]+)" as="font"/g)].map(match => match[1])
  expect(vitePreloads).toEqual([
    './fonts/oswald/Oswald.woff2',
    './fonts/kickoff-mono/KickoffMono-Medium.woff2',
  ])
  expect(nextPreloads).toEqual([
    '/fonts/oswald/Oswald.woff2',
    '/fonts/kickoff-mono/KickoffMono-Medium.woff2',
  ])
  for (const href of vitePreloads) expect(vite).toContain(`url("${href}")`)
  for (const href of nextPreloads) expect(nextFacesCss(vite)).toContain(`url("${href}")`)
  expect(readFileSync('offline.html', 'utf8')).toContain(readFileSync('index.html', 'utf8').match(/<link rel="preload"[\s\S]*?<link rel="stylesheet" href="\.\/faces.css" \/>/)?.[0])
})

it('no reader page contacts a font host', () => {
  for (const page of pages) {
    const html = readFileSync(page, 'utf8')
    expect(html, page).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com|document\.write/)
  }
})

it('the single-file build inlines the six rendered faces and nothing else', () => {
  const html = inlineBundledFaces(readFileSync('index.html', 'utf8'))
  expect(html).toBe(inlineBundledFaces(html))
  expect(html).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com|url\("\.\/fonts\/|rel="preload"|href="\.\/faces\.css"/)
  expect(html).toContain('data:font/woff2;base64,')
  const facesStart = html.indexOf('<style data-kickoff-faces')
  const facesEnd = html.indexOf('</style>', facesStart) + '</style>'.length
  const block = html.slice(facesStart, facesEnd)
  const rest = html.slice(0, facesStart) + html.slice(facesEnd)
  const inlined = facesOf(block)
  // Kickoff Mono 400 is inlined as Kickoff Mono Text. A 400 face on Kickoff
  // Mono would replace the 500 the page currently gets as the nearest weight.
  expect(inlined.map(face => `${face.family} ${face.weight} ${half(face.range)}`)).toEqual([
    'Oswald 500 700 ext',
    'Oswald 500 700 latin',
    'Inter 400 600 ext',
    'Inter 400 600 latin',
    'Kickoff Mono 500 ext',
    'Kickoff Mono 500 latin',
    'Kickoff Mono 600 ext',
    'Kickoff Mono 600 latin',
    'Libre Caslon Text 400 ext',
    'Libre Caslon Text 400 latin',
    'Kickoff Mono Text 400 ext',
    'Kickoff Mono Text 400 latin',
  ])
  expect(inlined.every(face => face.range.length > 0)).toBe(true)
  expect(html.match(/url\("data:font\/woff2;base64,/g)).toHaveLength(12)
  expect(html).not.toMatch(/size-adjust|Oswald Fallback|Chakra|Kickoff Display/)
  expect(rest).not.toMatch(/@font-face|Caslon|Kickoff Mono Text/)
  expect(block).not.toMatch(/italic/)
})

it('refuses to inline a local() face', () => {
  const css = '@font-face { font-family: "Oswald Fallback"; font-style: normal; font-weight: 500; font-display: swap; src: local("Arial"); }'
  expect(() => inlineFaceCss(css, () => Buffer.from(''))).toThrow(/unicode-range/)
})

it('refuses to inline LOCAL() and a source that mixes local() with a url', () => {
  const upper = `${vite}\n@font-face { font-family: "Oswald Fallback"; font-style: normal; font-weight: 500; font-display: swap; src: LOCAL("Arial"); }`
  const mixed = `${vite}\n@font-face { font-family: "Oswald"; font-style: normal; font-weight: 500; font-display: swap; src: local("Arial"), url("./fonts/oswald/Oswald.woff2"); }`
  expect(() => inlineFaceCss(upper, () => Buffer.from(''))).toThrow(/local\(/i)
  expect(() => inlineFaceCss(mixed, () => Buffer.from('x'))).toThrow(/local\(/i)
})

it('refuses a second src declaration and a local() source with no semicolon', () => {
  const second = '@font-face { font-family: "Oswald"; font-style: normal; font-weight: 500; font-display: swap; unicode-range: U+0000-00FF; src: url("./fonts/oswald/Oswald.woff2") format("woff2"); src: local("Arial"); }'
  const bare = '@font-face { font-family: "Oswald"; font-style: normal; font-weight: 500; font-display: swap; unicode-range: U+0000-00FF; src: local("Arial") }'
  expect(() => inlineFaceCss(second, () => Buffer.from('x'))).toThrow(/local\(/i)
  expect(() => nextFacesCss(second)).toThrow(/local\(/i)
  expect(() => inlineFaceCss(bare, () => Buffer.from(''))).toThrow(/local\(/i)
  expect(() => nextFacesCss(bare)).toThrow(/local\(/i)
})

it('the Next copy refuses local(), LOCAL(), and a mixed source', () => {
  for (const src of ['local("Arial")', 'LOCAL("Arial")', 'local("Arial"), url("./fonts/oswald/Oswald.woff2")']) {
    const css = `@font-face { font-family: "Oswald"; font-style: normal; font-weight: 500; font-display: swap; src: ${src}; }`
    expect(() => nextFacesCss(css), src).toThrow(/local\(/i)
  }
})

it('a comment can mention local() without adding a face on either build path', () => {
  const css = `/* Old example: @font-face { src: local("Arial"); } */\n${vite}`
  const read = () => Buffer.from('face')
  expect(inlineFaceCss(css, read)).toBe(inlineFaceCss(vite, read))
  expect(nextFacesCss(css)).toBe(`/* Old example: @font-face { src: local("Arial"); } */\n${nextFacesCss(vite)}`)
})

it('the Next copy is the same bytes with root urls, and the suite does not rewrite the checkout', () => {
  const sentinel = 'web/public/fonts/oswald/Oswald.woff2'
  const before = existsSync(sentinel) ? statSync(sentinel) : null
  const dir = mkdtempSync(path.join(tmpdir(), 'kickoff-faces-'))
  try {
    copyFaces(dir)
    const written = readFileSync(path.join(dir, 'faces.css'), 'utf8')
    const sourceFiles = [...vite.matchAll(/url\("\.\/fonts\/([^"]+)"\)/g)].map(match => match[1])
    const writtenFiles = [...written.matchAll(/url\("\/fonts\/([^"]+)"\)/g)].map(match => match[1])
    expect(writtenFiles).toEqual(sourceFiles)
    expect(written).not.toMatch(/url\("\.\//)
    expect(written).toBe(nextFacesCss(vite))
    expect(facesOf(written).map(identity)).toEqual(facesOf(vite).map(identity))
    for (const file of ['oswald/Oswald.woff2', 'oswald/Oswald-ext.woff2', 'inter/Inter.woff2', 'kickoff-mono/KickoffMono-Medium.woff2']) {
      expect(readFileSync(path.join(dir, 'fonts', file)).equals(readFileSync(`public/fonts/${file}`))).toBe(true)
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
  if (before) {
    const after = statSync(sentinel)
    expect(after.ino).toBe(before.ino)
    expect(after.mtimeMs).toBe(before.mtimeMs)
  } else {
    expect(existsSync(sentinel)).toBe(false)
  }
})
