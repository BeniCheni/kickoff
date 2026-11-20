import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

function fontPreloads(file: string): string[] {
  const html = readFileSync(new URL(file, import.meta.url), 'utf8')
  return [...html.matchAll(/rel="preload" href="([^"]+)" as="font"/g)].map((match) => match[1]!)
}

// Ruling 5 of PR 1's review: no preload before text uses the face. The states
// harness draws Caslon on first paint, in its banners and the Table foot. The
// gallery harness opens on Moments, which is set in Inter and draws none. The Table
// harness draws it at once: club names, notes and the Table foot.
it('a harness page preloads Caslon only where its first paint draws it', () => {
  expect(fontPreloads('./harness/states.html')).toEqual(['/fonts/libre-caslon-text/LibreCaslonText-Regular.woff2'])
  expect(fontPreloads('./harness/moments.html')).toEqual([])
  expect(fontPreloads('./harness/table.html')).toEqual(['/fonts/libre-caslon-text/LibreCaslonText-Regular.woff2'])
})
