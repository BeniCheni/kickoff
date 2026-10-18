import { formatUsd, parseUsd } from '../money.ts'

/** Show a recorded dollar figure. Trailing zeros drop; the value does not change. */
export function displayUsd(recorded: string): string {
  const canonical = formatUsd(parseUsd(recorded))
  const [whole, fraction = ''] = canonical.split('.')
  const trimmed = fraction.replace(/0+$/, '')
  const shown = trimmed.length < 2 ? fraction.slice(0, 2) : trimmed
  return `$${whole}.${shown}`
}
