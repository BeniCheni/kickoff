import { useRef } from 'react'
import { LENSES, type Lens } from '../lib/lens'

const LABELS: Record<Lens, string> = {
  poster: 'Poster',
  ledger: 'Ledger',
}

/**
 * Poster, then Ledger. Radiogroup: arrow keys move, Home and End jump.
 * Each segment's hit area is 57 × 44; the drawn pill stays 23px tall.
 * Shown on the Table, holding the last lens.
 */
export function LensSwitcher({ lens, onSelect }: { lens: Lens; onSelect: (l: Lens) => void }) {
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  const select = (next: Lens | undefined) => {
    if (next === undefined || next === lens) return
    onSelect(next)
    refs.current[LENSES.indexOf(next)]?.focus()
  }

  const move = (delta: number) => {
    const i = LENSES.indexOf(lens)
    select(LENSES[(i + delta + LENSES.length) % LENSES.length])
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      move(1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      move(-1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      select(LENSES[0])
    } else if (e.key === 'End') {
      e.preventDefault()
      select(LENSES[LENSES.length - 1])
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="Lens"
      onKeyDown={onKeyDown}
      className="lens-switch"
    >
      {LENSES.map((l, i) => (
        <button
          key={l}
          type="button"
          ref={(el) => {
            refs.current[i] = el
          }}
          role="radio"
          aria-checked={lens === l}
          tabIndex={lens === l ? 0 : -1}
          onClick={() => onSelect(l)}
        >
          <span>{LABELS[l]}</span>
        </button>
      ))}
    </div>
  )
}
