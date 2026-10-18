import type { NextConfig } from 'next'
import { reactAliases, repoRootPath } from './react-resolution.mjs'

const webpackAliases = Object.fromEntries(Object.entries(reactAliases).map(([key, value]) => [
  key,
  typeof value === 'string' ? value : value.default,
]))

const config: NextConfig = {
  cacheComponents: false,
  // The catalog package ships TypeScript and this repo is not an npm workspace,
  // so Turbopack does not transpile it unless it is named here.
  transpilePackages: ['@kickoff/catalog', '@kickoff/demo'],
  // NextConfig.agentRules, next/dist/server/config-shared.d.ts (Next 16.4.1).
  // The default writes AGENTS.md beside this config when next dev sees an agent.
  // The repository root AGENTS.md stays the authority, so this stays off.
  agentRules: false,
  // N1 set this to web/ so the sibling package stayed its own project. N2 imports
  // shared modules from ../src, and Turbopack resolves only files inside `root`.
  // The repo root is the smallest directory that contains both web/ and src/.
  // It is not set any higher: a parent directory would pull unrelated trees into
  // the module graph. Aliases below keep a ../src import from selecting the repo
  // lock's React. They do not choose the copy the App Router renders.
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
