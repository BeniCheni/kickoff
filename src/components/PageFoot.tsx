import type { ReactNode } from 'react'
import pkg from '../../package.json'
import { ProvenanceLine } from './ProvenanceLine'

/** Caslon 12/1.4. The provenance line repeats in every foot and is not a control. */
export function PageFoot({ kind, children }: { kind: 'poster' | 'ledger' | 'table'; children: ReactNode }) {
  return (
    <footer className="page-foot" data-stock={kind === 'table' ? 'black' : undefined} data-voice="ink">
      <ProvenanceLine version={pkg.version} />
      <p className="page-foot-copy">{children}</p>
    </footer>
  )
}
