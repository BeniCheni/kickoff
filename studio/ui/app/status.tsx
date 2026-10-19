import { statusLine } from '../../shared/status.ts'

export function StatusLine({ body }: { body: unknown }) {
  const line = typeof body === 'string' ? body : statusLine(body)
  if (!line) return null
  return <p className="studio-help" role="status">{line}</p>
}
