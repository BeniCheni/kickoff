export type CommandResult = {
  status: number | null
  stdout: string
  stderr: string
}

export function formatContext(
  results: { sync: CommandResult; worktrees: CommandResult; branch: CommandResult; pr?: CommandResult },
  now: number,
  home?: string,
): string[]
