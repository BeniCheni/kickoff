import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { parseLens } from './lib/lens'
import { parseTheme, resolveTheme } from './lib/theme'
import './index.css'

// Applied before first paint so the page never flashes the wrong theme or lens.
const lens = parseLens(new URLSearchParams(window.location.search).get('lens'))
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
document.documentElement.dataset.lens = lens
document.documentElement.dataset.theme = resolveTheme(
  lens,
  parseTheme(localStorage.getItem('kickoff-theme')),
  parseTheme(localStorage.getItem('kickoff-theme-broadcast')),
  prefersDark,
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
