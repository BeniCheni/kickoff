/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import pkg from './package.json' with { type: 'json' }
import { inlineBundledFaces } from './scripts/inline-faces.ts'
import { themeBootstrap } from './scripts/themeBootstrap.ts'

// Serve only: the dev server, and vitest, which runs this config in serve mode. Nothing
// there imports the query but tests/harness/states.tsx, which imports TablePage a second
// time, with ?kickoff-specimen; this rewrites that copy's tableFor call so the harness can
// pass synthetic rows. No build mode loads the hook, and the unqueried module the app
// serves is untouched. A missing needle throws rather than silently showing the snapshot.
function kickoffHarnessSpecimen() {
  // The comma keeps a second pass from matching the rewritten call.
  const needle = 'tableFor(league, today, nowUtcIso),'
  const rewritten = 'tableFor(league, today, nowUtcIso, globalThis.__kickoffSpecimen.rows, globalThis.__kickoffSpecimen.fixtures),'
  return {
    name: 'kickoff-harness-specimen',
    apply: 'serve' as const,
    transform(code: string, id: string) {
      const [file, query] = id.split('?')
      if (!file?.includes('TablePage') || !query?.includes('kickoff-specimen')) return
      if (!code.includes(needle)) throw new Error(`kickoff-harness-specimen: ${needle} was not found`)
      return code.replaceAll(needle, rewritten)
    },
  }
}

// `--mode single` inlines every asset into one self-contained dist-single/index.html that opens
// straight from the filesystem by double-click, the way the original prototype did.
// `--mode offline` is the separate Fixtures-and-Table file (N0-Q2 Keep). It does not replace single.
// The default build emits a normal static bundle for hosting.
export default defineConfig(({ mode }) => ({
  base: './',
  // The header's version string comes from package.json — one source of truth.
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [
    themeBootstrap(),
    kickoffHarnessSpecimen(),
    react(),
    tailwindcss(),
    ...(mode === 'single' || mode === 'offline' ? [{
      name: 'kickoff-inline-faces',
      enforce: 'pre' as const,
      transformIndexHtml: {
        order: 'pre' as const,
        handler(html: string) {
          return inlineBundledFaces(html)
        },
      },
    }, viteSingleFile()] : []),
    ...(mode === 'offline' ? [{
      name: 'kickoff-offline-index',
      apply: 'build' as const,
      enforce: 'post' as const,
      generateBundle(_options: unknown, bundle: Record<string, { type: string, fileName: string }>) {
        const html = bundle['offline.html']
        if (html?.type === 'asset') html.fileName = 'index.html'
      },
    }] : []),
  ],
  build: {
    outDir: mode === 'offline' ? 'dist-offline' : mode === 'single' ? 'dist-single' : 'dist',
    ...(mode === 'offline' ? { rollupOptions: { input: 'offline.html' } } : {}),
  },
  // Dev only. The default scan was resolving react-dom/client from a nested checkout
  // inside this repo; these entries are the app and the dev harnesses.
  optimizeDeps: {
    entries: ['index.html', 'offline.html', 'tests/harness/states.html', 'tests/harness/moments.html', 'tests/harness/table.html'],
  },
  // Two vitest projects under one `npm test` (v0.2.4). `node` is the pure layer — `lib/`,
  // `scripts/`, the diff engine — exactly what ran before. `dom` is the component wiring
  // under jsdom + Testing Library: the clock store's React glue, `useUrlState`'s popstate,
  // the theme effect under StrictMode. `extends: true` hands each project the root config
  // above, so `__APP_VERSION__` and the React plugin reach the DOM tests too. Type-checked
  // separately: tsconfig.node.json (no DOM lib) excludes tests/dom, tsconfig.test-dom.json
  // covers it. What jsdom does *not* do — layout, contrast, `scrollWidth` — stays with the
  // browser matrix in the review skill.
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          setupFiles: ['tests/setupGitEnv.ts'],
          include: ['tests/**/*.test.ts'],
          // The directory is the dom project's whatever the extension — the same line
          // tsconfig.node.json draws. Without it a `.test.ts` under tests/dom matched the
          // include above and ran here with no DOM (found by the review of PR #21);
          // tests/dom/environment.test.ts is that file, and fails loudly if this goes.
          exclude: [...configDefaults.exclude, 'tests/dom/**'],
        },
      },
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'jsdom',
          // A viewer in Kathmandu shares no UTC offset with Brooklyn or a venue in the window.
          env: { TZ: 'Asia/Kathmandu' },
          include: ['tests/dom/**/*.test.{ts,tsx}'],
          setupFiles: ['tests/dom/setup.ts'],
          testTimeout: 20_000,
        },
      },
    ],
  },
}))
