import { readFileSync } from 'node:fs'

/** Literals assembled so this file is not itself a secret or a Next import. */
const MARKERS = [
  'next' + '/',
  '__NEXT',
  'drizzle',
  'postgres' + '://',
  'studio' + '/',
  '@kickoff/catalog',
  'DATABASE_URL',
  'FAL_KEY',
  'STUDIO_ENV_FILE',
  'STUDIO_LIVE',
  'STUDIO_DATA_DIR',
  'STUDIO_MEDIA_DIR',
  'STUDIO_NOW',
  'STUDIO_STUB',
  'STUDIO_STORAGE_FAIL',
  'iframe_api',
  'youtube-nocookie',
  'data-moments-youtube-api',
  'data-moments-player-slot',
  'player-lost',
]

export function offlineBundleViolations(html: string): string[] {
  return MARKERS.filter(marker => html.includes(marker))
}

const isCli = process.argv[1]?.endsWith('scan-offline-bundle.ts')
if (isCli) {
  const file = process.argv[2] ?? 'dist-offline/index.html'
  const html = readFileSync(file, 'utf8')
  const hits = offlineBundleViolations(html)
  if (hits.length) {
    console.error(`Offline bundle failed the scan (${file}): ${hits.join(', ')}`)
    process.exit(1)
  }
  console.log(`Offline bundle scan passed: ${file}, ${MARKERS.length} markers`)
}
