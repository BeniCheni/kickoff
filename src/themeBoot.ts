import { readBootMotion } from './lib/motion'
import { readBootTheme } from './lib/theme'

// Vite bundles this entry as a tiny classic inline head script before stylesheets.
// The module graph is the source, not a second handwritten copy of the decision.
const decision = readBootTheme(window.location.search)
document.documentElement.dataset.lens = decision.lens
document.documentElement.dataset.theme = decision.theme
// The bootstrap is compiled separately and then inlined. Vite substitutes its HTML
// mode here in the outer build. Next embeds the unexpanded string and uses its usual preference.
document.documentElement.dataset.motion = ['single', 'offline'].includes('%MODE%') ? 'off' : readBootMotion()
