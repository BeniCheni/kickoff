/**
 * The YouTube IFrame adapter and the port the deterministic mock implements.
 * No React and no dependency. A callback is accepted only for the attempt that
 * captured it: item, attempt, player instance, and — for playing and ended —
 * the loaded video id. Navigation never waits on a cross-origin reply.
 */

export type PlayerFailure = {
  kind: 'owner-blocked' | 'unavailable' | 'unknown'
  providerError?: number
}

export type PlayerNotice =
  | { itemId: string; attempt: number; event: 'playing' | 'paused' | 'ended' | 'position'; position?: number }
  | { itemId: string; attempt: number; event: 'failure'; failure: PlayerFailure }

export type PlayRequest = {
  itemId: string
  attempt: number
  videoId: string
  position: number
  replay: boolean
  /** Restore a cached position after this instance loads a different video. */
  resume: boolean
}

export type PlayerHooks = {
  dispatch: (event: PlayerNotice) => void
  onResumeLabel: (visible: boolean) => void
  onAutoplayBlocked: () => void
}

export type MomentsPlayer = {
  play: (request: PlayRequest) => void
  /** Sample, then pause. Does not retire the attempt and does not destroy. */
  pause: () => void
  /** Sample, pause, and drop later callbacks. The iframe stays. */
  retire: () => void
  /** Host unmount only. */
  dispose: () => void
}

export type MomentsPlayerFactory = (host: HTMLElement, hooks: PlayerHooks) => MomentsPlayer

const API_SRC = 'https://www.youtube.com/iframe_api'
const STATE = new Set([-1, 0, 1, 2, 3, 5])

type Ticket = PlayRequest & {
  retired: boolean
  failed: boolean
  instanceId: number
}

type YTPlayer = {
  playVideo: () => void
  pauseVideo: () => unknown
  loadVideoById: (videoId: string) => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getCurrentTime: () => number
  getVideoUrl: () => string
  getIframe: () => HTMLIFrameElement
  destroy: () => void
}

type YTEvent = { target: YTPlayer; data: number }

type YTNamespace = {
  Player: new (element: HTMLElement, options: {
    width?: number
    height?: number
    events?: {
      onReady?: (event: YTEvent) => void
      onStateChange?: (event: YTEvent) => void
      onError?: (event: YTEvent) => void
      onAutoplayBlocked?: (event: YTEvent) => void
    }
  }) => YTPlayer
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiLoader: Promise<void> | null = null

function failureFor(code: number): PlayerFailure {
  if (code === 101 || code === 150) return { kind: 'owner-blocked', providerError: code }
  if (code === 2 || code === 5 || code === 100) return { kind: 'unavailable', providerError: code }
  return { kind: 'unknown', providerError: code }
}

function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value)
}

function finitePosition(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

function idFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    const watch = parsed.searchParams.get('v')
    if (watch && /^[A-Za-z0-9_-]{11}$/.test(watch)) return watch
    const embed = parsed.pathname.match(/\/embed\/([A-Za-z0-9_-]{11})/)
    return embed?.[1] ?? null
  } catch {
    return null
  }
}

function loadApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()
  if (!document.querySelector('script[data-moments-youtube-api]')) apiLoader = null
  if (apiLoader) return apiLoader
  apiLoader = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve()
    }
    const script = document.createElement('script')
    script.src = API_SRC
    script.async = true
    script.dataset.momentsYoutubeApi = 'true'
    script.onerror = () => {
      apiLoader = null
      reject(new Error('youtube-iframe-api'))
    }
    document.head.append(script)
  })
  return apiLoader
}

export function createYouTubePlayer(host: HTMLElement, hooks: PlayerHooks): MomentsPlayer {
  let player: YTPlayer | null = null
  let instanceId = 0
  let current: Ticket | null = null
  let rememberedId: string | null = null
  let pendingSeek: number | null = null
  let pendingTicket: Ticket | null = null
  let rejected = false

  const sample = (): number | null => {
    if (!player) return null
    try { return finitePosition(player.getCurrentTime()) } catch { return null }
  }

  const loadedId = (): string | null => {
    if (!player) return rememberedId
    try {
      const url = player.getVideoUrl()
      if (typeof url === 'string' && url.length > 0) {
        const id = idFromUrl(url)
        if (id) return id
      }
    } catch { /* the remembered id remains the attempt's source */ }
    return rememberedId
  }

  const dispatchPosition = (ticket: Ticket, position: number | null) => {
    if (position === null || ticket.retired) return
    hooks.dispatch({ itemId: ticket.itemId, attempt: ticket.attempt, event: 'position', position })
  }

  const fail = (ticket: Ticket, failure: PlayerFailure) => {
    if (ticket.failed || ticket.retired || current !== ticket) return
    ticket.failed = true
    hooks.dispatch({ itemId: ticket.itemId, attempt: ticket.attempt, event: 'failure', failure })
  }

  const accept = (event: { target?: unknown }, builtId: number): Ticket | null => {
    if (builtId !== instanceId || !player || event.target !== player) return null
    const ticket = current
    if (!ticket || ticket.retired || ticket.instanceId !== builtId) return null
    return ticket
  }

  const settleSeek = (ticket: Ticket) => {
    if (!player || pendingTicket !== ticket || pendingSeek === null) return false
    const target = pendingSeek
    pendingSeek = null
    pendingTicket = null
    player.seekTo(target, true)
    const position = sample()
    if (position !== null) {
      dispatchPosition(ticket, position)
      hooks.onResumeLabel(true)
    }
    return true
  }

  const onReady = (event: YTEvent, builtId: number) => {
    const ticket = accept(event, builtId)
    if (!ticket || !player) return
    if (!settleSeek(ticket)) player.playVideo()
  }

  const onState = (event: YTEvent, builtId: number) => {
    const ticket = accept(event, builtId)
    if (!ticket || !player || !isInteger(event.data) || !STATE.has(event.data)) return
    if (event.data === 5) {
      settleSeek(ticket)
      dispatchPosition(ticket, sample())
      return
    }
    if (event.data === -1 || event.data === 3) {
      dispatchPosition(ticket, sample())
      return
    }
    if ((event.data === 0 || event.data === 1) && loadedId() !== ticket.videoId) return
    if (event.data === 1) {
      hooks.dispatch({ itemId: ticket.itemId, attempt: ticket.attempt, event: 'playing' })
      return
    }
    const position = sample()
    if (event.data === 0) {
      hooks.dispatch({ itemId: ticket.itemId, attempt: ticket.attempt, event: 'ended', ...(position === null ? {} : { position }) })
      return
    }
    hooks.dispatch({ itemId: ticket.itemId, attempt: ticket.attempt, event: 'paused', ...(position === null ? {} : { position }) })
  }

  const onError = (event: YTEvent, builtId: number) => {
    const ticket = accept(event, builtId)
    if (!ticket || ticket.failed || !isInteger(event.data)) return
    fail(ticket, failureFor(event.data))
  }

  const onBlocked = (event: YTEvent, builtId: number) => {
    if (!accept(event, builtId)) return
    hooks.onAutoplayBlocked()
  }

  const construct = (ticket: Ticket) => {
    if (player || rejected || ticket.retired || current !== ticket) return
    const slot = host.querySelector('[data-moments-player-slot]')
    const api = window.YT
    if (!(slot instanceof HTMLElement) || !api?.Player) {
      fail(ticket, { kind: 'unknown' })
      return
    }
    const rect = host.getBoundingClientRect()
    const width = Math.round(rect.width)
    const height = Math.round(rect.height)
    const iframe = document.createElement('iframe')
    iframe.title = 'YouTube video player'
    iframe.tabIndex = 0
    iframe.setAttribute('allowfullscreen', '')
    if (width > 0) iframe.width = String(width)
    if (height > 0) iframe.height = String(height)
    const params = new URLSearchParams({
      enablejsapi: '1',
      playsinline: '1',
      origin: window.location.origin,
    })
    iframe.src = `https://www.youtube-nocookie.com/embed/${ticket.videoId}?${params}`
    slot.replaceWith(iframe)
    instanceId += 1
    const builtId = instanceId
    ticket.instanceId = builtId
    try {
      const created = new api.Player(iframe, {
        ...(width > 0 ? { width } : {}),
        ...(height > 0 ? { height } : {}),
        events: {
          onReady: event => onReady(event, builtId),
          onStateChange: event => onState(event, builtId),
          onError: event => onError(event, builtId),
          onAutoplayBlocked: event => onBlocked(event, builtId),
        },
      })
      if (created.getIframe().parentNode !== host) {
        try { created.destroy() } catch { /* the mismatch is already terminal */ }
        instanceId += 1
        rejected = true
        fail(ticket, { kind: 'unknown' })
        return
      }
      player = created
      rememberedId = ticket.videoId
    } catch {
      rejected = true
      fail(ticket, { kind: 'unknown' })
    }
  }

  const boot = (ticket: Ticket) => {
    const start = () => {
      if (ticket.retired || current !== ticket) return
      construct(ticket)
    }
    if (window.YT?.Player) start()
    else loadApi().then(start, () => {
      if (ticket.retired || current !== ticket) return
      fail(ticket, { kind: 'unknown' })
    })
  }

  const command = (ticket: Ticket) => {
    if (!player) return
    const loaded = loadedId()
    if (ticket.replay || loaded !== ticket.videoId) {
      pendingSeek = !ticket.replay && ticket.resume && finitePosition(ticket.position) !== null ? ticket.position : null
      pendingTicket = pendingSeek === null ? null : ticket
      player.loadVideoById(ticket.videoId)
      rememberedId = ticket.videoId
      return
    }
    pendingSeek = null
    pendingTicket = null
    player.playVideo()
  }

  return {
    play(request) {
      if (current) current.retired = true
      const ticket: Ticket = { ...request, retired: false, failed: false, instanceId }
      current = ticket
      hooks.onResumeLabel(false)
      if (rejected) {
        fail(ticket, { kind: 'unknown' })
        return
      }
      if (!player) {
        pendingSeek = !ticket.replay && ticket.resume && finitePosition(ticket.position) !== null ? ticket.position : null
        pendingTicket = pendingSeek === null ? null : ticket
        boot(ticket)
        return
      }
      command(ticket)
    },
    pause() {
      const ticket = current
      if (!player || !ticket || ticket.retired) return
      const position = sample()
      player.pauseVideo()
      if (position !== null) {
        hooks.dispatch({ itemId: ticket.itemId, attempt: ticket.attempt, event: 'paused', position })
      }
    },
    retire() {
      const ticket = current
      if (player && ticket && !ticket.retired) {
        const position = sample()
        if (position !== null) {
          hooks.dispatch({ itemId: ticket.itemId, attempt: ticket.attempt, event: 'position', position })
        }
        player.pauseVideo()
      }
      if (ticket) ticket.retired = true
      pendingSeek = null
      pendingTicket = null
    },
    dispose() {
      if (current) current.retired = true
      pendingSeek = null
      pendingTicket = null
      const dying = player
      player = null
      rememberedId = null
      instanceId += 1
      try { dying?.destroy() } catch { /* unmount still drops the instance */ }
    },
  }
}
