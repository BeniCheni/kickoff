import { parseLens } from './lib/lens'
import { resolveThemeFromEnvironment } from './lib/theme'

// Vite bundles this entry as a tiny classic inline head script before stylesheets.
// The module graph is the source, not a second handwritten copy of the theme decision.
const lens = parseLens(new URLSearchParams(window.location.search).get('lens'))
document.documentElement.dataset.lens = lens
document.documentElement.dataset.theme = resolveThemeFromEnvironment(lens)
