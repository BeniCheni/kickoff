import { desc, eq, isNull } from 'drizzle-orm'
import { PER_JOB_CAP_USD, SESSION_CAP_USD } from '../caps.ts'
import { balanceEntry, ledger, session } from '../db/schema.ts'
import { aboveManualCeiling, sessionExposure, type LedgerView } from '../ledger.ts'
import { probeDatabase } from './probe.ts'
import type { OpenedAdmin } from './open.ts'
import type { ShellView } from '../shared/types.ts'

/** Balance, session, caps and database, read from the engine's records. Nothing here is filled in. */
export async function readShell(opened: OpenedAdmin, port: number): Promise<ShellView> {
  if (!opened.databaseHold) {
    opened.database = (await probeDatabase(opened.db)) ? 'reachable' : 'unavailable'
  }
  const caps = {
    perJobUsd: PER_JOB_CAP_USD,
    sessionUsd: SESSION_CAP_USD,
    prepaidCeilingUsd: opened.studio.prepaidCeilingUsd,
  }
  if (opened.database === 'unavailable') {
    return {
      transport: opened.transport,
      databaseEngine: opened.databaseEngine,
      storage: opened.storage,
      falConfigured: opened.falConfigured,
      host: '127.0.0.1',
      port,
      balance: null,
      session: null,
      caps,
      database: 'unavailable',
      outOfCredit: opened.outOfCredit.current,
    }
  }

  const [latestBalance] = await opened.db.select().from(balanceEntry).orderBy(desc(balanceEntry.enteredAt)).limit(1)
  const [open] = await opened.db.select().from(session).where(isNull(session.closedAt)).limit(1)
  let sessionView: ShellView['session'] = null
  if (open) {
    const lines = await opened.db.select().from(ledger).where(eq(ledger.sessionId, open.id))
    const views: LedgerView[] = lines.map((line) => ({
      jobId: line.jobId,
      settlement: line.settlement === 'reconciled' ? 'reconciled' : 'pending',
      estimateUsd: line.estimateUsd,
      amountUsd: line.amountUsd,
      at: line.at,
    }))
    sessionView = {
      spendUsd: sessionExposure(views),
      capUsd: open.capUsd,
      perJobCapUsd: open.perJobCapUsd,
      openedAt: open.openedAt.toISOString(),
    }
  }

  return {
    transport: opened.transport,
    databaseEngine: opened.databaseEngine,
    storage: opened.storage,
    falConfigured: opened.falConfigured,
    host: '127.0.0.1',
    port,
    balance: latestBalance
      ? {
          amountUsd: latestBalance.amountUsd,
          aboveCeiling: aboveManualCeiling(latestBalance.amountUsd),
          readFromFal: false,
        }
      : null,
    session: sessionView,
    caps,
    database: 'reachable',
    outOfCredit: opened.outOfCredit.current,
  }
}
