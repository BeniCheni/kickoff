import type { ReactNode } from 'react'
import { Glyph } from './glyphs'

/** The name is the action the press will take. No aria-pressed: the plan follows
 *  the W3C button pattern, and the handoff's pressed state does not. */
export function MotionControl({ label, onToggle }: { label: ReactNode; onToggle: () => void }) {
  return (
    <button type="button" className="imprint-hit motion-control" onClick={onToggle}>
      <span className="motion-disc">
        <span className="motion-glyph motion-glyph-on"><Glyph name="pause" /></span>
        <span className="motion-glyph motion-glyph-off"><Glyph name="play" /></span>
      </span>
      <span className="imprint-name">{label}</span>
    </button>
  )
}
