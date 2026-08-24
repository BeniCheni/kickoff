import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `--mode single` inlines every asset into one self-contained dist/index.html that opens
// straight from the filesystem by double-click, the way the original prototype did.
// The default build emits a normal static bundle for hosting.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), tailwindcss(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  build: { outDir: mode === 'single' ? 'dist-single' : 'dist' },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
}))
