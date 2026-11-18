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
        <link rel="preload" href="/fonts/oswald/Oswald.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/kickoff-mono/KickoffMono-Medium.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/libre-caslon-text/LibreCaslonText-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="stylesheet" href="/faces.css" />
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
