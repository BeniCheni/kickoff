import path from 'node:path'
import { fileURLToPath } from 'node:url'

const webRoot = fileURLToPath(new URL('.', import.meta.url))
const repoRoot = path.resolve(webRoot, '..')
const reactDir = path.join(webRoot, 'node_modules/react')
const reactDomDir = path.join(webRoot, 'node_modules/react-dom')

/** Package directories, not pinned entry files, so the react-server export
 *  condition still selects the server build. */
export const reactPackageDirs = {
  react: reactDir,
  'react-dom': reactDomDir,
}

export const repoRootPath = repoRoot
export const webRootPath = webRoot

/** Exact module aliases. Subpaths are listed so an importer under ../src cannot
 *  walk up into the repo lock's React. */
export const reactAliases = {
  react: reactDir,
  'react/package.json': path.join(reactDir, 'package.json'),
  'react/jsx-runtime': {
    'react-server': path.join(reactDir, 'jsx-runtime.react-server.js'),
    browser: path.join(reactDir, 'jsx-runtime.js'),
    default: path.join(reactDir, 'jsx-runtime.js'),
  },
  'react/jsx-dev-runtime': {
    'react-server': path.join(reactDir, 'jsx-dev-runtime.react-server.js'),
    browser: path.join(reactDir, 'jsx-dev-runtime.js'),
    default: path.join(reactDir, 'jsx-dev-runtime.js'),
  },
  'react-dom': reactDomDir,
  'react-dom/package.json': path.join(reactDomDir, 'package.json'),
  'react-dom/client': path.join(reactDomDir, 'client.js'),
  'react-dom/server': path.join(reactDomDir, 'server.js'),
  'react-dom/server.browser': path.join(reactDomDir, 'server.browser.js'),
  'react-dom/static': path.join(reactDomDir, 'static.js'),
}

/** Vitest resolves in the client condition. Regexes are exact so `react` does
 *  not prefix-match `react-dom`. */
export const vitestReactAliases = [
  { find: /^react$/, replacement: path.join(reactDir, 'index.js') },
  { find: /^react\/jsx-runtime$/, replacement: path.join(reactDir, 'jsx-runtime.js') },
  { find: /^react\/jsx-dev-runtime$/, replacement: path.join(reactDir, 'jsx-dev-runtime.js') },
  { find: /^react-dom$/, replacement: path.join(reactDomDir, 'index.js') },
  { find: /^react-dom\/client$/, replacement: path.join(reactDomDir, 'client.js') },
  { find: /^react-dom\/server$/, replacement: path.join(reactDomDir, 'server.js') },
  { find: /^react-dom\/server\.browser$/, replacement: path.join(reactDomDir, 'server.browser.js') },
  { find: /^react-dom\/static$/, replacement: path.join(reactDomDir, 'static.js') },
]
