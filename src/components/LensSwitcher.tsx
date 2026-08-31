import { useRef } from 'react'
import { LENSES, type Lens } from '../lib/lens'

const LABELS: Record<Lens, string> = {
  ledger: 'Ledger',
  poster: 'Poster',
  broadcast: 'Broadcast',
}

/**
 * The lens control: a segmented pill on the tab-row line, right-aligned. The active
 * segment fills with the lens's leading accent (pitch / ink / floodlight via
 * `--lens-accent`) so the control previews the atmosphere it's about to apply.
 * Radiogroup semantics — arrow keys move the selection, focus ring in the lens accent.
 */
export function LensSwitcher({ lens, onSelect }: { lens: Lens; onSelect: (l: Lens) => void }) {
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  const move = (delta: number) => {
    const i = LENSES.indexOf(lens)
    const next = LENSES[(i + delta + LENSES.length) % LENSES.length]
    if (next === undefined) return
    onSelect(next)
    refs.current[LENSES.indexOf(next)]?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      move(1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      move(-1)
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="Lens"
      onKeyDown={onKeyDown}
      className="mb-2 ml-auto inline-flex items-center gap-0.5 rounded-full border-[1.5px] border-line-strong p-0.5"
    >
      {LENSES.map((l, i) => (
        <button
          key={l}
          ref={(el) => {
            refs.current[i] = el
          }}
          role="radio"
          aria-checked={lens === l}
          tabIndex={lens === l ? 0 : -1}
          onClick={() => onSelect(l)}
          className={[
            'font-display cursor-pointer rounded-full px-2.5 py-[3px] text-[10px] font-semibold tracking-[0.1em] uppercase',
            'transition-[background-color,color] duration-[180ms] ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-lead-strong)',
            lens === l ? 'bg-(--lens-accent) text-on-accent-lead' : 'text-ink-muted hover:text-ink-secondary',
          ].join(' ')}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  )
}
