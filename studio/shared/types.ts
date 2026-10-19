export type TransportName = 'stub' | 'live'

export type DatabaseName = 'reachable' | 'unavailable'

export type DatabaseEngine = 'pglite' | 'postgres'

export type StorageName = 'stub' | 'r2' | 'refused'

export type BalanceView = {
  amountUsd: string
  aboveCeiling: boolean
  readFromFal: false
}

export type SessionView = {
  spendUsd: string
  capUsd: string
  perJobCapUsd: string
  openedAt: string
}

export type CapsView = {
  perJobUsd: string
  sessionUsd: string
  prepaidCeilingUsd: string
}

export type ShellView = {
  transport: TransportName
  databaseEngine: DatabaseEngine
  storage: StorageName
  falConfigured: boolean
  host: '127.0.0.1'
  port: number
  balance: BalanceView | null
  session: SessionView | null
  caps: CapsView
  database: DatabaseName
  outOfCredit: boolean
}

export const STUDIO_TABS = ['compose', 'jobs', 'review', 'publish', 'import'] as const

export type StudioTab = (typeof STUDIO_TABS)[number]

export const TAB_LABELS: Record<StudioTab, string> = {
  compose: 'Compose',
  jobs: 'Jobs',
  review: 'Review',
  publish: 'Publish',
  import: 'Import',
}
