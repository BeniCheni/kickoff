const SCALE = 1_000_000n

export function parseUsd(value: string): bigint {
  const trimmed = value.trim()
  const negative = trimmed.startsWith('-')
  const body = negative ? trimmed.slice(1) : trimmed
  const [whole = '0', fraction = ''] = body.split('.')
  if (!/^\d+$/.test(whole) || !/^\d*$/.test(fraction) || fraction.length > 6) {
    throw new Error('not a dollar amount')
  }
  const scaled = BigInt(whole) * SCALE + BigInt(fraction.padEnd(6, '0'))
  return negative ? -scaled : scaled
}

export function formatUsd(scaled: bigint): string {
  const negative = scaled < 0n
  const absolute = negative ? -scaled : scaled
  const whole = absolute / SCALE
  const fraction = (absolute % SCALE).toString().padStart(6, '0')
  return `${negative ? '-' : ''}${whole.toString()}.${fraction}`
}

export function addUsd(left: string, right: string): string {
  return formatUsd(parseUsd(left) + parseUsd(right))
}

export function mulUsd(units: string, unitPrice: string): string {
  const product = parseUsd(units) * parseUsd(unitPrice)
  const half = SCALE / 2n
  const rounded = product < 0n ? (product - half) / SCALE : (product + half) / SCALE
  return formatUsd(rounded)
}

export function cmpUsd(left: string, right: string): number {
  const a = parseUsd(left)
  const b = parseUsd(right)
  if (a < b) return -1
  if (a > b) return 1
  return 0
}
