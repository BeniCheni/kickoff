import { afterEach, expect, it } from 'vitest'
import { createYouTubePlayer, type PlayRequest, type PlayerHooks, type PlayerNotice } from '../../src/lib/momentsPlayer'

type Fake = {
  iframe: HTMLIFrameElement
  options: {
    width?: number
    height?: number
    events: {
      onReady: (event: { target: Fake; data: number }) => void
      onStateChange: (event: { target: Fake; data: number }) => void
      onError: (event: { target: Fake; data: number }) => void
      onAutoplayBlocked: (event: { target: Fake; data: number }) => void
    }
  }
  time: number
  url: string
  loadArgs: unknown[]
  seekArgs: unknown[][]
  destroyed: boolean
  playCount: number
  pauseCount: number
  cueCount: number
  getCurrentTime: () => number
  getVideoUrl: () => string
  getIframe: () => HTMLIFrameElement
  loadVideoById: (request: { videoId: string; startSeconds: number }) => void
  cueVideoById: (videoId: string) => void
  playVideo: () => void
  pauseVideo: () => Promise<void>
  seekTo: (seconds: number, allow: boolean) => void
  destroy: () => void
}

const fakes: Fake[] = []
let constructions = 0
let reparent = false

class FakePlayer implements Fake {
  iframe: HTMLIFrameElement
  options: Fake['options']
  time = 0
  url = ''
  loadArgs: unknown[] = []
  seekArgs: unknown[][] = []
  destroyed = false
  playCount = 0
  pauseCount = 0
  cueCount = 0
  constructor(element: HTMLElement, options: Fake['options']) {
    constructions += 1
    const iframe = element instanceof HTMLIFrameElement ? element : document.createElement('iframe')
    if (iframe !== element) element.replaceWith(iframe)
    if (reparent) document.body.append(iframe)
    this.iframe = iframe
    this.options = options
    fakes.push(this)
  }
  getIframe() { return this.iframe }
  getCurrentTime() { return this.time }
  getVideoUrl() { return this.url }
  loadVideoById(request: { videoId: string; startSeconds: number }) {
    this.loadArgs.push(request)
    this.url = `https://www.youtube.com/watch?v=${request.videoId}`
    this.time = 0
    for (const data of [-1, 3]) this.options.events.onStateChange({ target: this, data })
    this.time = request.startSeconds
  }
  cueVideoById() { this.cueCount += 1 }
  playVideo() { this.playCount += 1 }
  pauseVideo() { this.pauseCount += 1; return Promise.resolve() }
  seekTo(seconds: number, allow: boolean) { this.seekArgs.push([seconds, allow]); this.time = seconds }
  destroy() { this.destroyed = true; this.iframe.remove() }
}

const request = (over: Partial<PlayRequest> = {}): PlayRequest => ({
  itemId: 'item-a', attempt: 1, videoId: 'aaaaaaaaaaa', position: 0, replay: false, resume: false, ...over,
})

function installYT() {
  window.YT = { Player: FakePlayer as unknown as NonNullable<Window['YT']>['Player'] }
}

function mount() {
  const host = document.createElement('div')
  host.dataset.momentsPlayerHost = 'true'
  const slot = document.createElement('div')
  slot.dataset.momentsPlayerSlot = 'true'
  host.append(slot)
  host.getBoundingClientRect = () => ({ x: 0, y: 0, top: 0, left: 0, right: 480, bottom: 270, width: 480, height: 270, toJSON() { return {} } })
  document.body.append(host)
  return host
}

function harness() {
  const events: PlayerNotice[] = []
  const labels: boolean[] = []
  let blocked = 0
  const hooks: PlayerHooks = {
    dispatch: event => events.push(event),
    onResumeLabel: visible => labels.push(visible),
    onAutoplayBlocked: () => { blocked += 1 },
  }
  return { events, labels, hooks, blocked: () => blocked }
}

afterEach(() => {
  reparent = false
  fakes.splice(0)
  constructions = 0
  document.body.replaceChildren()
  document.querySelectorAll('script[data-moments-youtube-api]').forEach(node => node.remove())
  delete window.YT
  delete window.onYouTubeIframeAPIReady
})

const apiScripts = () => document.querySelectorAll('script[src="https://www.youtube.com/iframe_api"]')

it('inserts no API script before Play and one script after', () => {
  const host = mount()
  const { hooks } = harness()
  const player = createYouTubePlayer(host, hooks)
  expect(apiScripts()).toHaveLength(0)
  player.play(request())
  expect(apiScripts()).toHaveLength(1)
  player.play(request({ attempt: 2 }))
  expect(apiScripts()).toHaveLength(1)
  expect(host.querySelector('iframe')).toBeNull()
})

it('constructs once when the API is already present and passes the measured box', () => {
  installYT()
  const host = mount()
  const { hooks } = harness()
  const player = createYouTubePlayer(host, hooks)
  player.play(request())
  expect(apiScripts()).toHaveLength(0)
  expect(constructions).toBe(1)
  const fake = fakes[0]!
  expect(fake.options.width).toBe(480)
  expect(fake.options.height).toBe(270)
  expect(fake.iframe.width).toBe('480')
  expect(fake.iframe.height).toBe('270')
  expect(fake.iframe.parentNode).toBe(host)
  expect(fake.iframe.getAttribute('allow')).toBe('autoplay; encrypted-media')
  expect(fake.iframe.getAttribute('referrerpolicy')).toBe('strict-origin-when-cross-origin')
  const src = new URL(fake.iframe.src)
  expect(src.host).toBe('www.youtube-nocookie.com')
  expect(src.pathname).toBe('/embed/aaaaaaaaaaa')
  expect(src.searchParams.get('enablejsapi')).toBe('1')
  expect(src.searchParams.get('playsinline')).toBe('1')
  expect(src.searchParams.get('origin')).toBe(window.location.origin)
  expect(src.searchParams.has('modestbranding')).toBe(false)
  expect(src.searchParams.get('autoplay')).toBeNull()
  expect(src.searchParams.get('controls')).toBeNull()
  expect(fake.cueCount).toBe(0)
})

it('drops a stale attempt and a stale player target before dispatch', () => {
  installYT()
  const { hooks, events } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request())
  const fake = fakes[0]!
  fake.getCurrentTime = () => Number.NaN
  player.retire()
  fake.options.events.onError({ target: fake, data: 150 })
  player.play(request({ attempt: 2 }))
  const other = { ...fake }
  fake.options.events.onError({ target: other, data: 100 })
  expect(events).toEqual([])
  fake.options.events.onError({ target: fake, data: 100 })
  expect(events).toEqual([{ itemId: 'item-a', attempt: 2, event: 'failure', failure: { kind: 'unavailable', providerError: 100 } }])
})

it('dispatches one terminal failure per attempt', () => {
  installYT()
  const { hooks, events } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request())
  const fake = fakes[0]!
  fake.options.events.onError({ target: fake, data: 150 })
  fake.options.events.onError({ target: fake, data: 5 })
  expect(events).toHaveLength(1)
  expect(events[0]).toMatchObject({ attempt: 1, failure: { kind: 'owner-blocked', providerError: 150 } })
})

it.each([
  [101, 'owner-blocked'],
  [150, 'owner-blocked'],
  [2, 'unavailable'],
  [5, 'unavailable'],
  [100, 'unavailable'],
  [153, 'unknown'],
  [999, 'unknown'],
] as const)('maps provider code %s to %s', (code, kind) => {
  installYT()
  const { hooks, events } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request())
  const fake = fakes[0]!
  fake.options.events.onError({ target: fake, data: code })
  expect(events[0]).toMatchObject({ event: 'failure', failure: { kind, providerError: code } })
})

it('ignores a non-integer error and still accepts a later integer on that attempt', () => {
  installYT()
  const { hooks, events } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request())
  const fake = fakes[0]!
  fake.options.events.onError({ target: fake, data: 1.5 })
  expect(events).toEqual([])
  fake.options.events.onError({ target: fake, data: 153 })
  expect(events).toHaveLength(1)
})

it('keeps a zero sample and drops negative and NaN samples', () => {
  installYT()
  const { hooks, events } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request())
  const fake = fakes[0]!
  fake.options.events.onReady({ target: fake, data: 0 })
  fake.url = 'https://www.youtube.com/watch?v=aaaaaaaaaaa'
  for (const time of [Number.NaN, -1, Number.POSITIVE_INFINITY]) {
    fake.time = time
    fake.options.events.onStateChange({ target: fake, data: 2 })
  }
  expect(events.every(event => event.event !== 'position' && !('position' in event && typeof event.position === 'number' && !(event.position >= 0)))).toBe(true)
  expect(events.filter(event => event.event === 'paused').every(event => !('position' in event))).toBe(true)
  fake.time = 0
  fake.options.events.onStateChange({ target: fake, data: 2 })
  expect(events.at(-1)).toMatchObject({ event: 'paused', position: 0 })
})

it('loads with startSeconds, ignores pre-play samples and labels only an observed resume', () => {
  installYT()
  const { hooks, events, labels } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request())
  const fake = fakes[0]!
  fake.options.events.onReady({ target: fake, data: 0 })
  player.play(request({ itemId: 'item-b', attempt: 3, videoId: 'bbbbbbbbbbb', position: 42, resume: true }))
  expect(fake.loadArgs).toEqual([{ videoId: 'bbbbbbbbbbb', startSeconds: 42 }])
  expect(fake.seekArgs).toEqual([])
  expect(events.filter(event => event.itemId === 'item-b')).toEqual([])
  expect(labels).not.toContain(true)
  fake.getCurrentTime = () => Number.NaN
  fake.options.events.onStateChange({ target: fake, data: 1 })
  expect(labels).not.toContain(true)
  fake.getCurrentTime = () => 41.5
  fake.options.events.onStateChange({ target: fake, data: 3 })
  expect(events.at(-1)).toMatchObject({ event: 'position', position: 41.5 })
  expect(labels.at(-1)).toBe(true)
})

it('fresh construction seeks then plays, and does not sample the requested target as proof', () => {
  installLateYT()
  const { hooks, events, labels } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request({ position: 42, resume: true }))
  const provider = late[0]!
  provider.ready()
  expect(provider.calls).toEqual(['seekTo(42)', 'playVideo'])
  expect(events).toEqual([])
  expect(labels).not.toContain(true)
  provider.options.events.onStateChange({ target: provider as unknown as Fake, data: 1 })
  expect(events).toContainEqual({ itemId: 'item-a', attempt: 1, event: 'position', position: 42 })
  expect(labels.at(-1)).toBe(true)
})

it('retiring a pending reload cannot overwrite the cached position with a pre-seek zero', () => {
  installYT()
  const { hooks, events } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request())
  const fake = fakes[0]!
  fake.options.events.onReady({ target: fake, data: 0 })
  player.play(request({ videoId: 'bbbbbbbbbbb', position: 42, resume: true }))
  fake.time = 0
  player.pause()
  player.retire()
  expect(events.filter(event => 'position' in event)).toEqual([])
})

it('pre-ready methods cannot send commands or replace a cached resume position', () => {
  installYT()
  const { hooks, events } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request({ position: 42, resume: true }))
  const fake = fakes[0]!
  player.pause()
  player.retire()
  expect(fake.pauseCount).toBe(0)
  expect(events).toEqual([])
})

it('a rejected reload retains the cached position until matching playback starts', () => {
  installYT()
  const { hooks, events, labels } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request())
  const fake = fakes[0]!
  fake.options.events.onReady({ target: fake, data: 0 })
  fake.loadVideoById = () => { throw new Error('provider unavailable') }
  player.play(request({ videoId: 'bbbbbbbbbbb', position: 42, resume: true }))
  player.pause()
  player.retire()
  expect(events.filter(event => 'position' in event)).toEqual([])
  expect(labels).not.toContain(true)
})

it.each([false, true])('a second Play during an unsettled resume keeps the seek after retire=%s', retire => {
  installYT()
  const { hooks, events, labels } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request())
  const fake = fakes[0]!
  fake.options.events.onReady({ target: fake, data: 0 })
  const resumed = request({ videoId: 'bbbbbbbbbbb', position: 42, resume: true })
  player.play(resumed)
  fake.time = 0
  if (retire) player.retire()
  player.play({ ...resumed, attempt: 2 })
  fake.time = 0
  fake.options.events.onStateChange({ target: fake, data: 3 })
  player.pause()
  expect(fake.loadArgs).toEqual([{ videoId: 'bbbbbbbbbbb', startSeconds: 42 }, { videoId: 'bbbbbbbbbbb', startSeconds: 42 }])
  expect(events.filter(event => 'position' in event)).toEqual([])
  expect(labels).not.toContain(true)
})

it('a replay requested before ready is loaded from zero at ready', () => {
  installLateYT()
  const { hooks } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request())
  player.play(request({ attempt: 2, replay: true }))
  late[0]!.ready()
  expect(late[0]!.calls).toEqual(['loadVideoById(aaaaaaaaaaa,0)'])
})

it('a zero-position retry that never played does not claim to resume', () => {
  installYT()
  const { hooks, labels } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request({ resume: true }))
  const fake = fakes[0]!
  fake.options.events.onReady({ target: fake, data: 0 })
  fake.options.events.onStateChange({ target: fake, data: 1 })
  expect(fake.seekArgs).toEqual([])
  expect(labels).not.toContain(true)
})

it('does not label a same-source play or a replay', () => {
  installYT()
  const { hooks, labels } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request())
  const fake = fakes[0]!
  fake.url = 'https://www.youtube.com/watch?v=aaaaaaaaaaa'
  fake.options.events.onReady({ target: fake, data: 0 })
  player.play(request({ attempt: 2, position: 8 }))
  expect(fake.playCount).toBe(2)
  expect(fake.loadArgs).toEqual([])
  player.play(request({ attempt: 3, replay: true, position: 0 }))
  expect(fake.loadArgs).toEqual([{ videoId: 'aaaaaaaaaaa', startSeconds: 0 }])
  expect(fake.seekArgs).toEqual([])
  expect(labels).not.toContain(true)
  expect(fake.cueCount).toBe(0)
})

it('pause does not return the provider promise; destroy runs on dispose and not on retire', () => {
  installYT()
  const { hooks, events } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request())
  const fake = fakes[0]!
  fake.options.events.onReady({ target: fake, data: 0 })
  fake.time = 4
  expect(player.pause()).toBeUndefined()
  expect(fake.pauseCount).toBe(1)
  expect(events.at(-1)).toMatchObject({ event: 'paused', position: 4 })
  player.retire()
  expect(fake.destroyed).toBe(false)
  expect(events.some(event => event.event === 'position' && event.position === 4)).toBe(true)
  fake.options.events.onError({ target: fake, data: 150 })
  expect(events.some(event => event.event === 'failure')).toBe(false)
  player.dispose()
  expect(fake.destroyed).toBe(true)
  expect(fakes.filter(item => !item.destroyed)).toHaveLength(0)
})

it('treats a parent mismatch as one unknown and does not construct again', () => {
  reparent = true
  installYT()
  const { hooks, events } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request())
  player.play(request({ attempt: 2 }))
  expect(constructions).toBe(1)
  expect(events.map(event => event.event === 'failure' && event.failure.kind)).toEqual(['unknown', 'unknown'])
})

it('a script error is one unknown and does not construct', async () => {
  const { hooks, events } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request())
  const script = document.querySelector<HTMLScriptElement>('script[data-moments-youtube-api]')!
  script.onerror?.call(script, new Event('error'))
  await Promise.resolve()
  expect(events).toEqual([{ itemId: 'item-a', attempt: 1, event: 'failure', failure: { kind: 'unknown' } }])
  expect(constructions).toBe(0)
})

it('onAutoplayBlocked stays silent aside from the neutral hook', () => {
  installYT()
  const { hooks, events, blocked } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request())
  const fake = fakes[0]!
  fake.options.events.onAutoplayBlocked({ target: fake, data: 0 })
  expect(blocked()).toBe(1)
  expect(events).toEqual([])
})

it('rejects playing and ended when the loaded video id does not match the attempt', () => {
  installYT()
  const { hooks, events } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request())
  const fake = fakes[0]!
  fake.options.events.onReady({ target: fake, data: 0 })
  fake.url = 'https://www.youtube.com/watch?v=bbbbbbbbbbb'
  fake.options.events.onStateChange({ target: fake, data: 1 })
  fake.options.events.onStateChange({ target: fake, data: 0 })
  expect(events).toEqual([])
  fake.url = 'https://www.youtube.com/watch?v=aaaaaaaaaaa'
  fake.time = 3
  fake.options.events.onStateChange({ target: fake, data: 0 })
  expect(events.at(-1)).toMatchObject({ event: 'ended', position: 3 })
})

it('a retired in-flight script does not construct, and StrictMode cleanup leaves one instance', async () => {
  const firstHooks = harness()
  const firstHost = mount()
  const first = createYouTubePlayer(firstHost, firstHooks.hooks)
  first.play(request())
  first.play(request({ attempt: 2, itemId: 'item-b', videoId: 'bbbbbbbbbbb' }))
  installYT()
  window.onYouTubeIframeAPIReady?.()
  await Promise.resolve()
  expect(constructions).toBe(1)
  expect(fakes[0]!.iframe.src).toContain('bbbbbbbbbbb')
  first.dispose()
  expect(fakes[0]!.destroyed).toBe(true)
  const secondHooks = harness()
  const second = createYouTubePlayer(mount(), secondHooks.hooks)
  second.play(request({ attempt: 1 }))
  expect(fakes.filter(item => !item.destroyed)).toHaveLength(1)
  fakes[0]!.options.events.onError({ target: fakes[0]!, data: 150 })
  expect(firstHooks.events).toEqual([])
  expect(secondHooks.events).toEqual([])
})

/** The reference's contract, not the fake's convenience: `onReady` is when a player "is ready
 *  to begin receiving API calls", so this conservative stress stub withholds command methods until then. Their absence is not specified. */
class LatePlayer {
  iframe: HTMLIFrameElement
  options: Fake['options']
  calls: string[] = []
  time = 0
  url: string
  playVideo?: () => void
  pauseVideo?: () => void
  loadVideoById?: (request: { videoId: string; startSeconds: number }) => void
  seekTo?: (seconds: number, allow: boolean) => void
  getCurrentTime?: () => number
  getVideoUrl?: () => string
  constructor(element: HTMLElement, options: Fake['options']) {
    this.iframe = element as HTMLIFrameElement
    this.options = options
    this.url = `https://www.youtube.com/watch?v=${new URL(this.iframe.src).pathname.split('/').pop()}`
    late.push(this)
  }
  getIframe() { return this.iframe }
  destroy() { this.calls.push('destroy'); this.iframe.remove() }
  ready() {
    this.playVideo = () => { this.calls.push('playVideo') }
    this.pauseVideo = () => { this.calls.push('pauseVideo') }
    this.loadVideoById = request => { this.calls.push(`loadVideoById(${request.videoId},${request.startSeconds})`); this.url = `https://www.youtube.com/watch?v=${request.videoId}`; this.time = request.startSeconds }
    this.seekTo = seconds => { this.calls.push(`seekTo(${seconds})`); this.time = seconds }
    this.getCurrentTime = () => this.time
    this.getVideoUrl = () => this.url
    this.options.events.onReady({ target: this as unknown as Fake, data: 0 })
  }
}
const late: LatePlayer[] = []
afterEach(() => { late.splice(0) })
function installLateYT() {
  window.YT = { Player: LatePlayer as unknown as NonNullable<Window['YT']>['Player'] }
}

it('before onReady, pause, retire and another Play send nothing and do not throw', () => {
  installLateYT()
  const { hooks, events } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request())
  expect(() => player.pause()).not.toThrow()
  expect(() => player.play(request({ attempt: 2 }))).not.toThrow()
  expect(() => player.play(request({ itemId: 'item-b', attempt: 1, videoId: 'bbbbbbbbbbb' }))).not.toThrow()
  expect(() => player.retire()).not.toThrow()
  expect(late).toHaveLength(1)
  expect(late[0]!.calls).toEqual([])
  expect(events).toEqual([])
})

it('at onReady the current attempt loads its own video, not the one the frame was built with', () => {
  installLateYT()
  const { hooks, events } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request())
  player.play(request({ itemId: 'item-b', attempt: 1, videoId: 'bbbbbbbbbbb' }))
  const provider = late[0]!
  expect(provider.iframe.src).toContain('/embed/aaaaaaaaaaa')
  provider.ready()
  expect(provider.calls).toEqual(['loadVideoById(bbbbbbbbbbb,0)'])
  provider.options.events.onStateChange({ target: provider as unknown as Fake, data: 1 })
  expect(events).toEqual([{ itemId: 'item-b', attempt: 1, event: 'position', position: 0 }, { itemId: 'item-b', attempt: 1, event: 'playing' }])
})

it('an attempt retired before onReady does not start at onReady', () => {
  installLateYT()
  const { hooks, events } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request())
  player.retire()
  late[0]!.ready()
  expect(late[0]!.calls).toEqual([])
  expect(events).toEqual([])
})

it('drops a state change that arrives for a retired attempt', () => {
  installYT()
  const { hooks, events } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request())
  const fake = fakes[0]!
  fake.url = 'https://www.youtube.com/watch?v=aaaaaaaaaaa'
  fake.getCurrentTime = () => Number.NaN
  player.retire()
  for (const data of [1, 2, 0]) fake.options.events.onStateChange({ target: fake, data })
  expect(events).toEqual([])
})

it('removes a failed API script, so a Retry leaves one script element', async () => {
  const { hooks, events } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request())
  const script = document.querySelector<HTMLScriptElement>('script[data-moments-youtube-api]')!
  script.onerror?.call(script, new Event('error'))
  await Promise.resolve()
  expect(apiScripts()).toHaveLength(0)
  player.play(request({ attempt: 2 }))
  expect(apiScripts()).toHaveLength(1)
  expect(events).toHaveLength(1)
})
