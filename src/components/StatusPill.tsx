import { unsettledStatus, type Fixture } from '../lib/schema'
import type { Lens } from '../lib/lens'

const labels = {
  scheduled: null, in_play: 'LIVE', full_time: 'FT', after_extra_time: 'AET',
  after_penalties: 'PENS', postponed: 'POSTPONED', cancelled: 'CANCELLED',
  suspended: 'SUSPENDED', abandoned: 'ABANDONED',
} as const

export function StatusPill({ status, kickedOff, next, lens }: {
  status: Fixture['status']; kickedOff: boolean; next: boolean; lens: Lens
}) {
  const label = kickedOff ? 'KICKED OFF' : labels[status] ?? (next && lens === 'poster' ? 'NEXT' : null)
  if (!label) return null
  const voice = kickedOff ? 'amber' : label === 'NEXT' ? 'pitch'
    : status === 'in_play' || unsettledStatus(status) ? 'alarm' : 'ink'
  return <span className={`fixture-status fixture-status-${lens}`} data-voice={voice}>{label}</span>
}
