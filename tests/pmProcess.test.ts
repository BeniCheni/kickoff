import { describe, expect, it } from 'vitest'
import { spawnProcess } from '../scripts/pm/process'

// Real child processes, each a node one-liner, so the timeout path is the one the chores run.
// Every child here ends by itself within about two seconds even if a test fails.
const node = process.execPath
const timed = async (run: () => Promise<unknown>) => {
  const start = performance.now()
  const result = await run()
  return { result, ms: performance.now() - start }
}

describe('spawnProcess', () => {
  it('passes stdin through and returns what the child printed', async () => {
    const result = await spawnProcess(node, ['-e', 'process.stdin.pipe(process.stdout)'], { stdin: 'kickoff' })
    expect(result).toEqual({ status: 0, stdout: 'kickoff', stderr: '' })
  })

  it('reports a binary that is not there', async () => {
    const result = await spawnProcess('kickoff-no-such-binary', [])
    expect(result.error).toBe('ENOENT')
  })

  it('kills a child that ignores SIGTERM once the grace runs out', async () => {
    // The child says "ready" only after its TERM handler is in place, then never exits on its own
    // before the 2 s safety stop.
    const script = "process.on('SIGTERM', () => {}); process.stdout.write('ready'); setTimeout(() => {}, 2000)"
    const { result, ms } = await timed(() => spawnProcess(node, ['-e', script], { timeoutMs: 400, graceMs: 150 }))
    expect(result).toMatchObject({ status: null, stdout: 'ready', error: 'timed out after 400 ms, stopped with SIGKILL' })
    expect(ms).toBeGreaterThanOrEqual(540)
    expect(ms).toBeLessThan(1500)
  })

  it('stops waiting when a grandchild keeps the pipes open after the kill', async () => {
    // The grandchild inherits stdout and sleeps 2 s, so `close` cannot fire after the child dies.
    const script = [
      "process.on('SIGTERM', () => {})",
      "require('node:child_process').spawn(process.execPath, ['-e', 'setTimeout(() => {}, 2000)'], { stdio: 'inherit' })",
      "process.stdout.write('ready')",
      'setTimeout(() => {}, 2000)',
    ].join('; ')
    const { result, ms } = await timed(() => spawnProcess(node, ['-e', script], { timeoutMs: 400, graceMs: 150 }))
    expect(result).toMatchObject({ status: null, error: 'timed out after 400 ms, and its output did not close after SIGKILL' })
    expect(ms).toBeGreaterThanOrEqual(690)
    expect(ms).toBeLessThan(1700)
  })

  it('lets a child that obeys SIGTERM go quietly', async () => {
    const { result, ms } = await timed(() => spawnProcess(node, ['-e', "process.stdout.write('ready'); setTimeout(() => {}, 2000)"], { timeoutMs: 400, graceMs: 1000 }))
    expect(result).toMatchObject({ status: null, error: 'timed out after 400 ms, stopped with SIGTERM' })
    expect(ms).toBeLessThan(1300)
  })
})
