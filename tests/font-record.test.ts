import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, it } from 'vitest'

function filesUnder(dir: string): string[] {
  const found: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) found.push(...filesUnder(full))
    else found.push(full)
  }
  return found
}

// The script is not run here. A binary that changed without it fails this.
it('every file under public/fonts matches the record', () => {
  const record = readFileSync('public/fonts/RECORD.md', 'utf8')
  const rows = [...record.matchAll(/^\| `([^`]+)` \| (\d+) \| `([0-9a-f]{64})` \|$/gm)]
  const table = new Map(rows.map(row => [row[1], { bytes: Number(row[2]), sha256: row[3] }]))
  const files = filesUnder('public/fonts')
    .map(file => path.relative('public/fonts', file))
    .filter(file => file !== 'RECORD.md')
    .sort()
  expect([...table.keys()].sort()).toEqual(files)
  for (const file of files) {
    const data = readFileSync(path.join('public/fonts', file))
    const listed = table.get(file)
    expect(listed, file).toBeTruthy()
    expect(data.length, file).toBe(listed?.bytes)
    expect(createHash('sha256').update(data).digest('hex'), file).toBe(listed?.sha256)
  }
})
