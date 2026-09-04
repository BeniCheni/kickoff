/**
 * The lens system: three presets over one fixture skeleton. A lens may change only
 * atmosphere, day-header scale, row density and the hero element — everything else is
 * invariant. The Table's markup is untouched by lens; only the sanctioned atmosphere
 * reaches it (Broadcast's theme default, the tab underline and focus-ring accent).
 * Lens is URL state (`?lens=`); Poster is the default (since v0.2.2 — Ledger before that)
 * and stays out of the URL, so `?lens=ledger` is now the value that gets written down.
 * The order below is a loudness gradient (quiet → loud) and drives the switcher's reading
 * order and its arrow-key / Home / End contract — the default is not moved to the front.
 */
export const LENSES = ['ledger', 'poster', 'broadcast'] as const

export type Lens = (typeof LENSES)[number]

export const DEFAULT_LENS: Lens = 'poster'

/** Total decoder: anything that isn't exactly a known lens falls back to the default. */
export function parseLens(raw: string | null): Lens {
  return raw === 'ledger' || raw === 'broadcast' ? raw : DEFAULT_LENS
}

/** The default is omitted from the URL; every other lens is written. */
export function encodeLens(lens: Lens): string | null {
  return lens === DEFAULT_LENS ? null : lens
}
