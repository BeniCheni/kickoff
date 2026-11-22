import { spawn } from 'node:child_process'

/**
 * What one child process gave back. `error` is set when it never ran to completion: it could not
 * start (`ENOENT` when the binary is missing), was killed by a signal, or ran past its timeout.
 */
export interface ProcessResult {
  status: number | null
  stdout: string
  stderr: string
  error?: string
}

/** The one seam both chores use for `gh` and `git`; tests pass a fake, so no test reaches GitHub. */
export type CommandRunner = (command: string, args: readonly string[]) => Promise<ProcessResult>

interface SpawnOptions {
  stdin?: string
  cwd?: string
  timeoutMs?: number
}

/** Runs one command without a shell, so no argument is ever re-parsed. */
export function spawnProcess(command: string, args: readonly string[], options: SpawnOptions = {}): Promise<ProcessResult> {
  return new Promise((resolve) => {
    let stdout = ''
    let stderr = ''
    let settled = false
    let timedOut = false
    const finish = (result: ProcessResult) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(result)
    }
    const child = spawn(command, args, { cwd: options.cwd, stdio: ['pipe', 'pipe', 'pipe'] })
    const timer = options.timeoutMs
      ? setTimeout(() => { timedOut = true; child.kill('SIGTERM') }, options.timeoutMs)
      : undefined
    child.stdout.setEncoding('utf8').on('data', (chunk: string) => { stdout += chunk })
    child.stderr.setEncoding('utf8').on('data', (chunk: string) => { stderr += chunk })
    child.on('error', (err: NodeJS.ErrnoException) => finish({ status: null, stdout, stderr, error: err.code ?? err.message }))
    child.on('close', (status, signal) => {
      const error = timedOut
        ? `timed out after ${Math.round((options.timeoutMs ?? 0) / 1000)} s`
        : signal ? `killed by ${signal}` : undefined
      finish({ status, stdout, stderr, ...(error ? { error } : {}) })
    })
    // A child that exits before reading all of stdin raises EPIPE here; `close` still reports it.
    child.stdin.on('error', () => {})
    child.stdin.end(options.stdin ?? '')
  })
}

export const runCommand: CommandRunner = (command, args) => spawnProcess(command, args)

/** Runs a command that must succeed and returns its stdout; anything else throws with the reason. */
export async function runOk(run: CommandRunner, command: string, args: readonly string[]): Promise<string> {
  const result = await run(command, args)
  if (result.error === 'ENOENT') throw new Error(`${command} was not found on PATH`)
  if (result.error || result.status !== 0) {
    const detail = firstLine(result.stderr) || result.error || `exit ${result.status}`
    throw new Error(`${command} ${args[0] ?? ''} failed: ${detail}`)
  }
  return result.stdout
}

export function firstLine(text: string): string {
  return text.split('\n').map((line) => line.trim()).find(Boolean) ?? ''
}
