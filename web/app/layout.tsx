import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { ReactNode } from 'react'
import { connection } from 'next/server'
import { clockSnapshotAt } from '../../src/lib/clock'
import { RequestClock } from '../../src/lib/RequestClock'
import { ReactProbe } from './react-probe'
import { ThemeAttributes } from './theme-attributes'

const themeScript = readFileSync(path.join(process.cwd(), 'generated/theme-boot.txt'), 'utf8')
const themeCss = readFileSync(path.join(process.cwd(), 'generated/shell.css'), 'utf8').replace(/<\/style/gi, '<\\/style')

export default async function RootLayout({ children }: { children: ReactNode }) {
  await connection()
  const snapshot = clockSnapshotAt(Date.now())
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script data-kickoff-theme="" dangerouslySetInnerHTML={{ __html: themeScript }} />
        <style data-kickoff-shell="" dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body>
        <ThemeAttributes />
        <RequestClock snapshot={snapshot}>
          <ReactProbe />
          {children}
        </RequestClock>
      </body>
    </html>
  )
}
