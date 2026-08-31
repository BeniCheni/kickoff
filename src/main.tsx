import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { parseLens } from './lib/lens'
import { resolveThemeFromEnvironment } from './lib/theme'
import './index.css'

// Applied at module start, before React renders, so the app never paints the wrong
// theme or lens. (A deferred module is not a hard pre-paint guarantee — noted for later.)
const lens = parseLens(new URLSearchParams(window.location.search).get('lens'))
document.documentElement.dataset.lens = lens
document.documentElement.dataset.theme = resolveThemeFromEnvironment(lens)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
