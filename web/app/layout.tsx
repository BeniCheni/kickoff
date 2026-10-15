import type { ReactNode } from 'react'
import './globals.css'
import { ReactProbe } from './react-probe'

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><ReactProbe />{children}</body></html>
}
