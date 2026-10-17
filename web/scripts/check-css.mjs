import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
function cssUnder(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name)
    return entry.isDirectory() ? cssUnder(file) : file.endsWith('.css') ? [file] : []
  })
}
function readCSS(dir) {
  const files = cssUnder(dir)
  assert.ok(files.length, `No built CSS in ${dir}; build first`)
  return files.map(file => readFileSync(file, 'utf8')).join('\n')
}
const reader = readCSS(path.join(root, 'dist/assets'))
const shellCss = path.join(root, 'web/generated/shell.css')
const web = readFileSync(shellCss, 'utf8')
const globals = readFileSync(path.join(root, 'web/app/globals.css'), 'utf8')
const sources = [...globals.matchAll(/@source\s+"([^"]+)"/g)].map(match => match[1])
assert.deepEqual(sources, [
  './',
  '../../src/components/AppHeader.tsx',
  '../../src/components/TabNav.tsx',
  '../../src/components/LensSwitcher.tsx',
  '../../src/components/StalenessBanner.tsx',
  '../../src/components/ViewBoundary.tsx',
  '../../src/components/MomentsEmpty.tsx',
  '../../src/components/FixturesPage.tsx',
  '../../src/components/TablePage.tsx',
  '../../src/components/TickerStrip.tsx',
  '../../src/components/WeekView.tsx',
  '../../src/components/MonthView.tsx',
  '../../src/components/LedgerWeek.tsx',
  '../../src/components/PosterWeek.tsx',
  '../../src/components/FixtureRow.tsx',
  '../../src/components/MatchdayLines.tsx',
  '../../src/components/NextUpStrip.tsx',
  '../../src/components/TonightSlate.tsx',
  '../../src/components/FilterBar.tsx',
  '../../src/components/CompetitionChip.tsx',
  '../../src/components/WatchPanel.tsx',
], 'web Tailwind sources must be web/app plus the named shared files')
assert.ok(web.includes('bada71'), 'web probe missing: scan check would be vacuous')
assert.ok(!reader.includes('bada71'), 'web probe reached reader CSS')
assert.ok(!reader.includes('fa11e0'), 'Studio probe reached reader CSS')
assert.ok(!web.includes('fa11e0'), 'Studio probe reached web CSS')
// Shell utilities are shared on purpose. The Moments sheet is a separate file,
// scoped under .moments-gallery, and it must not enter the reader build or the
// shared shell sheet.
for (const marker of ['underline-offset-\\[3px\\]', 'mt-6', 'moments-gallery', 'moments-preview', 'moments-trust', 'moments-live']) {
  assert.ok(!web.includes(`.${marker}`), `reader/docs selector reached web shell CSS: ${marker}`)
}
const momentsCss = readFileSync(path.join(root, 'web/app/moments/gallery.css'), 'utf8')
assert.ok(momentsCss.includes('.moments-gallery'), 'Moments sheet is missing its root scope')
assert.ok(!momentsCss.includes('@keyframes') && !momentsCss.includes('animation:'), 'Moments sheet added motion')
for (const marker of ['moments-preview', 'moments-trust', 'moments-live', 'moments-theater']) {
  assert.ok(!reader.includes(marker), `Next Moments class reached reader CSS: ${marker}`)
}
const selectors = momentsCss
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('}')
  .map(block => block.split('{')[0]?.trim())
  .filter(selector => selector && !selector.startsWith('@'))
for (const selector of selectors) {
  assert.ok(selector.includes('.moments-gallery'), `Moments selector is not scoped: ${selector}`)
}
console.log('CSS isolation passed: web probe present; studio and docs markers absent; shell utilities shared')
