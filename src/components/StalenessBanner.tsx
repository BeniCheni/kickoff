import { LAST_SYNC_DATE, hoursSinceSync } from '../lib/fixtures'

/**
 * Standing rule from the betting project: a carried-forward fixture date is an ESTIMATE
 * until it has been re-checked. This makes that rule visible instead of remembered — past
 * 24 hours the page says so rather than presenting stale rows as current.
 */
export function StalenessBanner() {
  const hours = hoursSinceSync()
  if (hours < 24) return null
  const stale = hours >= 72
  return (
    <div
      className={[
        'mb-4 rounded border px-3.5 py-2.5 text-[11.5px] leading-relaxed',
        stale ? 'border-accent bg-accent/10 text-accent' : 'border-floodlight bg-floodlight-bg text-floodlight',
      ].join(' ')}
    >
      <b>{stale ? 'Data is stale.' : 'Data may have moved.'}</b> Last synced{' '}
      {Math.floor(hours / 24)} day{Math.floor(hours / 24) === 1 ? '' : 's'} ago (
      {LAST_SYNC_DATE}). Fixtures get rescheduled — run{' '}
      <code className="font-mono">npm run sync</code> before staking anything on a kickoff time.
    </div>
  )
}
