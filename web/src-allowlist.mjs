import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** Ceiling for what web/ may import from the reader tree. Transitive imports
 *  made by these modules are their own; a web file may not reach past the list.
 *  src/main.tsx, src/App.tsx, Moments session/player/YouTube modules and studio/
 *  are absent on purpose. */
export const SRC_ALLOWLIST = [
  'src/components/AppHeader.tsx',
  'src/components/CompetitionChip.tsx', // chip ink and competition colour, shared by the filter bar and the table
  'src/components/FilterBar.tsx', // the Fixtures competition filter
  'src/components/FixtureRow.tsx', // one fixture, including TBC and unsettled status
  'src/components/FixturesPage.tsx', // the Fixtures tab
  'src/components/LedgerWeek.tsx', // Ledger week rows
  'src/components/LensSwitcher.tsx',
  'src/components/MatchdayLines.tsx', // matchday labels under a competition's rows
  'src/components/MomentsEmpty.tsx',
  'src/components/MonthView.tsx', // the month grid
  'src/components/NextUpStrip.tsx', // the next-kickoff strip
  'src/components/PosterWeek.tsx', // Poster week blocks
  'src/components/StalenessBanner.tsx',
  'src/components/TabNav.tsx',
  'src/components/TablePage.tsx', // the Table tab
  'src/components/TickerStrip.tsx', // Broadcast Fixtures ticker; the shell mounts it, not FixturesPage
  'src/components/TonightSlate.tsx', // today's slate on the Fixtures tab
  'src/components/ViewBoundary.tsx',
  'src/components/WatchPanel.tsx', // where each competition is shown
  'src/components/WeekView.tsx', // week dispatch into Ledger or Poster
  'src/lib/RequestClock.tsx',
  'src/lib/chipInk.ts', // readable text colour on a competition chip
  'src/lib/clock.ts',
  'src/lib/competitions.ts', // competition names, colours, groups and table leagues
  'src/lib/fixtures.ts',
  'src/lib/lens.ts',
  'src/lib/lensSelectors.ts', // week, month, slate and ticker selection
  'src/lib/matchdays.ts', // matchday windows for the row labels
  'src/lib/momentsReferences.ts', // a saved id is a non-empty untrimmed string; the gallery must not spell that check again
  'src/lib/momentsSaved.ts', // kickoff-moments-saved-v1, the visit-only refusal included
  'src/lib/schema.ts', // fixture and standings validation
  'src/lib/standings.ts', // table rows from the committed standings snapshot
  'src/lib/theme.ts',
  'src/lib/time.ts',
  'src/lib/urlCodecs.ts',
  'src/lib/useNow.ts',
  'src/lib/useThemeController.ts',
  'src/lib/useUrlState.ts',
  'tests/fixtures/edgeFixtures.ts', // synthetic in-play, postponed, suspended, missing-venue and TBC rows shared with the root test
]

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']

export function filesUnder(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === '.next') return []
    const file = path.join(dir, entry.name)
    return entry.isDirectory() ? filesUnder(file) : /\.(?:[cm]?[jt]sx?)$/.test(file) ? [file] : []
  })
}

export function importSpecifiers(source) {
  return [...source.matchAll(/\b(?:import|export)\s+(?:type\s+)?(?:[^;]*?\s+from\s*)?['"]([^'"]+)['"]|\b(?:import|require)\s*\(\s*['"]([^'"]+)['"]/g)]
    .map(match => match[1] ?? match[2])
    .filter(Boolean)
}

/** Map a relative specifier from a web file onto a repo-relative path when it
 *  lands in src/ or tests/. Other specifiers are not the allowlist's subject. */
export function readerImport(fromFile, specifier, repoRoot) {
  if (!specifier.startsWith('.')) return null
  const base = path.resolve(path.dirname(fromFile), specifier)
  const relative = path.relative(repoRoot, base)
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null
  const normalized = relative.split(path.sep).join('/')
  if (!normalized.startsWith('src/') && !normalized.startsWith('tests/')) return null
  if (EXTENSIONS.some(ext => normalized.endsWith(ext))) return normalized
  const withExt = EXTENSIONS.map(ext => normalized + ext).find(candidate => SRC_ALLOWLIST.includes(candidate))
  return withExt ?? `${normalized}.ts`
}

export function allowlistViolations(webRoot, repoRoot, allowlist = SRC_ALLOWLIST) {
  const allowed = new Set(allowlist)
  return filesUnder(webRoot).flatMap(file => {
    const source = readFileSync(file, 'utf8')
    return importSpecifiers(source).flatMap(specifier => {
      const readerPath = readerImport(file, specifier, repoRoot)
      if (readerPath === null || allowed.has(readerPath)) return []
      return [{ file: path.relative(repoRoot, file).split(path.sep).join('/'), specifier, readerPath }]
    })
  })
}

export function assertAllowlist(webRoot, repoRoot, allowlist = SRC_ALLOWLIST) {
  const violations = allowlistViolations(webRoot, repoRoot, allowlist)
  if (violations.length) {
    const detail = violations.map(item => `${item.file} imports ${item.readerPath}`).join('\n')
    throw new Error(`web imported a reader module outside the allowlist:\n${detail}`)
  }
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
if (isCli) {
  const repoRoot = fileURLToPath(new URL('..', import.meta.url))
  const webRoot = fileURLToPath(new URL('.', import.meta.url))
  assertAllowlist(webRoot, repoRoot)
  console.log(`Allowlist passed: ${SRC_ALLOWLIST.length} reader modules`)
}
