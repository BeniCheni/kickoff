/**
 * Two presentations of the same fixture facts: Poster (the default) and Ledger.
 * Lens is URL state; Poster stays out of the URL. This order drives both the
 * switcher reading order and its arrow-key / Home / End navigation.
 */
export const LENSES = ['poster', 'ledger'] as const

export type Lens = (typeof LENSES)[number]

export const DEFAULT_LENS: Lens = 'poster'

/** Total decoder: anything that isn't exactly a known lens falls back to the default. */
export function parseLens(raw: string | null): Lens {
  return raw === 'ledger' ? raw : DEFAULT_LENS
}

/** The default is omitted from the URL; every other lens is written. */
export function encodeLens(lens: Lens): string | null {
  return lens === DEFAULT_LENS ? null : lens
}
