import { describe, expect, it } from 'vitest'
import { readClipFacts, syntheticMp4 } from '../media/mp4.ts'

const MAC_EPOCH_SECONDS = 2_082_844_800

describe('mp4 facts', () => {
  it('reads container, codec, frame, duration, frame rate, audio and creation time from the boxes', () => {
    const created = new Date('2026-10-18T15:00:00.000Z')
    const creationTime = Math.floor(created.getTime() / 1000) + MAC_EPOCH_SECONDS
    const bytes = syntheticMp4({
      width: 1920,
      height: 1080,
      durationS: 5,
      frameRate: 24,
      audio: true,
      creationTime,
    })
    const read = readClipFacts(bytes)
    expect(read.ok).toBe(true)
    if (!read.ok) return
    expect(read.facts.container).toBe('isom')
    expect(read.facts.videoCodec).toBe('H.264')
    expect(read.facts.width).toBe(1920)
    expect(read.facts.height).toBe(1080)
    expect(read.facts.durationS).toBe(5)
    expect(read.facts.frameRate).toBe(24)
    expect(read.facts.audio).toBe(true)
    expect(read.facts.createdAt?.toISOString()).toBe(created.toISOString())
  })

  it('reports no audio and no creation time when the header has neither', () => {
    const read = readClipFacts(syntheticMp4({ audio: false, creationTime: 0 }))
    expect(read.ok).toBe(true)
    if (!read.ok) return
    expect(read.facts.audio).toBe(false)
    expect(read.facts.createdAt).toBeNull()
  })

  it('refuses a non-mp4, a file with no video track, and a zero duration', () => {
    expect(readClipFacts(new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 0, 0, 0, 0]))).toEqual({ ok: false, reason: 'not-mp4' })
    expect(readClipFacts(syntheticMp4({ brand: 'qt  ', compatible: ['qt  '] }))).toEqual({ ok: false, reason: 'not-mp4' })
    expect(readClipFacts(syntheticMp4({ video: false, audio: true }))).toEqual({ ok: false, reason: 'no-video' })
    expect(readClipFacts(syntheticMp4({ durationS: 0 }))).toEqual({ ok: false, reason: 'zero-duration' })
  })
})
