import { addUsd, cmpUsd, mulUsd } from './money.ts'

export type LedgerView = {
  jobId: string
  settlement: 'pending' | 'reconciled'
  estimateUsd: string
  amountUsd: string | null
  at: Date
}

export function jobExposure(lines: readonly LedgerView[]): string {
  const reconciled = lines
    .filter((line) => line.settlement === 'reconciled')
    .sort((left, right) => left.at.getTime() - right.at.getTime())
  const latest = reconciled.at(-1)
  if (latest?.amountUsd) return latest.amountUsd
  const pending = lines.find((line) => line.settlement === 'pending')
  return pending?.estimateUsd ?? '0.000000'
}

export function sessionExposure(lines: readonly LedgerView[]): string {
  const byJob = new Map<string, LedgerView[]>()
  for (const line of lines) {
    const group = byJob.get(line.jobId) ?? []
    group.push(line)
    byJob.set(line.jobId, group)
  }
  let total = '0.000000'
  for (const group of byJob.values()) total = addUsd(total, jobExposure(group))
  return total
}

export function reconcileAmount(billableUnits: string, unitPriceUsd: string): string {
  return mulUsd(billableUnits, unitPriceUsd)
}

export function aboveManualCeiling(enteredUsd: string): boolean {
  return cmpUsd(enteredUsd, '9.370000') > 0
}
