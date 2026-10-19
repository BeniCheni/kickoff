'use client'

import type { CatalogDetailRow, CatalogListRow } from '@kickoff/catalog'
import type { ThumbnailSources } from '../../lib/catalog/types'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Thumb } from './card'
import { durationClock, generatedDate } from './format'
import { readAutoplay, writeAutoplay } from './autoplay'
import { readSound, writeSound } from './sound'
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
import { useWatchNavigation, useWatchHref } from './watch-url'
import type { MomentSocial } from '../../lib/catalog/types'
import dynamic from 'next/dynamic'

const WatchSocial = dynamic(() => import('./social').then(mod => mod.WatchSocial))

const STARTING = 'Starting muted.'
const SOUND = 'Sound on \u00b7 the soundtrack is generated. Mute in the player.'
const PLAYING_MUTED = 'Playing muted. Unmute beside the player.'
const ENDED = 'Ended. Replay starts from the beginning.'
const ENDED_LAST = 'Ended. That was the last video in Beni\u2019s order; nothing loops. Replay starts from the beginning.'
const RETURNED = 'Ended. The countdown paused while this tab was hidden and resumed when you came back.'
const CANCELLED = 'Autoplay cancelled. Up next waits for a click.'
const KEYBOARD = 'Keyboard: the player\u2019s own shortcuts apply while it has focus.'
const AUTOPLAY_HELP = 'Videos start muted when you open them. When one ends, the next in Up next starts after a five-second countdown with Cancel. While this tab is hidden the countdown waits.'
const NOTHING_AFTER = 'Nothing after this one in Beni\u2019s order.'

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
  address,
  thumbnail,
  social,
}: {
  detail: CatalogDetailRow
  list: readonly CatalogListRow[]
  search: string
  address: string | null
  thumbnail?: ThumbnailSources
  social?: MomentSocial
}) {
  const navigate = useWatchNavigation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerPlayed = useRef(false)
  const pendingAuto = useRef<string | null>(null)
  const countRef = useRef<number | null>(null)
  const timer = useRef<number | null>(null)
  const endedHidden = useRef(false)
  const activeId = useRef(detail.id)
  const [theater, setTheater] = useState(false)
  const [autoplay, setAutoplay] = useState(true)
  const [status, setStatus] = useState(STARTING)
  const [recovery, setRecovery] = useState<2 | 3 | 4 | null>(null)
  const [count, setCount] = useState<number | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const [focused, setFocused] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [requested, setRequested] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [ringPaused, setRingPaused] = useState(false)
  const [ringRun, setRingRun] = useState(0)
  const galleryHref = useWatchHref(search, null)
  const { earlier, next } = upNextSplit(list, detail.id)
  const nextRow = next[0] ?? null

  function clearTimer() {
    if (timer.current !== null) window.clearInterval(timer.current)
    timer.current = null
  }

  function go(id: string | null) {
    navigate('moments', id)
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
    setRingRun(value => value + 1)
    setCount(5)
    setRingPaused(document.hidden)
    setAnnouncement(countdownAnnouncement(title))
    arm(title)
  }

  function stopCountdown(announce: boolean) {
    clearTimer()
    countRef.current = null
    setCount(null)
    if (announce) setAnnouncement(CANCELLED)
    else setAnnouncement('')
  }

  useLayoutEffect(() => {
    activeId.current = detail.id
    const video = videoRef.current
    // Keep the element, retire the previous file and every per-video state.
    video?.pause()
    video?.removeAttribute('src')
    video?.load()
    clearTimer()
    countRef.current = null
    endedHidden.current = false
    readerPlayed.current = pendingAuto.current === detail.id
    if (!readerPlayed.current) pendingAuto.current = null
    setCount(null)
    setAnnouncement('')
    setCopyStatus('')
    setRecovery(null)
    setPlaying(false)
    setRequested(false)
    setStatus(STARTING)
    document.getElementById('moments-watch-heading')?.focus()
  }, [detail.id])

  useEffect(() => { setAutoplay(readAutoplay()) }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const automatic = readerPlayed.current
    pendingAuto.current = null
    const on = readSound()
    setSoundOn(on)
    video.muted = !on
    if (!address) {
      setRecovery(4)
      return
    }
    setRequested(true)
    video.src = address
    video.play().then(() => {
      if (activeId.current !== detail.id) return
      readerPlayed.current = true
      setPlaying(true)
      setRecovery(null)
      const mutedNow = video.muted || video.volume === 0
      setStatus(mutedNow ? PLAYING_MUTED : automatic ? nowPlayingStatus(detail.title) : SOUND)
    }).catch(() => {
      if (activeId.current !== detail.id) return
      readerPlayed.current = false
      setPlaying(false)
      setStatus(refusedStatus(detail.title))
    })
  }, [detail.id, address, detail.title])

  useEffect(() => {
    function onVisibility() {
      if (document.hidden) {
        clearTimer()
        setRingPaused(true)
        return
      }
      setRingPaused(false)
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
    setRequested(true)
    if (!video.getAttribute('src')) video.src = address
    const on = readSound()
    video.muted = !on
    setSoundOn(on)
    video.play().then(() => {
      if (activeId.current !== detail.id) return
      setPlaying(true)
      setRecovery(null)
      video.focus()
    }).catch(() => {
      if (activeId.current !== detail.id) return
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
    if (video?.muted || video?.volume === 0) setStatus(PLAYING_MUTED)
    else if (!status.startsWith('Now playing')) setStatus(SOUND)
  }

  function onPause() {
    const video = videoRef.current
    if (!video || !video.getAttribute('src') || video.ended) return
    setPlaying(false)
    stopCountdown(false)
    const at = clock(video.currentTime)
    const of = clock(video.duration)
    setStatus(at && of ? `Paused at ${at} of ${of}.` : 'Paused.')
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
    if (!videoRef.current?.getAttribute('src')) return
    const code = videoRef.current?.error?.code
    stopCountdown(false)
    setPlaying(false)
    if (code === 1) {
      setRecovery(null)
      setStatus(STARTING)
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
      if (activeId.current !== detail.id) return
      setCopyStatus('Link copied.')
    } catch {
      if (activeId.current !== detail.id) return
      setCopyStatus('Copy failed. The address is in the address bar.')
    }
  }

  const lines = provenanceLines(detail, list)
  const recoveryText = recovery ? recoveryCopy(recovery, nextRow?.title ?? null, autoplay) : null
  return (
    <div className={theater ? 'moments-theater' : undefined}>
      <div className="moments-stage-top">
        <a href={galleryHref} onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); go(null) }}>← Gallery</a>
        <span>Watch</span>
        <button type="button" aria-pressed={theater} onClick={() => setTheater(value => !value)}>{theater ? 'Exit theater' : 'Theater'}</button>
      </div>
      <h1 id="moments-watch-heading" tabIndex={-1}>{detail.title}</h1>
      {detail.editorial_note ? <p className="moments-note">{detail.editorial_note}</p> : null}
      <p className="moments-facts">{metaLine(detail)}</p>
      <div className="moments-watch-layout">
      <div className="moments-watch-player">
      <div className="moments-stage-anchor">
        <Thumb key={detail.id} row={detail} sources={thumbnail} stage />
        <video
          ref={videoRef}
          style={{ visibility: requested ? 'visible' : 'hidden' }}
          controls
          playsInline
          muted={!soundOn}
          preload="none"
          aria-label={`Generated clip: ${detail.title}`}
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
          onError={onError}
          onVolumeChange={() => {
            const video = videoRef.current
            if (!video || !playing) return
            const on = !video.muted && video.volume > 0
            setSoundOn(writeSound(on))
            setStatus(on ? SOUND : PLAYING_MUTED)
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
      <div className="moments-sound">
        <button type="button" onClick={() => {
          const on = !soundOn
          const video = videoRef.current
          if (video) {
            video.muted = !on
            if (on && video.volume === 0) video.volume = 1
          }
          setSoundOn(writeSound(on))
          if (playing) setStatus(on ? SOUND : PLAYING_MUTED)
        }}>{soundOn ? 'Mute' : 'Unmute'}</button>
      </div>
      <p role="status">{status}</p>
      <p className="moments-keyboard" style={{ visibility: focused ? 'visible' : 'hidden' }}>{KEYBOARD}</p>
      <p className={announcement === CANCELLED ? undefined : 'moments-live'} data-countdown-announcement="" role="status" aria-atomic="true">{announcement}</p>
      {count !== null && nextRow ? (
        <>
          <p aria-hidden="true">{countdownVisible(count, nextRow.title)}</p>
          <svg className="moments-ring" viewBox="0 0 36 36" aria-hidden="true" key={ringRun}>
            <circle className={ringPaused ? 'is-paused' : undefined} cx="18" cy="18" r="15" />
          </svg>
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
      {social ? <WatchSocial key={detail.id} social={social} /> : null}
      <details className="moments-provenance">
        <summary>Source & curation</summary>
        {lines.map(line => <p key={line}>{line}</p>)}
        <p className="moments-eyebrow">Prompt, as submitted</p>
        <p>{'\u201c'}{detail.prompt}{'\u201d'}</p>
      </details>
      </div>
      <aside>
        <h2>Up next</h2>
        <button
          type="button"
          role="switch"
          aria-checked={autoplay}
          aria-label="Autoplay next"
          onClick={() => {
            if (autoplay) { stopCountdown(false); endedHidden.current = false }
            setAutoplay(writeAutoplay(!autoplay))
          }}
        >
          <span aria-hidden="true">{autoplay ? 'On' : 'Off'}</span>
        </button>
        <p>{AUTOPLAY_HELP}</p>
        {next.length === 0 ? <p>{NOTHING_AFTER}</p> : (
          <ol>
            {next.map(row => (
              <WatchRow key={row.id} row={row} search={search} prefix="up" onSelect={go} />
            ))}
          </ol>
        )}
        {earlier.length > 0 ? (
          <>
            <h2>Earlier</h2>
            <ol>
              {earlier.map(row => (
                <WatchRow key={row.id} row={row} search={search} prefix="earlier" onSelect={go} />
              ))}
            </ol>
          </>
        ) : null}
      </aside>
      </div>
    </div>
  )
}

function WatchRow({ row, search, prefix, onSelect }: { row: CatalogListRow; search: string; prefix: string; onSelect(id: string): void }) {
  const href = useWatchHref(search, row.id)
  return <li>
    <a href={href} aria-labelledby={`${prefix}-${row.id}`} onClick={event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      event.preventDefault()
      onSelect(row.id)
    }}><span id={`${prefix}-${row.id}`}>{row.title}</span></a>
    <small>{smallLine(row)}</small>
  </li>
}

export function WatchMissing({ search }: { search: string }) {
  const navigate = useWatchNavigation()
  const href = useWatchHref(search, null)
  useEffect(() => { document.getElementById('moments-missing-heading')?.focus() }, [])
  return (
    <>
      <h1 id="moments-missing-heading" tabIndex={-1}>No published video has this address.</h1>
      <p>The id in the address is not published, or never was. Nothing more is known from here.</p>
      <a href={href} onClick={event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        navigate('moments', null)
      }}>← Gallery</a>
    </>
  )
}

export function WatchUnavailable({ search }: { search: string }) {
  const navigate = useWatchNavigation()
  const href = useWatchHref(search, null)
  useEffect(() => { document.getElementById('moments-watch-unavailable')?.focus() }, [])
  return (
    <>
      <h1 id="moments-watch-unavailable" tabIndex={-1}>The watch page is unavailable.</h1>
      <p>The server could not read this video{'\u2019'}s record. The cause is unknown from here.</p>
      <button type="button" onClick={() => window.location.reload()}>Try again</button>
      <a href={href} onClick={event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        navigate('moments', null)
      }}>← Gallery</a>
    </>
  )
}
