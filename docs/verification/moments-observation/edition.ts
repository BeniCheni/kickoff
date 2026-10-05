import { hasEmbedPermission, parseMoments, type Moment } from '../../../src/lib/moments'
import type { Fixture } from '../../../src/lib/schema'
import type { Authority } from './authority'
import { Refusal } from './authority'

export function generateEdition(authority: Authority, templates: unknown, fixtures: readonly Fixture[]): Moment[] {
  const source = parseMoments(templates, fixtures).slice(0, 2)
  const edition = authority.ids.map((named, i) => {
    const template = source[i]
    if (!template || !hasEmbedPermission(template.source, authority.at)) throw new Refusal('template-not-permitted')
    const item = structuredClone(template)
    item.id = `kickoff-moments-slice-4-test-${i + 1}`
    item.title = `Observation ${i + 1}`
    item.source.identity = { provider: 'youtube', videoId: named.id }
    item.source.url = `https://www.youtube.com/watch?v=${named.id}`
    item.source.name = 'S4 test source; content unverified'
    // Retain the template's known-shape content solely to exercise the existing permission
    // rule. This synthetic metadata is no content or rights judgment about the named video.
    item.source.content!.description = 'Synthetic S4 test metadata; actual content not verified.'
    item.source.permissions = [{ use: 'embed', status: 'permitted', checkedAt: new Date(authority.at).toISOString(),
      basis: `S4 observation record from Beni's authority at ${authority.at}; not an edition permission. ${authority.words}` }]
    delete item.source.availability
    return item
  })
  return parseMoments(edition, fixtures)
}

export function checkBundle(text: string, authority: Authority, mode: 'stub' | 'live'): void {
  if (!text.includes('momentsAcceptance')) throw new Refusal('not-acceptance-build')
  if (!text.includes('moments-observation-hook-v1')) throw new Refusal('missing-observation-hooks')
  if (authority.ids.some(i => !text.includes(i.id))) throw new Refusal('bundle-missing-named-id')
  if (mode === 'live' && /S4Accept|S4Stub/.test(text)) throw new Refusal('bundle-has-fictional-id')
  // The acceptance plugin emits exact edition identities; byte presence alone is not enough.
  const match = text.match(/<script type="application\/json" id="moments-observation-manifest">([^<]+)<\/script>/)
  if (!match) throw new Refusal('bundle-missing-manifest')
  const manifest = JSON.parse(match[1]!) as { ids: string[] }
  if (JSON.stringify(manifest.ids) !== JSON.stringify(authority.ids.map(i => i.id))) throw new Refusal('bundle-id-mismatch')
}
