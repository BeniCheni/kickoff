import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseMatrixArgs, resolveChromePath, MATRIX_USAGE } from './args'
import { launchChrome, type ChromeHandle } from './chrome'
import { defaultConfig } from './defaultConfig'
import { expandConfig } from './expand'
import { cellMatchesOnly, formatSummary } from './names'
import { assertOutsideRepo, gitHead, gitTopLevel } from './safety'
import { runCells } from './session'
import type { CellResult, MatrixConfig, MatrixReport } from './types'

export type RunOptions = {
  url: string
  out: string
  config?: MatrixConfig
  configFile?: string
  only?: string
  screenshots: boolean
  chromePath: string
  onCell?: (result: CellResult) => void
}

export async function runMatrix(options: RunOptions): Promise<MatrixReport> {
  const repo = gitTopLevel()
  const outDir = assertOutsideRepo(options.out, repo)
  mkdirSync(outDir, { recursive: true })
  const config = options.config ?? await loadConfig(options.configFile)
  const cells = expandConfig(config).filter((cell) => cellMatchesOnly(cell, options.only))
  if (cells.length === 0) throw new Error(options.only ? `--only ${options.only} matched no cells` : 'config expanded to no cells')

  let chrome: ChromeHandle | undefined
  const onSignal = () => {
    void chrome?.kill().finally(() => process.exit(130))
  }
  process.on('SIGINT', onSignal)
  process.on('SIGTERM', onSignal)
  try {
    const head = gitHead()
    const indexHtmlSha256 = await hashServedIndex(options.url)
    chrome = await launchChrome(options.chromePath)
    const results = await runCells({
      chrome,
      baseUrl: options.url,
      cells,
      screenshots: options.screenshots,
      outDir,
    })
    for (const result of results) options.onCell?.(result)
    const report: MatrixReport = {
      identity: {
        gitHead: head,
        indexHtmlSha256,
        baseUrl: options.url,
        chromeVersion: chrome.version,
        nodeVersion: process.version,
        time: new Date().toISOString(),
      },
      cells: results,
    }
    writeFileSync(path.join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)
    return report
  } finally {
    process.off('SIGINT', onSignal)
    process.off('SIGTERM', onSignal)
    try {
      chrome?.cdp.close()
    } catch {
      // the process kill below is the one that matters
    }
    await chrome?.kill()
  }
}

export async function hashServedIndex(baseUrl: string): Promise<string> {
  const base = new URL(baseUrl)
  if (!base.pathname.endsWith('/')) base.pathname += '/'
  const url = new URL('index.html', base)
  const response = await fetch(url)
  if (!response.ok) throw new Error(`served index.html returned ${response.status} at ${url}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  return createHash('sha256').update(bytes).digest('hex')
}

async function loadConfig(file: string | undefined): Promise<MatrixConfig> {
  if (!file) return defaultConfig
  if (file.endsWith('.json')) {
    const parsed: unknown = JSON.parse(readFileSync(file, 'utf8'))
    if (!parsed || typeof parsed !== 'object' || !('slices' in parsed)) {
      throw new Error(`config ${file} has no slices`)
    }
    return parsed as MatrixConfig
  }
  const imported = await import(pathToFileURL(path.resolve(file)).href) as { config?: MatrixConfig; default?: MatrixConfig }
  const config = imported.config ?? imported.default
  if (!config?.slices) throw new Error(`config ${file} must export config or default`)
  return config
}

function isDirectRun(): boolean {
  const entry = process.argv[1]
  if (!entry) return false
  return import.meta.url === pathToFileURL(entry).href
}

if (isDirectRun()) {
  let code = 0
  try {
    const args = parseMatrixArgs(process.argv.slice(2))
    const report = await runMatrix({
      url: args.url,
      out: args.out,
      configFile: args.config,
      only: args.only,
      screenshots: args.screenshots,
      chromePath: resolveChromePath(args.chrome),
      onCell: (result) => {
        console.log(`${result.passed ? 'ok' : 'FAIL'} ${result.id}`)
      },
    })
    console.log(formatSummary(report.cells))
    code = report.cells.some((cell) => !cell.passed) ? 1 : 0
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message === 'help') {
      console.log(MATRIX_USAGE)
      code = 0
    } else {
      console.error(message)
      if (message.startsWith('--') || message.startsWith('unknown argument') || message === 'help') console.error(MATRIX_USAGE)
      code = 2
    }
  }
  process.exit(code)
}
