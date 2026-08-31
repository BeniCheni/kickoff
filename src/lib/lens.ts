/**
 * The lens system (v0.0.3): three presets over one fixture skeleton. A lens may change
 * only atmosphere, day-header scale, row density and the hero element — everything else
 * is invariant, and the Table never changes with lens. Lens is URL state (`?lens=`);
 * Ledger is the default and stays out of the URL.
 */
export const LENSES = ['ledger', 'poster', 'broadcast'] as const

export type Lens = (typeof LENSES)[number]

/** Total decoder: anything that isn't exactly a known lens falls back to Ledger. */
export function parseLens(raw: string | null): Lens {
  return raw === 'poster' || raw === 'broadcast' ? raw : 'ledger'
}

/** Ledger is the default and is omitted from the URL. */
export function encodeLens(lens: Lens): string | null {
  return lens === 'ledger' ? null : lens
}
