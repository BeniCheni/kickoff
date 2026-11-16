export type Rgb = { r: number; g: number; b: number; a?: number }

export function parseColor(value: string): { r: number; g: number; b: number; a: number } | null
export function composite(ink: Rgb, ground: Rgb): { r: number; g: number; b: number; a: number }
export function luminance(rgb: Rgb): number
export function contrastRatio(a: Rgb, b: Rgb): number
export function isLargeText(fontSizePx: number, fontWeight: number): boolean
export function floorFor(large: boolean): number

export type ContrastSample = {
  text?: string
  color: string
  large?: boolean
  opacity?: number
  rects?: { x: number; y: number; w: number; h: number }[]
}

export type ContrastMinimum = {
  ink: string
  ground: string
  ratio: number
  large: boolean
  floor: number
  text: string
}

export function sampleContrast(
  samples: readonly ContrastSample[],
  image: { width: number; height: number; data: Uint8Array },
  scaleX?: number,
  scaleY?: number,
  shown?: { width: number; height: number; data: Uint8Array } | null,
): ContrastMinimum[]

export function unreadColors(samples: readonly ContrastSample[]): { color: string; text: string }[]

export function paintedColor(color: string, fill?: string | null): string

export const FONT_HOSTS: ReadonlySet<string>

export function unexpectedHost(
  requestUrl: string,
  pageUrl: string,
  options?: { offline?: boolean },
): string | null

export type ColdLoadTally = {
  bytes: { fonts: number; images: number; script: number; style: number; other: number }
  hosts: { host: string; bytes: number; count: number }[]
  foreign: string[]
}

export interface ColdLoadLog {
  requestWillBeSent(event: {
    requestId: string
    type?: string
    request?: { url?: string }
    redirectResponse?: { url?: string; status?: number }
  }): void
  responseReceived(event: { requestId: string; type?: string }): void
  loadingFinished(event: { requestId: string; encodedDataLength?: number }): void
  tally(pageUrl: string): ColdLoadTally
}

export function createColdLoad(): ColdLoadLog

export const BITMAP_GLYPH: RegExp

export function isBitmapGlyph(text: string): boolean
