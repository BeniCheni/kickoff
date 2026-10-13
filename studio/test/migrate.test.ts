import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseEnvFile, redactConnectionText, resolveEnvFile } from '../db/migrate.ts'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

describe('migrate env file', () => {
  it('refuses a file inside the worktree and reads one outside it', () => {
    expect(() => resolveEnvFile(path.join(repoRoot, 'studio', '.env'))).toThrow(/inside the worktree/)
    const dir = mkdtempSync(path.join(tmpdir(), 'studio-env-'))
    const file = path.join(dir, 'studio.env')
    const url = ['postgres', '://', 'user:secret@localhost/db'].join('')
    writeFileSync(file, `DATABASE_URL=${url}\n# comment\n`)
    expect(resolveEnvFile(file)).toBe(file)
    expect(parseEnvFile(`DATABASE_URL=${url}\n`)).toEqual({ DATABASE_URL: url })
    expect(redactConnectionText(`failed ${url}`)).not.toContain('secret')
  })
})
