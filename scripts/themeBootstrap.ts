import { build, type Plugin } from 'vite'
import { fileURLToPath } from 'node:url'

/** Compile the actual production decision into a self-contained classic script. Explicit
 * configFile:false prevents this small build from recursively loading the app's plugins. */
export async function buildThemeBootstrap(): Promise<string> {
  const output = await build({
    configFile: false,
    logLevel: 'silent',
    build: {
      write: false,
      target: 'es2022',
      minify: true,
      lib: { entry: fileURLToPath(new URL('../src/themeBoot.ts', import.meta.url)), name: 'KickoffThemeBoot', formats: ['iife'] },
    },
  })
  const bundle = Array.isArray(output) ? output[0] : output
  if (!bundle || !('output' in bundle)) throw new Error('Theme bootstrap did not produce a bundle')
  const entry = bundle.output.find((item) => item.type === 'chunk' && item.isEntry)
  if (!entry || entry.type !== 'chunk') throw new Error('Theme bootstrap entry is missing')
  // Avoid a literal closing script tag if a future source string contains one.
  return entry.code.replace(/<\/script/gi, '<\\/script')
}

export function themeBootstrap(): Plugin {
  return {
    name: 'kickoff-theme-bootstrap',
    transformIndexHtml: {
      order: 'pre',
      async handler() {
        // head-prepend lands before <meta charset>, which the encoding prescan must find in the
        // first 1024 bytes; tests/themeBootstrap.test.ts pins prelude + script under that budget.
        return [{ tag: 'script', attrs: { 'data-kickoff-theme': '' }, children: await buildThemeBootstrap(), injectTo: 'head-prepend' }]
      },
    },
  }
}
