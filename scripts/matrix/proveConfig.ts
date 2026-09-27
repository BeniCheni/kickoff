import type { MatrixConfig } from './types'

const shape = {
  geometry: [
    { kind: 'inside' as const, a: '#player', b: '#column' },
    { kind: 'disjoint' as const, a: '#player', b: '.cue' },
  ],
  hitTest: [{ selector: '.cue' }],
}

const shared = {
  lenses: ['poster' as const],
  tabs: ['fixtures' as const],
  themes: ['light' as const],
  reducedMotion: 'reduce' as const,
}

/**
 * The D-06 pair plus a media-host probe. Bad must fail geometry and hit-testing
 * at 768 and 1000 while page width still matches. Good must pass. Media must be
 * flagged even though the request is failed before it leaves the machine.
 */
export const proveConfig: MatrixConfig = {
  maxEmbeds: 1,
  slices: [
    {
      ...shared,
      path: '/overflow-bad.html',
      state: 'bad',
      viewports: [
        { width: 768, height: 800 },
        { width: 1000, height: 800 },
      ],
      ...shape,
    },
    {
      ...shared,
      path: '/overflow-good.html',
      state: 'good',
      viewports: [
        { width: 768, height: 800 },
        { width: 1000, height: 800 },
      ],
      ...shape,
    },
    {
      ...shared,
      path: '/media-provider.html',
      state: 'media',
      viewports: [{ width: 390, height: 800 }],
      playIntent: false,
    },
  ],
}
