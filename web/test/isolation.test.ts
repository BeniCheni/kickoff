import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { expect, test } from 'vitest'

const root = fileURLToPath(new URL('../', import.meta.url))
test('web Vitest discovers only its own tests', () => {
  const listed = JSON.parse(execFileSync(process.execPath, [
    path.join(root, 'node_modules/vitest/vitest.mjs'), 'list', '--filesOnly', '--json',
  ], { cwd: root, encoding: 'utf8', timeout: 30_000 })) as { file: string }[]
  expect(listed.length).toBeGreaterThan(0)
  for (const { file } of listed) expect(path.relative(root, file)).toMatch(/^test[/\\]/)
}, 30_000)
