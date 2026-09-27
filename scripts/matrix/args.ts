export type MatrixArgs = {
  url: string
  out: string
  config: string | undefined
  only: string | undefined
  screenshots: boolean
  chrome: string | undefined
}

export function resolveChromePath(flag: string | undefined, env: NodeJS.ProcessEnv = process.env): string {
  return flag || env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
}

function take(argv: string[], index: number, flag: string): string {
  const value = argv[index + 1]
  if (!value || value.startsWith('--')) throw new Error(`${flag} needs a value`)
  return value
}

export function parseMatrixArgs(argv: string[]): MatrixArgs {
  let url: string | undefined
  let out: string | undefined
  let config: string | undefined
  let only: string | undefined
  let screenshots = false
  let chrome: string | undefined
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--screenshots') {
      screenshots = true
      continue
    }
    if (arg === '--url') {
      url = take(argv, i, '--url')
      i++
      continue
    }
    if (arg === '--out') {
      out = take(argv, i, '--out')
      i++
      continue
    }
    if (arg === '--config') {
      config = take(argv, i, '--config')
      i++
      continue
    }
    if (arg === '--only') {
      only = take(argv, i, '--only')
      i++
      continue
    }
    if (arg === '--chrome') {
      chrome = take(argv, i, '--chrome')
      i++
      continue
    }
    if (arg === '--help' || arg === '-h') {
      throw new Error('help')
    }
    throw new Error(`unknown argument: ${arg ?? ''}`)
  }
  if (!url) throw new Error('--url is required')
  if (!out) throw new Error('--out is required')
  return { url, out, config, only, screenshots, chrome }
}

export const MATRIX_USAGE = `tsx scripts/matrix/run.ts --url <base> --out <dir> [--config <file>] [--only <filter>] [--screenshots] [--chrome <path>]

--out is required and must resolve outside the repo. --only is a comma-separated
AND of width, lens, theme, tab, state, or a full cell id.`
