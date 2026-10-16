import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { ReactNode } from 'react'
import { connection } from 'next/server'
import { clockSnapshotAt } from '../../src/lib/clock'
import { RequestClock } from '../../src/lib/RequestClock'
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
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <script dangerouslySetInnerHTML={{ __html: "document.write('<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap\">')" }} />
        <style data-kickoff-shell="" dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body>
        <ThemeAttributes />
        <RequestClock snapshot={snapshot}>
          {children}
        </RequestClock>
      </body>
    </html>
  )
}
