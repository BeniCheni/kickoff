import type { ShellView } from '../../shared/types.ts'

export async function getShell(): Promise<ShellView> {
  const response = await fetch('/api/shell', { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error('refused')
  return await response.json() as ShellView
}
