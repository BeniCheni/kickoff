import { useId } from 'react'
import type { GalleryMoment } from '../lib/momentsGallery'
import { momentTitle } from '../lib/momentsGallery'
import type { MediaStatus } from '../lib/momentsQueue'
import { blockedRecovery, timeoutRecovery, unavailableRecovery } from '../lib/momentsRecovery'
import { useMomentsSession } from './MomentsSessionProvider'

function Primary({ status }: { status: MediaStatus }) {
  const session = useMomentsSession()!
  if (status === 'blocked' || status === 'timeout' || status === 'failed') {
    return <button type="button" className="moments-button moments-primary" data-primary-action onClick={() => session.play()}>Retry</button>
  }
  if (status === 'ended') {
    return <button type="button" className="moments-button moments-primary" data-primary-action onClick={() => session.play(true)}>Replay</button>
  }
  if (status === 'playing') {
    return <button type="button" className="moments-button moments-primary" data-primary-action onClick={() => session.pausePlayback()}>Pause</button>
  }
  return <button type="button" className="moments-button moments-primary" data-primary-action onClick={() => session.play()}>Play</button>
}

export function SourceLink({ moment, primary = false }: { moment: GalleryMoment; primary?: boolean }) {
  return moment.source ? <a data-primary-action={primary || undefined} className={primary ? 'moments-button moments-primary' : 'moments-source-link'}
    href={moment.source.url} target="_blank" rel="noopener noreferrer">
    Open at {moment.source.name} <span aria-hidden="true">↗</span><span className="sr-only"> (new tab)</span>
  </a> : null
}

export function PlaybackStatus() {
  const session = useMomentsSession()!
  if (session.playerNotice.autoplayBlocked) {
    return <p className="moments-small" data-player-status>Playback has not started. The control inside the player can start it.</p>
  }
  if (session.playerNotice.resume) {
    return <p className="moments-small" data-player-status>Resuming from the last known position.</p>
  }
  return null
}

export function PlaybackRecovery({ moment, nextTitle }: { moment: GalleryMoment; nextTitle: string | null }) {
  const session = useMomentsSession()!
  const status = session.queue.media[moment.id]?.status
  if (status !== 'blocked' && status !== 'timeout' && status !== 'failed') return null
  const copy = status === 'blocked' ? blockedRecovery(nextTitle) : status === 'failed' ? unavailableRecovery(nextTitle) : timeoutRecovery(nextTitle)
  return <section className="moments-recovery" aria-label="Playback recovery" data-playback-recovery>
    <p className="moments-recovery-heading">{copy.heading}</p>
    <p className="moments-small" data-recovery-copy>{copy.body}</p>
  </section>
}

/** Stage and Cinema share this row. Cards keep their own Open-selection action. */
export function PlaybackActions({ moment, target, nextTitle, readNotice = false }: {
  moment: GalleryMoment
  target: string
  nextTitle: string | null
  readNotice?: boolean
}) {
  const session = useMomentsSession()!
  const feedbackId = useId()
  const saved = session.queue.saved.includes(moment.id)
  const media = session.queue.media[moment.id]
  const identity = session.canPlay(moment) && moment.source?.identity?.videoId
  const notice = session.notice && (session.notice.target === target || session.notice.target === 'playback') ? session.notice.text : ''
  const readWarning = readNotice && session.notice?.target === 'initial-read'
    ? 'Saved references could not be read. Changes are visit-only until a browser write succeeds.' : ''
  return <div className="moments-actions">
    <div className="moments-action-row">
      {identity && media ? <Primary status={media.status} /> : <SourceLink moment={moment} primary />}
      {identity ? <SourceLink moment={moment} /> : null}
      <button type="button" className="moments-button moments-save" aria-label={`Save reference: ${momentTitle(moment, session.spoiler)}`}
        aria-pressed={saved} aria-describedby={feedbackId} data-save={moment.id}
        onClick={() => session.toggleSave(moment.id, target)}>Save reference</button>
    </div>
    <p className="moments-save-state">{saved ? 'Saved reference' : 'Not saved'}{session.saved.persistence === 'visit-only' ? ' · visit only' : ''}</p>
    <p id={feedbackId} role="status" aria-live="polite" className="moments-feedback">{notice || readWarning}</p>
    {identity ? <PlaybackStatus /> : null}
    {identity ? <PlaybackRecovery moment={moment} nextTitle={nextTitle} /> : null}
  </div>
}
