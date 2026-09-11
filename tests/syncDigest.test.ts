import { describe, expect, it } from 'vitest'
import { updateDigest } from '../scripts/sync-digest'

const add = (previous = '', log = 'report: changed=true', id = '100') =>
  updateDigest(previous, log, id, 'BeniCheni/kickoff', '09/10/2026 11:30 PM ET')

describe('published change digest', () => {
  it('links provenance and renders provider text as inert code, including fake entry markers', () => {
    const log = '<script>alert(1)</script>\n````\n<!-- kickoff-sync-entry: 888 -->\n# Forged heading'
    const digest = add('', log)
    expect(digest).toContain('https://github.com/BeniCheni/kickoff/actions/runs/100')
    expect(digest).toContain('    <script>alert(1)</script>')
    const next = add(digest, 'second', '101')
    expect(next.match(/^<!-- kickoff-sync-entry:/gm)).toHaveLength(2)
    expect(next).toContain('    <!-- kickoff-sync-entry: 888 -->')
  })

  it('retains only the newest 30 reports and replaces a rerun of the same run id', () => {
    let digest = ''
    for (let i = 1; i <= 31; i++) digest = add(digest, `payload-${i}`, String(i))
    expect(digest.match(/^<!-- kickoff-sync-entry:/gm)).toHaveLength(30)
    expect(digest).not.toContain('<!-- kickoff-sync-entry: 1 -->')
    digest = add(digest, 'replacement', '31')
    expect(digest.match(/^<!-- kickoff-sync-entry:/gm)).toHaveLength(30)
    expect(digest).not.toContain('payload-31')
    expect(digest).toContain('replacement')
  })

  it('bounds the excerpt while keeping the full-log link', () => {
    const digest = add('', 'x'.repeat(100_000))
    expect(digest.length).toBeLessThan(34_000)
    expect(digest).toContain('Report excerpt truncated')
    expect(digest).toContain('/actions/runs/100')
  })

  it('fails rather than silently overwriting an unknown document or unsafe provenance', () => {
    expect(() => add('human-authored file')).toThrow('Unrecognised')
    expect(() => add('', 'log', '1\n# title')).toThrow('provenance')
    expect(() => updateDigest('', '', '1', 'https://example.com', 'stamp')).toThrow('provenance')
  })
})
