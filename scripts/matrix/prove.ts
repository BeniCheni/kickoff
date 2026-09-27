import { fileURLToPath, pathToFileURL } from 'node:url'
import { resolveChromePath } from './args'
import { positiveControlProblems } from './control'
import { formatSummary } from './names'
import { proveConfig } from './proveConfig'
import { runMatrix } from './run'
import { startStaticServer } from './staticServer'

const FIXTURES = fileURLToPath(new URL('../../tests/fixtures/matrix/', import.meta.url))

function parseProveArgs(argv: string[]): { out: string; chrome: string | undefined; screenshots: boolean } {
  let out: string | undefined
  let chrome: string | undefined
  let screenshots = false
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--screenshots') {
      screenshots = true
      continue
    }
    if (arg === '--out') {
      const value = argv[i + 1]
      if (!value || value.startsWith('--')) throw new Error('--out needs a value')
      out = value
      i++
      continue
    }
    if (arg === '--chrome') {
      const value = argv[i + 1]
      if (!value || value.startsWith('--')) throw new Error('--chrome needs a value')
      chrome = value
      i++
      continue
    }
    throw new Error(`unknown argument: ${arg ?? ''}`)
  }
  if (!out) throw new Error('--out is required')
  return { out, chrome, screenshots }
}

export async function runPositiveControl(options: { out: string; chromePath: string; screenshots: boolean }): Promise<number> {
  const server = await startStaticServer(FIXTURES)
  try {
    const report = await runMatrix({
      url: server.url,
      out: options.out,
      config: proveConfig,
      screenshots: options.screenshots,
      chromePath: options.chromePath,
      onCell: (result) => {
        console.log(`${result.passed ? 'ok' : 'FAIL'} ${result.id}`)
      },
    })
    console.log(formatSummary(report.cells))
    const problems = positiveControlProblems(report.cells.map((cell) => ({
      id: cell.id,
      state: cell.state,
      passed: cell.passed,
      reasons: cell.reasons,
      scrollWidthPass: cell.scrollWidth.pass,
      geometryPass: cell.geometry.pass,
      hitTestPass: cell.hitTest.pass,
    })))
    if (problems.length > 0) {
      console.error(problems.join('\n'))
      return 1
    }
    console.log('positive control passed: bad pages failed geometry and hit-test at 768 and 1000, good pages passed, media host was flagged')
    return 0
  } finally {
    await server.close()
  }
}

function isDirectRun(): boolean {
  const entry = process.argv[1]
  if (!entry) return false
  return import.meta.url === pathToFileURL(entry).href
}

if (isDirectRun()) {
  let code = 2
  try {
    const args = parseProveArgs(process.argv.slice(2))
    code = await runPositiveControl({
      out: args.out,
      chromePath: resolveChromePath(args.chrome),
      screenshots: args.screenshots,
    })
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    code = 2
  }
  process.exit(code)
}
