import { defineConfig } from 'vitest/config'
import { vitestReactAliases, webRootPath } from './react-resolution.mjs'

export default defineConfig({
  root: webRootPath,
  resolve: {
    alias: vitestReactAliases,
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'node',
    include: ['test/**/*.test.{ts,tsx}'],
  },
})
