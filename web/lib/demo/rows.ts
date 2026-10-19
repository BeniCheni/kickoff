import { parseDemoSocial, DEMO_SENTINEL, type DemoSocial } from '@kickoff/demo'

function stripSynthetic(row: unknown): Record<string, unknown> {
  if (row === null || typeof row !== 'object' || Array.isArray(row)) throw new Error('row')
  const record = row as Record<string, unknown>
  if (record.synthetic !== true) throw new Error('synthetic')
  const copy = { ...record }
  delete copy.synthetic
  return copy
}

/** The three view results, or a throw. A non-synthetic row fails the whole document. */
export function demoFromRows(users: readonly unknown[], stats: readonly unknown[], comments: readonly unknown[]): DemoSocial {
  return parseDemoSocial({
    synthetic: true,
    sentinel: DEMO_SENTINEL,
    users: users.map(stripSynthetic),
    stats: stats.map(stripSynthetic),
    comments: comments.map(stripSynthetic),
  })
}
