import { readBootTheme } from './lib/theme'

// Vite bundles this entry as a tiny classic inline head script before stylesheets.
// The module graph is the source, not a second handwritten copy of the theme decision.
const decision = readBootTheme(window.location.search)
document.documentElement.dataset.lens = decision.lens
document.documentElement.dataset.theme = decision.theme
