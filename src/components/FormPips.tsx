import type { FormResult } from '../lib/standings'

const SLOTS = 5
const WORD: Record<FormResult, string> = { W: 'won', D: 'drew', L: 'lost' }

/** What a strip says to a reader who cannot see it: the results in the order they are drawn,
 *  and how many slots are empty. It names nothing the strip does not show, and it says nothing
 *  of the snapshot: a strip is this competition's results, and the club may have others. */
export function formLabel(form: readonly FormResult[]): string {
  if (!form.length) return `Form: ${SLOTS} empty slots.`
  const empty = SLOTS - form.length
  const slots = empty > 0 ? ` ${empty} empty ${empty === 1 ? 'slot' : 'slots'}.` : ''
  return `Form, oldest to newest: ${form.map((result) => WORD[result]).join(', ')}.${slots}`
}

/** Lettered W/D/L pips, oldest to newest, padded to five. W is filled in ink, D is outlined and
 *  L is filled in blood; the letter carries the result, so no pip is read by colour alone. A
 *  dot is an empty slot: the row was handed fewer than five results, which tableFor takes from
 *  this competition's finished fixtures and from no other's. */
export function FormPips({ form }: { form: readonly FormResult[] }) {
  const cells: Array<FormResult | null> = [...form]
  while (cells.length < SLOTS) cells.push(null)
  return (
    <span className="form-pips" role="img" aria-label={formLabel(form)}>
      {cells.map((cell, i) => (
        <span key={i} className="form-pip" data-result={cell ?? 'none'} aria-hidden="true">
          {cell ?? '·'}
        </span>
      ))}
    </span>
  )
}
