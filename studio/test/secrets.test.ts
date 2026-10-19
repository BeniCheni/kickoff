import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { redact } from '../log/redact.ts'
import { findSecrets, productionBundles, scanFiles, trackedFiles } from '../secrets/scan.ts'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

describe('secrets', () => {
  it('recognises a connection string and a key-shaped token', () => {
    const url = ['postgres', '://', 'user:secret@localhost/db'].join('')
    const key = ['sk-', 'abcdefgh'].join('')
    const jwt = ['eyJ', 'a'.repeat(20), '.', 'b'.repeat(10), '.payload'].join('')
    const publishable = ['sb_publishable_', 'abcdefgh'].join('')
    const secret = ['sb_secret_', 'abcdefgh'].join('')
    const assignment = ['FAL', '_KEY=', 'present'].join('')
    const r2Account = ['R2_ACCOUNT', '_ID=', 'present'].join('')
    const r2Access = ['R2_ACCESS', '_KEY_ID=', 'present'].join('')
    const r2Secret = ['R2_SECRET', '_ACCESS_KEY=', 'present'].join('')
    expect(findSecrets(url)).toContain('postgres-url')
    expect(findSecrets(key)).toContain('provider-key')
    expect(findSecrets(jwt)).toContain('jwt')
    expect(findSecrets(publishable)).toContain('supabase-publishable')
    expect(findSecrets(secret)).toContain('supabase-secret')
    expect(findSecrets(assignment)).toContain('fal-assignment')
    expect(findSecrets(r2Account)).toContain('r2-account')
    expect(findSecrets(r2Access)).toContain('r2-access-key')
    expect(findSecrets(r2Secret)).toContain('r2-secret')
    const redacted = redact(`authorization: Key ${key} ${url} ${assignment} ${r2Account} ${r2Access} ${r2Secret}`)
    expect(redacted).not.toContain('secret')
    expect(redacted).not.toContain(key)
    expect(redacted).not.toContain('present')
  })

  it('finds none in the tracked tree or the production bundle', () => {
    const files = [...trackedFiles(repoRoot), ...productionBundles(repoRoot)]
    expect(scanFiles(repoRoot, files)).toEqual([])
  })
})
