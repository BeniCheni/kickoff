import type { MatrixConfig, MatrixSlice } from './types'

/**
 * Today's app, resting state: 3 lenses × 2 themes × 3 tabs × 4 widths = 72.
 * ~1000px is exactly 1000 CSS pixels so a receipt can be compared across runs.
 * Phone widths use an 844-tall viewport; 1000 uses 900.
 * Reduced motion is on so the lens cross-fade is not mid-flight in a shot.
 * Geometry and hit-testing are omitted here because Cinema is not in the app yet;
 * `momentsStateExample` shows how a later slice adds them.
 */
export const defaultConfig: MatrixConfig = {
  maxEmbeds: 1,
  slices: [
    {
      path: '/',
      viewports: [
        { width: 360, height: 844 },
        { width: 375, height: 844 },
        { width: 390, height: 844 },
        { width: 1000, height: 900 },
      ],
      lenses: ['ledger', 'poster', 'broadcast'],
      tabs: ['fixtures', 'table', 'moments'],
      themes: ['light', 'dark'],
      reducedMotion: 'reduce',
    },
  ],
}

/**
 * Not part of `defaultConfig`. Append it (or a narrower copy) to `slices` when a
 * Moments PR has a real Cinema state. The selectors are placeholders — they match
 * nothing in today's app, and `npm run matrix` does not expand this object.
 * Widths are the ones Moments adds on top of the 72: 768, 1100, 1250, 1440, 1920.
 */
export const momentsStateExample: MatrixSlice = {
  path: '/',
  viewports: [
    { width: 768, height: 900 },
    { width: 1100, height: 900 },
    { width: 1250, height: 900 },
    { width: 1440, height: 1000 },
    { width: 1920, height: 1080 },
  ],
  lenses: ['ledger', 'poster', 'broadcast'],
  tabs: ['moments'],
  themes: ['light', 'dark'],
  state: 'cinema',
  playIntent: false,
  reducedMotion: 'reduce',
  actions: [
    { click: '[data-open-cinema]' },
    { waitFor: '[data-cinema]' },
  ],
  geometry: [
    { kind: 'inside', a: '[data-player]', b: '[data-player-column]' },
    { kind: 'disjoint', a: '[data-player]', b: '[data-queue] button' },
  ],
  hitTest: [{ selector: '[data-queue] button' }],
}
