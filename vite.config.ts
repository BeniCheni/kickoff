/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import pkg from './package.json' with { type: 'json' }

// `--mode single` inlines every asset into one self-contained dist/index.html that opens
// straight from the filesystem by double-click, the way the original prototype did.
// The default build emits a normal static bundle for hosting.
export default defineConfig(({ mode }) => ({
  base: './',
  // The header's version string comes from package.json — one source of truth.
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [react(), tailwindcss(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  build: { outDir: mode === 'single' ? 'dist-single' : 'dist' },
  // Two vitest projects under one `npm test` (v0.2.4). `node` is the pure layer — `lib/`,
  // `scripts/`, the diff engine — exactly what ran before. `dom` is the component wiring
  // under jsdom + Testing Library: the clock store's React glue, `useUrlState`'s popstate,
  // the theme effect under StrictMode. `extends: true` hands each project the root config
  // above, so `__APP_VERSION__` and the React plugin reach the DOM tests too. Type-checked
  // separately: tsconfig.node.json (no DOM lib) excludes tests/dom, tsconfig.test-dom.json
  // covers it. What jsdom does *not* do — layout, contrast, `scrollWidth`, a real engine's
  // marquee — stays with the browser matrix in the review skill.
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: ['tests/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: ['tests/dom/**/*.test.tsx'],
          setupFiles: ['tests/dom/setup.ts'],
        },
      },
    ],
  },
}))
