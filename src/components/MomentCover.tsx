import type { GalleryMoment } from '../lib/momentsGallery'

/** Original typographic art; never a fetched thumbnail or a purported match still. */
export function MomentCover({ moment, spoiler }: { moment: GalleryMoment; spoiler: boolean }) {
  const family = spoiler ? undefined : moment.editorial?.cover
  const word = family === 'voices' ? 'VOICES' : family === 'seven' ? 'SEVEN' : family === 'together' ? 'TOGETHER' : 'MOMENTS'
  return <div className="moments-cover" data-cover={family ?? 'neutral'}>
    <svg aria-hidden="true" viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice">
      <rect width="600" height="360" fill="var(--media)" />
      <g fill="none" stroke="var(--text)" strokeWidth="1" opacity=".22">
        {family === 'voices' ? Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${20 + i * 35} 0 L${135 + i * 19} 180 L${30 + i * 34} 360`} />)
          : family === 'seven' ? <path d="M40 50H535L280 350M70 75H500L260 335M100 100H465L240 320M130 125H430L220 305" />
          : family === 'together' ? Array.from({ length: 7 }, (_, i) => <ellipse key={i} cx="285" cy="178" rx={45 + i * 31} ry={30 + i * 23} />)
          : <path d="M40 100H560M40 180H560M40 260H560" />}
      </g>
      <path d="M385 0H600V360H520Z" fill="var(--pitch)" opacity=".18" />
      <path d="M36 267H563" stroke="var(--text)" />
    </svg>
    <span className="moments-cover-word" aria-hidden="true">{word}</span>
    <span className="moments-art-label">Original typographic art · not a match still</span>
  </div>
}
