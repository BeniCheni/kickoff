export type PreviewGate = {
  hover: boolean
  fine: boolean
  reduce: boolean
  saveData: boolean
}

/** A preview is allowed only for a fine pointer that hovers, without reduced motion or Save-Data. */
export function previewAllowed(gate: PreviewGate): boolean {
  return gate.hover && gate.fine && !gate.reduce && !gate.saveData
}

export function previewGate(): PreviewGate {
  const hover = window.matchMedia('(hover: hover)').matches
  const fine = window.matchMedia('(pointer: fine)').matches
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return { hover, fine, reduce, saveData: connection?.saveData === true }
}

export const PREVIEW_DELAY_MS = 400
