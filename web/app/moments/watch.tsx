'use client'

import { storageAddress, type CatalogDetailRow, type CatalogListRow } from '@kickoff/catalog'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Thumb } from './card'
import { durationClock, generatedDate } from './format'
import { readAutoplay, writeAutoplay } from './autoplay'
import {
  countdownAnnouncement,
  countdownVisible,
  metaLine,
  nowPlayingStatus,
  provenanceLines,
  recoveryCopy,
  refusedStatus,
  upNextSplit,
} from './provenance'
import { mergeWatch } from './watch-url'

const READY = 'The video is not requested until Play. The thumbnail above was already loaded, as on its card.'
const SOUND = 'Sound on \u00b7 the soundtrack is generated. Mute in the player.'
const MUTED = 'Muted \u00b7 the soundtrack is generated. Unmute in the player.'
const ENDED = 'Ended. Replay starts from the beginning.'
const ENDED_LAST = 'Ended. That was the last video in Beni\u2019s order; nothing loops. Replay starts from the beginning.'
const RETURNED = 'Ended. The countdown paused while this tab was hidden and resumed when you came back.'
const CANCELLED = 'Autoplay cancelled. Up next waits for a click.'
const KEYBOARD = 'Keyboard: the player\u2019s own shortcuts apply while it has focus.'
const AUTOPLAY_HELP = 'When a video ends, the next one in Up next starts after a five-second countdown with Cancel. Nothing starts on arrival; the first Play is always yours. While this tab is hidden the countdown waits.'
const NOTHING_AFTER = 'Nothing after this one in Beni\u2019s order.'

export function playableAddress(detail: CatalogDetailRow, origin: string | null): string | null {
  if (!origin || !detail.video_bucket || !detail.video_object_path) return null
  return storageAddress(detail.video_bucket, detail.video_object_path, origin)
}

function clock(seconds: number): string | null {
  if (!Number.isFinite(seconds)) return null
  return durationClock(String(seconds))
}

function smallLine(row: CatalogListRow): string {
  const parts = []
  const duration = durationClock(row.duration_s)
  if (duration) parts.push(duration)
  if (row.generated_at) parts.push(`Generated ${generatedDate(row.generated_at)}`)
  return parts.join(' \u00b7 ')
}

export function WatchPage({
  detail,
  list,
  search,
  storageOrigin,
}: {
  detail: CatalogDetailRow
  list: readonly CatalogListRow[]
  search: string
  storageOrigin: string | null
}) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerPlayed = useRef(false)
  const pendingAuto = useRef<string | null>(null)
  const countRef = useRef<number | null>(null)
  const timer = useRef<number | null>(null)
  const endedHidden = useRef(false)
  const [theater, setTheater] = useState(false)
  const [autoplay, setAutoplay] = useState(true)
  const [status, setStatus] = useState(READY)
  const [recovery, setRecovery] = useState<2 | 3 | 4 | null>(null)
  const [count, setCount] = useState<number | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const [focused, setFocused] = useState(false)
  const [playing, setPlaying] = useState(false)
  const { earlier, next } = upNextSplit(list, detail.id)
  const nextRow = next[0] ?? null
  const address = playableAddress(detail, storageOrigin)

  function clearTimer() {
    if (timer.current !== null) window.clearInterval(timer.current)
    timer.current = null
  }

  function go(id: string | null) {
    const href = mergeWatch(window.location.search, window.location.hash, 'moments', id)
    router.push(`${window.location.pathname}${href}`)
  }

  function arm(title: string) {
    clearTimer()
    timer.current = window.setInterval(() => {
      const current = countRef.current
      if (current === null) return
      const nextCount = current - 1
      if (nextCount <= 0) {
        clearTimer()
        countRef.current = null
        setCount(null)
        if (nextRow) {
          pendingAuto.current = nextRow.id
          go(nextRow.id)
        }
        return
      }
      countRef.current = nextCount
      setCount(nextCount)
    }, 1000)
    void title
  }

  function startCountdown(title: string) {
    countRef.current = 5
    setCount(5)
    setAnnouncement(countdownAnnouncement(title))
    arm(title)
  }

  function stopCountdown(announce: boolean) {
    clearTimer()
    countRef.current = null
    setCount(null)
    if (announce) setAnnouncement(CANCELLED)
  }

  useEffect(() => {
    document.getElementById('moments-watch-heading')?.focus()
  }, [detail.id])

  useEffect(() => { setAutoplay(readAutoplay()) }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || pendingAuto.current !== detail.id || !address) return
    pendingAuto.current = null
    video.src = address
    video.play().then(() => {
      setPlaying(true)
      setRecovery(null)
      setStatus(nowPlayingStatus(detail.title))
    }).catch(() => {
      setPlaying(false)
      setStatus(refusedStatus(detail.title))
    })
  }, [detail.id, address, detail.title])

  useEffect(() => {
    function onVisibility() {
      if (document.hidden) {
        clearTimer()
        return
      }
      if (endedHidden.current && nextRow && autoplay && readerPlayed.current) {
        endedHidden.current = false
        setStatus(RETURNED)
        startCountdown(nextRow.title)
        return
      }
      if (countRef.current !== null && nextRow) {
        setStatus(RETURNED)
        arm(nextRow.title)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      clearTimer()
    }
  }, [detail.id, autoplay, nextRow])

  useEffect(() => {
    if (!theater) return
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape' || document.fullscreenElement) return
      setTheater(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [theater])

  function play() {
    const video = videoRef.current
    if (!video) return
    readerPlayed.current = true
    stopCountdown(false)
    if (!address) {
      setRecovery(4)
      return
    }
    if (!video.getAttribute('src')) video.src = address
    video.play().then(() => {
      setPlaying(true)
      setRecovery(null)
      video.focus()
    }).catch(() => {
      setPlaying(false)
      setStatus(refusedStatus(detail.title))
    })
  }

  function pause() {
    stopCountdown(false)
    videoRef.current?.pause()
  }

  function onPlay() {
    setPlaying(true)
    const video = videoRef.current
    if (video?.muted || video?.volume === 0) setStatus(MUTED)
    else if (!status.startsWith('Now playing')) setStatus(SOUND)
  }

  function onPause() {
    const video = videoRef.current
    if (!video || video.ended) return
    setPlaying(false)
    stopCountdown(false)
    const at = clock(video.currentTime)
    const of = clock(video.duration)
    setStatus(at && of ? `Paused at ${at} of ${of}.` : READY)
  }

  function onEnded() {
    setPlaying(false)
    const last = nextRow === null
    setStatus(last ? ENDED_LAST : ENDED)
    if (!readerPlayed.current || !autoplay || !nextRow) return
    if (document.hidden) {
      endedHidden.current = true
      return
    }
    startCountdown(nextRow.title)
  }

  function onError() {
    const code = videoRef.current?.error?.code
    stopCountdown(false)
    setPlaying(false)
    if (code === 1) {
      setRecovery(null)
      setStatus(READY)
      return
    }
    setRecovery(code === 2 || code === 3 ? code : 4)
  }

  function retry() {
    const video = videoRef.current
    if (!video) return
    setRecovery(null)
    if (video.getAttribute('src')) video.load()
    else if (address) video.src = address
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopyStatus('Link copied.')
    } catch {
      setCopyStatus('Copy failed. The address is in the address bar.')
    }
  }

  const lines = provenanceLines(detail, list)
  const recoveryText = recovery ? recoveryCopy(recovery, nextRow?.title ?? null, autoplay) : null
  return (
    <div className={theater ? 'moments-theater' : undefined}>
      <div className="moments-stage-top">
        <a href={mergeWatch(search, '', 'moments', null)} onClick={event => { event.preventDefault(); go(null) }}>← Gallery</a>
        <span>Watch</span>
        <button type="button" aria-pressed={theater} onClick={() => setTheater(value => !value)}>{theater ? 'Exit theater' : 'Theater'}</button>
      </div>
      <h1 id="moments-watch-heading" tabIndex={-1}>{detail.title}</h1>
      {detail.editorial_note ? <p className="moments-note">{detail.editorial_note}</p> : null}
      <p className="moments-facts">{metaLine(detail)}</p>
      <div className="moments-stage-anchor">
        <Thumb row={detail} storageOrigin={storageOrigin} />
        <video
          ref={videoRef}
          controls
          playsInline
          preload="none"
          aria-label={`Generated clip: ${detail.title}`}
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
          onError={onError}
          onVolumeChange={() => {
            const video = videoRef.current
            if (!video || !playing) return
            setStatus(video.muted || video.volume === 0 ? MUTED : SOUND)
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
      <p role="status">{status}</p>
      {focused ? <p>{KEYBOARD}</p> : null}
      {count !== null && nextRow ? (
        <>
          <p className="moments-live" role="status" aria-atomic="true">{announcement}</p>
          <p aria-hidden="true">{countdownVisible(count, nextRow.title)}</p>
          <button type="button" onClick={() => stopCountdown(true)}>Cancel</button>
        </>
      ) : null}
      <div className="moments-actions">
        {recovery === 2 || recovery === 3 ? <button type="button" onClick={retry}>Retry</button> : null}
        {(recovery === null || recovery === 4) && !playing ? (
          <button type="button" onClick={play}>{status.startsWith('Ended') ? 'Replay' : 'Play'}</button>
        ) : null}
        {playing && recovery === null ? <button type="button" onClick={pause}>Pause</button> : null}
        {recovery !== null && nextRow ? <button type="button" onClick={() => go(nextRow.id)}>Next</button> : null}
        <button type="button" onClick={() => void copyLink()}>Copy link</button>
      </div>
      {copyStatus ? <p role="status">{copyStatus}</p> : null}
      {recoveryText ? (
        <div role="alert">
          <h2>{recoveryText.heading}</h2>
          <p>{recoveryText.body}</p>
        </div>
      ) : null}
      <details className="moments-provenance">
        <summary>Source & curation</summary>
        {lines.map(line => <p key={line}>{line}</p>)}
        <p className="moments-eyebrow">Prompt, as submitted</p>
        <p>{'\u201c'}{detail.prompt}{'\u201d'}</p>
      </details>
      <aside>
        <h2>Up next</h2>
        <button
          type="button"
          role="switch"
          aria-checked={autoplay}
          aria-label="Autoplay next"
          onClick={() => setAutoplay(writeAutoplay(!autoplay))}
        >
          <span aria-hidden="true">{autoplay ? 'On' : 'Off'}</span>
        </button>
        <p>{AUTOPLAY_HELP}</p>
        {next.length === 0 ? <p>{NOTHING_AFTER}</p> : (
          <ol>
            {next.map(row => (
              <li key={row.id}>
                <a href={mergeWatch(search, '', 'moments', row.id)} aria-labelledby={`up-${row.id}`} onClick={event => { event.preventDefault(); go(row.id) }}>
                  <span id={`up-${row.id}`}>{row.title}</span>
                </a>
                <small>{smallLine(row)}</small>
              </li>
            ))}
          </ol>
        )}
        {earlier.length > 0 ? (
          <>
            <h2>Earlier</h2>
            <ol>
              {earlier.map(row => (
                <li key={row.id}>
                  <a href={mergeWatch(search, '', 'moments', row.id)} aria-labelledby={`earlier-${row.id}`} onClick={event => { event.preventDefault(); go(row.id) }}>
                    <span id={`earlier-${row.id}`}>{row.title}</span>
                  </a>
                  <small>{smallLine(row)}</small>
                </li>
              ))}
            </ol>
          </>
        ) : null}
      </aside>
    </div>
  )
}

export function WatchMissing({ search }: { search: string }) {
  const router = useRouter()
  useEffect(() => { document.getElementById('moments-missing-heading')?.focus() }, [])
  return (
    <>
      <h1 id="moments-missing-heading" tabIndex={-1}>No published video has this address.</h1>
      <p>The id in the address is not published, or never was. Nothing more is known from here.</p>
      <a href={mergeWatch(search, '', 'moments', null)} onClick={event => {
        event.preventDefault()
        router.push(`${window.location.pathname}${mergeWatch(window.location.search, window.location.hash, 'moments', null)}`)
      }}>← Gallery</a>
    </>
  )
}

export function WatchUnavailable({ search }: { search: string }) {
  const router = useRouter()
  useEffect(() => { document.getElementById('moments-watch-unavailable')?.focus() }, [])
  return (
    <>
      <h1 id="moments-watch-unavailable" tabIndex={-1}>The watch page is unavailable.</h1>
      <p>The server could not read this video{'\u2019'}s record. The cause is unknown from here.</p>
      <button type="button" onClick={() => window.location.reload()}>Try again</button>
      <a href={mergeWatch(search, '', 'moments', null)} onClick={event => {
        event.preventDefault()
        router.push(`${window.location.pathname}${mergeWatch(window.location.search, window.location.hash, 'moments', null)}`)
      }}>← Gallery</a>
    </>
  )
}
