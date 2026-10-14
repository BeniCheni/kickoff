const MINIMAL_HEX = 'ffd8ffe000104a46494600010100000100010000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432ffc0000b080001000101011100ffc4001f0000010501010101010100000000000000000102030405060708090a0bffc400b5100002010303020403050504040000017d01020300041105122131410613516107227114328191a1082342b1c11552d1f02433627282090a161718191a25262728292a3435363738393a434445464748494a535455565758595a636465666768696a737475767778797a838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae1e2e3e4e5e6e7e8e9eaf1f2f3f4f5f6f7f8f9faffda00080001000100003f00fbffd9'

function decodeHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2)
  for (let index = 0; index < out.length; index += 1) {
    out[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16)
  }
  return out
}

export const minimalJpeg = decodeHex(MINIMAL_HEX)

function segment(marker: number, text: string): Uint8Array {
  const payload = new TextEncoder().encode(text)
  const out = new Uint8Array(4 + payload.length)
  out[0] = 0xff
  out[1] = marker
  const length = payload.length + 2
  out[2] = length >> 8
  out[3] = length & 0xff
  out.set(payload, 4)
  return out
}

/** A synthetic JPEG with fake GPS and device tags. Built at run time, never a photograph. */
export function taggedJpeg(): Uint8Array {
  const exif = segment(0xe1, 'Exif\0Make=SyntheticCam Model=ST1-Device GPSLatitude=40.6782 GPSLongitude=-73.9442')
  const icc = segment(0xe2, 'ICC_PROFILE\0DisplayP3-synthetic')
  const adobe = segment(0xee, 'Adobe\0APP14-synthetic')
  const xmp = segment(0xe1, 'http://ns.adobe.com/xap/1.0/\0<x:xmpmeta>GPSLatitude=40.6782 device=SyntheticCam</x:xmpmeta>')
  const comment = segment(0xfe, 'device=SyntheticCam GPSLongitude=-73.9442')
  const body = minimalJpeg.subarray(2)
  const chunks = [exif, icc, adobe, xmp, comment, body]
  const out = new Uint8Array(2 + chunks.reduce((sum, chunk) => sum + chunk.length, 0))
  out[0] = 0xff
  out[1] = 0xd8
  let offset = 2
  for (const chunk of chunks) {
    out.set(chunk, offset)
    offset += chunk.length
  }
  return out
}
