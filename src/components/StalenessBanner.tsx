import { LAST_SYNC_DATE, hoursSinceSync } from '../lib/fixtures'
import { useNow } from '../lib/useNow'

/**
 * Standing rule from the betting project: a carried-forward fixture date is an ESTIMATE
 * until it has been re-checked. This makes that rule visible instead of remembered — past
 * 24 hours the page says so rather than presenting stale rows as current, and it escalates
 * on its own (via useNow()) rather than only when some parent happens to re-render.
 */
export function StalenessBanner() {
  const { nowUtcIso } = useNow()
  const hours = hoursSinceSync(new Date(nowUtcIso))
  if (hours < 24) return null
  const stale = hours >= 72
  const plane = stale ? 'alarm' : 'amber'
  return (
    <div className="staleness" data-plane={plane} data-voice={plane}>
      <b>{stale ? 'Data is stale.' : 'Data may have moved.'}</b> Last synced{' '}
      {Math.floor(hours / 24)} day{Math.floor(hours / 24) === 1 ? '' : 's'} ago (
      {LAST_SYNC_DATE}). Fixtures get rescheduled — run{' '}
      <code>npm run sync</code> before staking anything on a kickoff time.
    </div>
  )
}
