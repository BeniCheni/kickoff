import type { ReactNode } from 'react'
import { connection } from 'next/server'
import { clockSnapshotAt } from '../../src/lib/clock'
import { RequestClock } from '../../src/lib/RequestClock'
import './globals.css'
import { ReactProbe } from './react-probe'

export default async function RootLayout({ children }: { children: ReactNode }) {
  await connection()
  const snapshot = clockSnapshotAt(Date.now())
  return (
    <html lang="en">
      <body>
        <RequestClock snapshot={snapshot}>
          <ReactProbe />
          {children}
        </RequestClock>
      </body>
    </html>
  )
}
