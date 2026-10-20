import { embeddingNotice, statusLine } from '../../shared/status.ts'

export function StatusLine({ body }: { body: unknown }) {
  const line = typeof body === 'string' ? body : statusLine(body)
  const embedded = typeof body === 'string' ? null : embeddingNotice(body)
  if (!line && !embedded) return null
  return (
    <>
      {line ? <p className="studio-help" role="status">{line}</p> : null}
      {embedded ? <p className="studio-help" role="status">{embedded}</p> : null}
    </>
  )
}
