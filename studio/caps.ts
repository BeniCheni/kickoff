import { addUsd, cmpUsd } from './money.ts'

/** Ruling 15.8, 5 Oct 2026. A job is one fal request. */
export const PER_JOB_CAP_USD = '1.500000'
export const SESSION_CAP_USD = '6.000000'

/**
 * Ruling 15.8. Beni keeps the prepaid balance at or below this by hand.
 * The Studio records the figure he enters. It never reads the account.
 */
export const PREPAID_CEILING_USD = '9.370000'

/** A-05, 11 Oct 2026. A proposal. The operations plan sets the real ceiling. */
export const TIMEOUT_CEILING_MS = 10 * 60 * 1000
export const TIMEOUT_CEILING_LABEL = 'proposal' as const

/**
 * A proposal, beside the A-05 ceiling. Seconds fal will wait for a runner to
 * start, sent as X-Fal-Request-Start-Timeout. Not a settled deadline.
 */
export const REQUEST_START_TIMEOUT_SECONDS = 120
export const REQUEST_START_TIMEOUT_LABEL = 'proposal' as const

export function decideBudget(estimate: string, sessionSpend: string): 'ok' | 'budget-refused' {
  if (cmpUsd(estimate, PER_JOB_CAP_USD) > 0) return 'budget-refused'
  if (cmpUsd(addUsd(sessionSpend, estimate), SESSION_CAP_USD) > 0) return 'budget-refused'
  return 'ok'
}
