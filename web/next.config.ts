import type { NextConfig } from 'next'
import { reactAliases, repoRootPath } from './react-resolution.mjs'

const webpackAliases = Object.fromEntries(Object.entries(reactAliases).map(([key, value]) => [
  key,
  typeof value === 'string' ? value : value.default,
]))

const config: NextConfig = {
  cacheComponents: false,
  // NextConfig.agentRules, next/dist/server/config-shared.d.ts (Next 16.4.1).
  // The default writes AGENTS.md beside this config when next dev sees an agent.
  // The repository root AGENTS.md stays the authority, so this stays off.
  agentRules: false,
  // The file tracer resolves a bare specifier from the importing file. A module
  // under ../src therefore also records the repo lock's react/package.json, while
  // the running module is the aliased copy in web/node_modules. Drop that one
  // manifest. The pattern is the repo-root file, not web/node_modules/react.
  outputFileTracingExcludes: {
    '*': ['../node_modules/react/package.json', '../node_modules/react-dom/package.json'],
  },
  // N1 set this to web/ so the sibling package stayed its own project. N2 imports
  // shared modules from ../src, and Turbopack resolves only files inside `root`.
  // The repo root is the smallest directory that contains both web/ and src/.
  // It is not set any higher: a parent directory would pull unrelated trees into
  // the module graph. Aliases below pin React back to web/node_modules so the
  // wider root cannot select the repo lock's copy.
  turbopack: {
    root: repoRootPath,
    resolveAlias: reactAliases,
  },
  webpack: (webpackConfig) => {
    const resolve = webpackConfig.resolve ?? {}
    const current = resolve.alias
    const alias = current && !Array.isArray(current) ? { ...current } : {}
    resolve.alias = { ...alias, ...webpackAliases }
    webpackConfig.resolve = resolve
    return webpackConfig
  },
}

export default config
