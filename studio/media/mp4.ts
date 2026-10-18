/**
 * Facts read from an MP4's own bytes (ISO BMFF boxes). No ffprobe and no
 * avmediainfo. The fields are the ones the fal spike reported for a clip:
 * container, video codec, width, height, duration, frame rate, and audio.
 */

const MP4_BRANDS = new Set([
  'isom', 'iso2', 'iso3', 'iso4', 'iso5', 'iso6', 'mp41', 'mp42', 'avc1', 'dash', 'MSNV', 'M4V',
])

const CODECS: Record<string, string> = {
  avc1: 'H.264',
  avc3: 'H.264',
  hvc1: 'H.265',
  hev1: 'H.265',
  mp4v: 'MPEG-4',
  vp09: 'VP9',
  av01: 'AV1',
}

/** Seconds between 1904-01-01 and 1970-01-01. MP4 creation times count from 1904. */
const MAC_EPOCH_SECONDS = 2_082_844_800

export type ClipFacts = {
  container: string
  videoCodec: string
  width: number
  height: number
  durationS: number
  frameRate: number | null
  audio: boolean
  createdAt: Date | null
}

export type ClipRefusal = 'not-mp4' | 'no-video' | 'zero-duration' | 'truncated'

export type ClipRead =
  | { ok: true; facts: ClipFacts }
  | { ok: false; reason: ClipRefusal; brand?: string }

type Box = { type: string; start: number; payloadStart: number; payloadLength: number }

function viewOf(bytes: Uint8Array): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
}

function fourcc(bytes: Uint8Array, offset: number): string {
  return String.fromCharCode(bytes[offset] ?? 0, bytes[offset + 1] ?? 0, bytes[offset + 2] ?? 0, bytes[offset + 3] ?? 0)
}

function u32(view: DataView, offset: number): number {
  return view.getUint32(offset)
}

function u64(view: DataView, offset: number): number {
  return view.getUint32(offset) * 2 ** 32 + view.getUint32(offset + 4)
}

function boxWalk(bytes: Uint8Array, start: number, length: number): { boxes: Box[]; consumed: boolean } {
  const view = viewOf(bytes)
  const end = start + length
  const found: Box[] = []
  let offset = start
  while (offset + 8 <= end) {
    let size = view.getUint32(offset)
    const type = fourcc(bytes, offset + 4)
    let header = 8
    if (size === 1) {
      if (offset + 16 > end) return { boxes: found, consumed: false }
      size = u64(view, offset + 8)
      header = 16
    } else if (size === 0) {
      size = end - offset
    }
    if (size < header || offset + size > end) return { boxes: found, consumed: false }
    found.push({ type, start: offset, payloadStart: offset + header, payloadLength: size - header })
    offset += size
  }
  return { boxes: found, consumed: offset === end }
}

function boxes(bytes: Uint8Array, start: number, length: number): Box[] {
  return boxWalk(bytes, start, length).boxes
}

function child(bytes: Uint8Array, box: Box, type: string): Box | undefined {
  return boxes(bytes, box.payloadStart, box.payloadLength).find((item) => item.type === type)
}

function children(bytes: Uint8Array, box: Box): Box[] {
  return boxes(bytes, box.payloadStart, box.payloadLength)
}

/** A header time before this is a sentinel, not a finish time. Beni's floor, 18 Oct 2026. */
const CREATION_FLOOR_MS = Date.parse('2024-01-01T00:00:00.000Z')

function creationDate(seconds: number): Date | null {
  if (!Number.isFinite(seconds) || seconds <= 0) return null
  const unix = seconds - MAC_EPOCH_SECONDS
  if (unix < 0 || unix > 4_102_444_800) return null
  const date = new Date(unix * 1000)
  if (date.getTime() < CREATION_FLOOR_MS) return null
  return date
}

function readMvhd(bytes: Uint8Array, box: Box): { durationS: number; createdAt: Date | null } | null {
  if (box.payloadLength < 20) return null
  const view = viewOf(bytes)
  const version = bytes[box.payloadStart] ?? 0
  if (version === 1) {
    if (box.payloadLength < 32) return null
    const timescale = u32(view, box.payloadStart + 20)
    const duration = u64(view, box.payloadStart + 24)
    return {
      durationS: timescale > 0 ? duration / timescale : 0,
      createdAt: creationDate(u64(view, box.payloadStart + 4)),
    }
  }
  const timescale = u32(view, box.payloadStart + 12)
  const duration = u32(view, box.payloadStart + 16)
  return {
    durationS: timescale > 0 ? duration / timescale : 0,
    createdAt: creationDate(u32(view, box.payloadStart + 4)),
  }
}

function readMdhd(bytes: Uint8Array, box: Box): { timescale: number; duration: number } | null {
  if (box.payloadLength < 20) return null
  const view = viewOf(bytes)
  const version = bytes[box.payloadStart] ?? 0
  if (version === 1) {
    if (box.payloadLength < 32) return null
    return { timescale: u32(view, box.payloadStart + 20), duration: u64(view, box.payloadStart + 24) }
  }
  return { timescale: u32(view, box.payloadStart + 12), duration: u32(view, box.payloadStart + 16) }
}

function readTkhd(bytes: Uint8Array, box: Box): { width: number; height: number } | null {
  const version = bytes[box.payloadStart] ?? 0
  const widthAt = version === 1 ? 88 : 76
  if (box.payloadLength < widthAt + 8) return null
  const view = viewOf(bytes)
  return {
    width: Math.round(view.getUint32(box.payloadStart + widthAt) / 65536),
    height: Math.round(view.getUint32(box.payloadStart + widthAt + 4) / 65536),
  }
}

function readHandler(bytes: Uint8Array, box: Box): string {
  if (box.payloadLength < 12) return ''
  return fourcc(bytes, box.payloadStart + 8)
}

function readCodec(bytes: Uint8Array, stsd: Box): { codec: string; width: number; height: number } | null {
  if (stsd.payloadLength < 16) return null
  const view = viewOf(bytes)
  const format = fourcc(bytes, stsd.payloadStart + 12)
  let width = 0
  let height = 0
  if (stsd.payloadLength >= 8 + 32 + 4) {
    width = view.getUint16(stsd.payloadStart + 8 + 32)
    height = view.getUint16(stsd.payloadStart + 8 + 34)
  }
  return { codec: CODECS[format] ?? format.trim(), width, height }
}

function readSampleCount(bytes: Uint8Array, stts: Box): { samples: number; delta: number | null } {
  if (stts.payloadLength < 8) return { samples: 0, delta: null }
  const view = viewOf(bytes)
  const entries = u32(view, stts.payloadStart + 4)
  let samples = 0
  let delta: number | null = null
  for (let index = 0; index < entries; index += 1) {
    const at = stts.payloadStart + 8 + index * 8
    if (at + 8 > stts.payloadStart + stts.payloadLength) break
    const count = u32(view, at)
    samples += count
    if (delta === null) delta = u32(view, at + 4)
  }
  return { samples, delta }
}

function brandsOf(bytes: Uint8Array, ftyp: Box): { major: string; compatible: string[] } {
  const major = fourcc(bytes, ftyp.payloadStart).trim()
  const compatible: string[] = []
  for (let offset = 8; offset + 4 <= ftyp.payloadLength; offset += 4) {
    compatible.push(fourcc(bytes, ftyp.payloadStart + offset).trim())
  }
  return { major, compatible }
}

export function readClipFacts(bytes: Uint8Array): ClipRead {
  const walked = boxWalk(bytes, 0, bytes.byteLength)
  if (!walked.consumed) return { ok: false, reason: 'truncated' }
  const top = walked.boxes
  const ftyp = top[0]
  if (!ftyp || ftyp.type !== 'ftyp') return { ok: false, reason: 'not-mp4' }
  const brands = brandsOf(bytes, ftyp)
  const accepted = isMp4Brand(brands.major) || brands.compatible.some((brand) => isMp4Brand(brand))
  if (!accepted) return { ok: false, reason: 'not-mp4', brand: brands.major }
  const moov = top.find((box) => box.type === 'moov')
  if (!moov) return { ok: false, reason: 'no-video' }
  const mvhd = child(bytes, moov, 'mvhd')
  const movie = mvhd ? readMvhd(bytes, mvhd) : null
  let video: { width: number; height: number; durationS: number; codec: string; frameRate: number | null } | null = null
  let audio = false
  for (const trak of children(bytes, moov).filter((box) => box.type === 'trak')) {
    const mdia = child(bytes, trak, 'mdia')
    if (!mdia) continue
    const handler = child(bytes, mdia, 'hdlr')
    const kind = handler ? readHandler(bytes, handler) : ''
    if (kind === 'soun') audio = true
    if (kind !== 'vide' || video) continue
    const tkhd = child(bytes, trak, 'tkhd')
    const frame = tkhd ? readTkhd(bytes, tkhd) : null
    const mdhdBox = child(bytes, mdia, 'mdhd')
    const mdhd = mdhdBox ? readMdhd(bytes, mdhdBox) : null
    const minf = child(bytes, mdia, 'minf')
    const stbl = minf ? child(bytes, minf, 'stbl') : undefined
    const stsd = stbl ? child(bytes, stbl, 'stsd') : undefined
    const stts = stbl ? child(bytes, stbl, 'stts') : undefined
    const sample = stsd ? readCodec(bytes, stsd) : null
    const counted = stts ? readSampleCount(bytes, stts) : { samples: 0, delta: null }
    const durationS = mdhd && mdhd.timescale > 0 ? mdhd.duration / mdhd.timescale : 0
    const width = frame?.width || sample?.width || 0
    const height = frame?.height || sample?.height || 0
    let frameRate: number | null = null
    if (durationS > 0 && counted.samples > 0) frameRate = counted.samples / durationS
    else if (mdhd && counted.delta && counted.delta > 0) frameRate = mdhd.timescale / counted.delta
    video = {
      width,
      height,
      durationS,
      codec: sample?.codec ?? 'unknown',
      frameRate,
    }
  }
  if (!video) return { ok: false, reason: 'no-video' }
  const durationS = video.durationS > 0 ? video.durationS : movie?.durationS ?? 0
  if (!(durationS > 0)) return { ok: false, reason: 'zero-duration' }
  return {
    ok: true,
    facts: {
      container: brands.major,
      videoCodec: video.codec,
      width: video.width,
      height: video.height,
      durationS,
      frameRate: video.frameRate,
      audio,
      createdAt: movie?.createdAt ?? null,
    },
  }
}

function isMp4Brand(brand: string): boolean {
  return MP4_BRANDS.has(brand)
}

const CONTAINERS = new Set(['moov', 'trak', 'mdia', 'minf', 'stbl'])

function visitBoxes(bytes: Uint8Array, start: number, length: number, visit: (box: Box) => void) {
  for (const box of boxes(bytes, start, length)) {
    visit(box)
    if (CONTAINERS.has(box.type)) visitBoxes(bytes, box.payloadStart, box.payloadLength, visit)
  }
}

/** Chunk offsets from every `stco` and `co64`. They are absolute file positions. */
export function chunkOffsets(bytes: Uint8Array): { stco: number[]; co64: number[] } {
  const view = viewOf(bytes)
  const stco: number[] = []
  const co64: number[] = []
  visitBoxes(bytes, 0, bytes.byteLength, (box) => {
    if (box.type === 'stco') {
      const count = u32(view, box.payloadStart + 4)
      for (let index = 0; index < count; index += 1) stco.push(u32(view, box.payloadStart + 8 + index * 4))
    }
    if (box.type === 'co64') {
      const count = u32(view, box.payloadStart + 4)
      for (let index = 0; index < count; index += 1) co64.push(u64(view, box.payloadStart + 8 + index * 8))
    }
  })
  return { stco, co64 }
}

/**
 * Rename every top-level, `moov`, and `trak` `udta` or `meta` box to `free` and zero its payload.
 * The box size stays, so `stco` and `co64` offsets still point at the same samples.
 */
export function stripClip(bytes: Uint8Array): { bytes: Uint8Array; stripped: string } {
  const copy = new Uint8Array(bytes)
  const found = new Set<string>()
  const rewrite = (start: number, length: number, depth: 0 | 1 | 2) => {
    for (const box of boxes(copy, start, length)) {
      if ((box.type === 'udta' || box.type === 'meta') && depth <= 2) {
        copy.set(text('free'), box.start + 4)
        copy.fill(0, box.payloadStart, box.payloadStart + box.payloadLength)
        found.add(box.type)
        continue
      }
      if (box.type === 'moov' && depth === 0) rewrite(box.payloadStart, box.payloadLength, 1)
      if (box.type === 'trak' && depth === 1) rewrite(box.payloadStart, box.payloadLength, 2)
    }
  }
  rewrite(0, copy.byteLength, 0)
  const names = ['udta', 'meta'].filter((name) => found.has(name))
  return { bytes: copy, stripped: names.length > 0 ? names.join(',') : 'none' }
}

/** True when `moov` comes before `mdat`, which is what phones need for a fast first frame. */
export function isFastStart(bytes: Uint8Array): boolean {
  const top = boxes(bytes, 0, bytes.byteLength)
  const moov = top.findIndex((box) => box.type === 'moov')
  const mdat = top.findIndex((box) => box.type === 'mdat')
  if (moov < 0) return false
  if (mdat < 0) return true
  return moov < mdat
}

function concat(parts: Uint8Array[]): Uint8Array {
  const size = parts.reduce((sum, part) => sum + part.length, 0)
  const out = new Uint8Array(size)
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }
  return out
}

function be32(value: number): Uint8Array {
  const out = new Uint8Array(4)
  new DataView(out.buffer).setUint32(0, value >>> 0)
  return out
}

function be16(value: number): Uint8Array {
  const out = new Uint8Array(2)
  new DataView(out.buffer).setUint16(0, value)
  return out
}

function text(value: string): Uint8Array {
  return new TextEncoder().encode(value)
}

function pad(length: number): Uint8Array {
  return new Uint8Array(length)
}

function wrap(type: string, payload: Uint8Array): Uint8Array {
  return concat([be32(8 + payload.length), text(type), payload])
}

/**
 * A small synthetic MP4 for tests. Not a playable picture; the boxes carry
 * the facts `readClipFacts` is asked to recover.
 */
export function syntheticMp4(input: {
  width?: number
  height?: number
  durationS?: number
  frameRate?: number
  audio?: boolean
  /** Seconds since 1904-01-01. Zero means the header has no creation time. */
  creationTime?: number
  brand?: string
  compatible?: string[]
  video?: boolean
  /** Adds a location `udta` and an encoder `meta`, at the top, in `moov`, and in the video `trak`. */
  userData?: boolean
  /** Adds an `mdat` plus one `stco` entry and one `co64` entry. */
  chunks?: boolean
  /** Puts `mdat` before `moov`. */
  mdatFirst?: boolean
} = {}): Uint8Array {
  const width = input.width ?? 1920
  const height = input.height ?? 1080
  const durationS = input.durationS ?? 5
  const frameRate = input.frameRate ?? 24
  const creationTime = input.creationTime ?? 0
  const brand = input.brand ?? 'isom'
  const compatible = input.compatible ?? ['isom', 'mp42']
  const timescale = frameRate * 1000
  const samples = Math.round(durationS * frameRate)
  const sampleDelta = frameRate > 0 ? Math.round(timescale / frameRate) : 0
  const trackDuration = samples * sampleDelta
  const identity = concat([
    be32(0x00010000), be32(0), be32(0),
    be32(0), be32(0x00010000), be32(0),
    be32(0), be32(0), be32(0x40000000),
  ])
  const mvhd = wrap('mvhd', concat([
    be32(0),
    be32(creationTime),
    be32(creationTime),
    be32(1000),
    be32(Math.round(durationS * 1000)),
    be32(0x00010000),
    be16(0x0100),
    be16(0),
    pad(8),
    identity,
    pad(24),
    be32(2),
  ]))
  const traks: Uint8Array[] = []
  if (input.video !== false) {
    const tkhd = wrap('tkhd', concat([
      be32(7),
      be32(creationTime),
      be32(creationTime),
      be32(1),
      be32(0),
      be32(Math.round(durationS * 1000)),
      pad(8),
      be16(0),
      be16(0),
      be16(0),
      be16(0),
      identity,
      be32(width * 65536),
      be32(height * 65536),
    ]))
    const mdhd = wrap('mdhd', concat([
      be32(0),
      be32(creationTime),
      be32(creationTime),
      be32(timescale),
      be32(trackDuration),
      be16(0x55c4),
      be16(0),
    ]))
    const hdlr = wrap('hdlr', concat([
      be32(0),
      be32(0),
      text('vide'),
      pad(12),
      text('VideoHandler\0'),
    ]))
    const entry = concat([
      be32(8 + 78),
      text('avc1'),
      pad(6),
      be16(1),
      be16(0),
      be16(0),
      pad(12),
      be16(width),
      be16(height),
      be32(0x00480000),
      be32(0x00480000),
      be32(0),
      be16(1),
      pad(32),
      be16(0x0018),
      be16(0xffff),
    ])
    const stsd = wrap('stsd', concat([be32(0), be32(1), entry]))
    const stts = wrap('stts', concat([be32(0), be32(1), be32(samples), be32(sampleDelta)]))
    const stco = input.chunks ? wrap('stco', concat([be32(0), be32(1), be32(0)])) : new Uint8Array()
    const co64 = input.chunks ? wrap('co64', concat([be32(0), be32(1), be32(0), be32(0)])) : new Uint8Array()
    const stbl = wrap('stbl', concat([stsd, stts, stco, co64]))
    const minf = wrap('minf', stbl)
    const mdia = wrap('mdia', concat([mdhd, hdlr, minf]))
    const trakUdta = input.userData ? wrap('udta', text('©xyz+40.7128-074.0060/')) : new Uint8Array()
    traks.push(wrap('trak', concat([tkhd, mdia, trakUdta])))
  }
  if (input.audio) {
    const tkhd = wrap('tkhd', concat([
      be32(7),
      be32(creationTime),
      be32(creationTime),
      be32(2),
      be32(0),
      be32(Math.round(durationS * 1000)),
      pad(8),
      be16(0),
      be16(0),
      be16(0x0100),
      be16(0),
      identity,
      be32(0),
      be32(0),
    ]))
    const mdhd = wrap('mdhd', concat([
      be32(0),
      be32(0),
      be32(0),
      be32(48000),
      be32(Math.round(durationS * 48000)),
      be16(0x55c4),
      be16(0),
    ]))
    const hdlr = wrap('hdlr', concat([
      be32(0),
      be32(0),
      text('soun'),
      pad(12),
      text('SoundHandler\0'),
    ]))
    const mdia = wrap('mdia', concat([mdhd, hdlr]))
    traks.push(wrap('trak', concat([tkhd, mdia])))
  }
  const ftyp = wrap('ftyp', concat([
    text(brand.padEnd(4, ' ').slice(0, 4)),
    be32(0),
    ...compatible.map((item) => text(item.padEnd(4, ' ').slice(0, 4))),
  ]))
  const meta = input.userData
    ? wrap('meta', concat([be32(0), wrap('ilst', text('©tooLavf58.76.100'))]))
    : new Uint8Array()
  const topUdta = input.userData ? wrap('udta', text('©xyz+40.7128-074.0060/')) : new Uint8Array()
  const sampleA = text('SAMPLE-ONE-STCO')
  const sampleB = text('SAMPLE-TWO-CO64')
  const mdat = input.chunks ? wrap('mdat', concat([sampleA, sampleB])) : new Uint8Array()
  const moov = wrap('moov', concat([mvhd, ...traks, meta]))
  const parts = input.mdatFirst ? [ftyp, mdat, topUdta, moov] : [ftyp, topUdta, moov, mdat]
  const file = concat(parts)
  if (input.chunks) {
    const mdatAt = parts.slice(0, parts.indexOf(mdat)).reduce((sum, part) => sum + part.length, 0)
    const first = mdatAt + 8
    const second = first + sampleA.length
    const view = viewOf(file)
    visitBoxes(file, 0, file.byteLength, (box) => {
      if (box.type === 'stco') view.setUint32(box.payloadStart + 8, first)
      if (box.type === 'co64') {
        view.setUint32(box.payloadStart + 8, 0)
        view.setUint32(box.payloadStart + 12, second)
      }
    })
  }
  return file
}
