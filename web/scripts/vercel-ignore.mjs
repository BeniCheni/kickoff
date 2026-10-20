import { execFileSync, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { buildInputs } from './vercel-build-inputs.mjs'

// Vercel runs this in web/ before install. 0 skips; 1 builds. Never guess from
// HEAD^: a push may contain several commits since the last successful deploy.
let skip = false
try {
  const branch = process.env.VERCEL_GIT_COMMIT_REF
  const previous = process.env.VERCEL_GIT_PREVIOUS_SHA
  const current = process.env.VERCEL_GIT_COMMIT_SHA
  if (branch && branch !== 'main' && previous !== current && /^[a-f0-9]{40}$/.test(previous ?? '') && /^[a-f0-9]{40}$/.test(current ?? '')) {
    const cwd = fileURLToPath(new URL('../..', import.meta.url))
    for (const sha of [previous, current]) execFileSync('git', ['cat-file', '-e', `${sha}^{commit}`], { cwd, stdio: 'ignore' })
    const result = spawnSync('git', ['diff', '--quiet', previous, current, '--', ...buildInputs()], { cwd, stdio: 'ignore' })
    skip = result.status === 0 && !result.error
  }
} catch {
  // Shallow history, missing files, bad input, or any Git error: build.
}
console.log(skip ? 'No web build inputs changed; skip.' : 'Build main, changed inputs, or unproven history.')
process.exitCode = skip ? 0 : 1
