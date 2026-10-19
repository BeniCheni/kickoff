import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { vitestReactAliases, webRootPath } from './react-resolution.mjs'

export default defineConfig({
  root: webRootPath,
  resolve: {
    alias: [
      ...vitestReactAliases,
      { find: 'next/navigation', replacement: path.join(webRootPath, 'test/next-navigation.ts') },
      { find: 'server-only', replacement: path.join(webRootPath, 'test/server-only-stub.ts') },
    ],
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'node',
    include: ['test/**/*.test.{ts,tsx}'],
  },
})
