import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateDemoSocial } from '@kickoff/demo'

const webRoot = fileURLToPath(new URL('..', import.meta.url))
const catalogDir = path.join(webRoot, 'fixtures/catalog')
const ids = []
for (const name of readdirSync(catalogDir).filter(entry => entry.endsWith('.json')).sort()) {
  const body = JSON.parse(readFileSync(path.join(catalogDir, name), 'utf8'))
  if (!Array.isArray(body.videos)) continue
  for (const video of body.videos) {
    if (video && typeof video.id === 'string') ids.push(video.id)
  }
}
const unique = [...new Set(ids)].sort()
const social = generateDemoSocial(unique)
const out = path.join(webRoot, 'fixtures/demo/social.json')
mkdirSync(path.dirname(out), { recursive: true })
writeFileSync(out, `${JSON.stringify(social, null, 2)}\n`)
console.log(`wrote ${out} (${unique.length} videos, ${social.comments.length} comments)`)
