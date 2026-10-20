import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const studioRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

describe('onnxruntime install flag', () => {
  it('puts skip in .npmrc and npm hands that to a lifecycle script', () => {
    const npmrc = readFileSync(path.join(studioRoot, '.npmrc'), 'utf8')
    expect(npmrc).toContain('install-links=true')
    expect(npmrc).toContain('onnxruntime-node-install=skip')
    const dir = mkdtempSync(path.join(tmpdir(), 'st4-ort-flag-'))
    writeFileSync(path.join(dir, '.npmrc'), npmrc)
    writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
      name: 'ort-flag',
      version: '0.0.0',
      scripts: {
        postinstall: 'node -e "require(\'fs\').writeFileSync(\'flag.txt\', process.env.npm_config_onnxruntime_node_install || \'unset\')"',
      },
    }))
    const env = { ...process.env }
    delete env.npm_config_onnxruntime_node_install
    delete env.ONNXRUNTIME_NODE_INSTALL
    execFileSync('npm', ['install', '--offline', '--no-audit', '--no-fund', '--package-lock=false'], {
      cwd: dir,
      env,
      stdio: 'pipe',
    })
    expect(readFileSync(path.join(dir, 'flag.txt'), 'utf8')).toBe('skip')
  })

  it('makes parseInstallFlag skip the CUDA download', () => {
    const utils = path.join(studioRoot, 'node_modules/onnxruntime-node/script/install-utils.js')
    const script = `
      const os = require('os')
      os.platform = () => 'linux'
      os.arch = () => 'x64'
      const { parseInstallFlag } = require(${JSON.stringify(utils)})
      process.stdout.write(String(parseInstallFlag()))
    `
    const skipped = execFileSync(process.execPath, ['-e', script], {
      env: { ...process.env, npm_config_onnxruntime_node_install: 'skip' },
      encoding: 'utf8',
    })
    expect(skipped).toBe('false')
  })
})
