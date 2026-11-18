/** Six stroke glyphs are the whole vocabulary. Filters and chevron wait for the
 *  week row. No icon library and no emoji. */

export const GLYPHS = ['sync', 'pause', 'play', 'moon', 'filters', 'chevron'] as const
export type GlyphName = (typeof GLYPHS)[number]

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function Glyph({ name }: { name: GlyphName }) {
  return (
    <svg className={`glyph glyph-${name}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {name === 'sync' && (
        <g {...stroke}>
          <path d="M19.4 12.2a7.4 7.4 0 0 1-12.6 5.1" />
          <path d="M4.6 11.8a7.4 7.4 0 0 1 12.6-5.1" />
          <path d="M16.1 4.4h3.7V8.1" />
          <path d="M7.9 19.6H4.2V15.9" />
        </g>
      )}
      {name === 'pause' && (
        <g {...stroke}>
          <path d="M8 5.5v13" />
          <path d="M16 5.5v13" />
        </g>
      )}
      {name === 'play' && (
        <path {...stroke} d="M8.5 6.2v11.6L18 12 8.5 6.2z" />
      )}
      {name === 'moon' && (
        <path {...stroke} d="M15.2 4.6A6.8 6.8 0 1 0 19 15.6 5.5 5.5 0 0 1 15.2 4.6z" />
      )}
      {name === 'filters' && (
        <g {...stroke}>
          <path d="M4 7h16M4 12h16M4 17h16" />
          <circle cx="9" cy="7" r="1.7" />
          <circle cx="15" cy="12" r="1.7" />
          <circle cx="10" cy="17" r="1.7" />
        </g>
      )}
      {name === 'chevron' && (
        <path {...stroke} d="M6 9.5 12 15.5 18 9.5" />
      )}
    </svg>
  )
}

/** 26 × 33. The lamp is rift on its own black ground. Not a control. */
export function PlusFive() {
  return (
    <svg className="plus-five" viewBox="0 0 26 33" width="26" height="33" aria-hidden="true" focusable="false">
      <rect className="plus-five-ground" x="0.75" y="0.75" width="24.5" height="31.5" rx="2.5" />
      <circle className="plus-five-lamp" cx="13" cy="9" r="3.25" />
      <path className="plus-five-filament" d="M13 7.15v3.7M11.15 9h3.7" />
      <path className="plus-five-mark" d="M5.1 24.6h4.4M7.3 22.4v4.4M15.6 22.5h4.6M15.6 22.5v2.15h3.7c.7 0 1.25.5 1.25 1.2S20 27 19.2 27h-3.6" />
    </svg>
  )
}
