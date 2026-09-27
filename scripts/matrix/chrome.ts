import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import { mkdtempSync, rmSync, existsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { CdpConnection } from './cdp'

export type ChromeHandle = {
  cdp: CdpConnection
  sessionId: string
  version: string
  kill: () => Promise<void>
}

const DEFAULT_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

export async function launchChrome(chromePath: string): Promise<ChromeHandle> {
  if (!existsSync(chromePath)) {
    throw new Error(`Chrome not found at ${chromePath}. Pass --chrome or set CHROME_PATH.`)
  }
  const userDataDir = mkdtempSync(path.join(os.tmpdir(), 'kickoff-matrix-'))
  if (!userDataDir.includes('kickoff-matrix-')) {
    throw new Error(`refusing to use an unexpected user-data-dir: ${userDataDir}`)
  }
  const proc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-sync',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-popup-blocking',
    '--disable-hang-monitor',
    '--metrics-recording-only',
    '--password-store=basic',
    '--use-mock-keychain',
    '--force-color-profile=srgb',
    '--hide-scrollbars',
    '--no-pings',
    '--disable-breakpad',
    'about:blank',
  ], { stdio: ['ignore', 'pipe', 'pipe'] })

  let killed = false
  let log = ''
  const append = (chunk: Buffer) => {
    log = (log + chunk.toString()).slice(-8000)
  }
  proc.stdout?.on('data', append)
  proc.stderr?.on('data', append)

  const kill = async () => {
    if (killed) return
    killed = true
    process.off('exit', killOnExit)
    killProcess(proc)
    await new Promise((resolve) => setTimeout(resolve, 100))
    spawnSync('pkill', ['-f', userDataDir], { stdio: 'ignore' })
    rmSync(userDataDir, { recursive: true, force: true })
  }
  const killOnExit = () => {
    killProcess(proc)
    try {
      rmSync(userDataDir, { recursive: true, force: true })
    } catch {
      // exit handlers cannot recover a failed cleanup
    }
  }
  process.on('exit', killOnExit)

  try {
    const wsUrl = await waitForDevtools(proc, () => log)
    const cdp = await CdpConnection.connect(wsUrl)
    const version = await browserVersion(cdp)
    const target = await cdp.send('Target.createTarget', { url: 'about:blank' }) as { targetId?: string }
    if (!target.targetId) throw new Error('Chrome did not return a page target')
    const attached = await cdp.send('Target.attachToTarget', { targetId: target.targetId, flatten: true }) as { sessionId?: string }
    if (!attached.sessionId) throw new Error('Chrome did not attach a DevTools session')
    const sessionId = attached.sessionId
    await cdp.send('Page.enable', {}, sessionId)
    await cdp.send('Runtime.enable', {}, sessionId)
    await cdp.send('Network.enable', {}, sessionId)
    await cdp.send('Log.enable', {}, sessionId)
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true }, sessionId)
    await cdp.send('Fetch.enable', {
      patterns: [
        { urlPattern: '*://*.youtube.com/*' },
        { urlPattern: '*://youtube.com/*' },
        { urlPattern: '*://*.youtube-nocookie.com/*' },
        { urlPattern: '*://youtube-nocookie.com/*' },
        { urlPattern: '*://*.ytimg.com/*' },
        { urlPattern: '*://ytimg.com/*' },
        { urlPattern: '*://*.googlevideo.com/*' },
        { urlPattern: '*://googlevideo.com/*' },
      ],
    }, sessionId)
    return { cdp, sessionId, version, kill }
  } catch (error) {
    await kill()
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`${message}\n${log}`)
  }
}

async function browserVersion(cdp: CdpConnection): Promise<string> {
  const result = await cdp.send('Browser.getVersion') as { product?: string }
  return result.product || 'unknown'
}

function waitForDevtools(proc: ChildProcess, readLog: () => string): Promise<string> {
  return new Promise((resolve, reject) => {
    let settled = false
    const timer = setTimeout(() => {
      fail(new Error(`Chrome did not open a DevTools port\n${readLog()}`))
    }, 15_000)
    const finish = (url: string) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(url)
    }
    const fail = (error: Error) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      reject(error)
    }
    const look = () => {
      const match = readLog().match(/DevTools listening on (ws:\/\/\S+)/)
      if (match?.[1]) finish(match[1])
    }
    proc.stdout?.on('data', look)
    proc.stderr?.on('data', look)
    proc.once('exit', (code) => {
      fail(new Error(`Chrome exited ${code ?? 'unknown'} before DevTools was ready\n${readLog()}`))
    })
    look()
  })
}

function killProcess(proc: ChildProcess): void {
  if (proc.pid === undefined || proc.exitCode !== null) return
  try {
    process.kill(proc.pid, 'SIGKILL')
  } catch {
    // already gone
  }
}

export function defaultChromePath(): string {
  return DEFAULT_CHROME
}
