import type { NextConfig } from 'next'

const config: NextConfig = {
  cacheComponents: false,
  // Keep the sibling package's lockfile/build boundary explicit.
  turbopack: { root: import.meta.dirname },
}

export default config
