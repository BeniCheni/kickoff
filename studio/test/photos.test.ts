import { describe, expect, it } from 'vitest'
import { sha256 } from '../hash.ts'
import { preparePhotograph, stripMetadata } from '../photos/strip.ts'
import { minimalJpeg, taggedJpeg } from './jpeg.ts'

describe('photograph metadata', () => {
  it('drops GPS and device tags and hashes the bytes that would be sent', () => {
    const tagged = taggedJpeg()
    const text = new TextDecoder().decode(tagged)
    expect(text).toContain('GPSLatitude=40.6782')
    expect(text).toContain('GPSLongitude=-73.9442')
    expect(text).toContain('SyntheticCam')
    expect(text).toContain('ST1-Device')

    const stripped = stripMetadata(tagged)
    const sent = new TextDecoder().decode(stripped)
    expect(sent).not.toContain('GPSLatitude')
    expect(sent).not.toContain('GPSLongitude')
    expect(sent).not.toContain('SyntheticCam')
    expect(sent).not.toContain('ST1-Device')
    expect(stripped).toEqual(minimalJpeg)

    const prepared = preparePhotograph(tagged)
    expect(prepared.bytes).toEqual(minimalJpeg)
    expect(prepared.sha256).toBe(sha256(minimalJpeg))
  })
})
