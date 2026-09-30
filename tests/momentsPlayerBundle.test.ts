import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return path.endsWith('.ts') || path.endsWith('.tsx') ? [path] : []
  })
}

describe('player bundle boundary', () => {
  it('src never imports the test tree', () => {
    const offenders = sourceFiles('src').filter(file => /from ['"][^'"]*tests\//.test(readFileSync(file, 'utf8')))
    expect(offenders).toEqual([])
  })

  it('Ledger has no variant and index.html does not load the provider', () => {
    const css = readFileSync('src/index.css', 'utf8')
    const html = readFileSync('index.html', 'utf8')
    expect(css).not.toMatch(/@variant ledger|\[data-lens=ledger\]|\[data-lens="ledger"\]/)
    expect(html).not.toMatch(/youtube|iframe_api|youtube-nocookie/)
  })
})
