import type { ReactNode } from 'react'
import pkg from '../../package.json'
import { ProvenanceLine } from './ProvenanceLine'

/**
 * Caslon 12/1.4. The provenance line repeats in every foot and is not a control.
 * `children` is the foot's first paragraph; `more` is any that follow it, in order.
 */
export function PageFoot({
  kind,
  children,
  more = [],
}: {
  kind: 'poster' | 'ledger' | 'table'
  children: ReactNode
  more?: readonly string[]
}) {
  return (
    <footer className="page-foot" data-stock={kind === 'table' ? 'black' : undefined} data-voice="ink">
      <ProvenanceLine version={pkg.version} />
      <p className="page-foot-copy">{children}</p>
      {more.map((copy) => <p key={copy} className="page-foot-copy">{copy}</p>)}
    </footer>
  )
}
