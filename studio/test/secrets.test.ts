import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
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

  it('rejects deploy hooks and literal bypass headers without a real credential fixture', () => {
    const hook = ['https:', '//api.vercel.com', '/v1/integrations/deploy/', 'prj_', randomUUID(), '/', randomUUID()].join('')
    const header = ['x', 'vercel', 'protection', 'bypass'].join('-')
    expect(findSecrets(hook)).toContain('vercel-deploy-hook')
    for (const text of [
      `${header}: ${randomUUID()}`,
      `"${header}": "${randomUUID()}"`,
      `'${header}': '${randomUUID()}'`,
      `curl -H "${header}: ${randomUUID()}"`,
    ]) expect(findSecrets(text)).toContain('vercel-bypass-literal')
  })

  it.each(['assignment', 'export assignment', 'YAML literal'])('rejects a literal bypass %s', form => {
    const name = ['VERCEL_AUTOMATION', 'BYPASS_SECRET'].join('_')
    const value = randomUUID()
    const text = form === 'assignment' ? `${name}=${value}`
      : form === 'export assignment' ? `export ${name}="${value}"` : `${name}: ${value}`
    expect(findSecrets(text)).toContain(form === 'YAML literal' ? 'vercel-bypass-yaml-literal' : 'vercel-bypass-assignment')
  })

  it('permits Actions secret references and runtime environment references', () => {
    const header = ['x', 'vercel', 'protection', 'bypass'].join('-')
    for (const reference of [
      '${{ secrets.VERCEL_AUTOMATION_BYPASS_SECRET }}',
      '${{ secrets.VERCEL_DEPLOY_HOOK_MAIN }}',
      '$VERCEL_AUTOMATION_BYPASS_SECRET',
      'process.env.VERCEL_AUTOMATION_BYPASS_SECRET',
    ]) expect(findSecrets(`${header}: ${reference}`)).toEqual([])
    const name = ['VERCEL_AUTOMATION', 'BYPASS_SECRET'].join('_')
    for (const text of [`${name}: ''`, name + ': ${{ secrets.' + name + ' }}', `${name}: secrets.${name}`]) {
      expect(findSecrets(text)).toEqual([])
    }
    for (const file of ['.github/workflows/preview-smoke.yml', '.github/workflows/sync.yml', 'tests/vercelSmoke.test.ts']) {
      expect(findSecrets(readFileSync(path.join(repoRoot, file), 'utf8'))).toEqual([])
    }
  })
})
