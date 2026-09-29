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
  loadVideoById: (videoId: string) => void
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
  loadVideoById(videoId: string) {
    this.loadArgs.push(videoId)
    this.url = `https://www.youtube.com/watch?v=${videoId}`
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

it('loads a different video without startSeconds and labels resume only after a finite sample', () => {
  installYT()
  const { hooks, events, labels } = harness()
  const player = createYouTubePlayer(mount(), hooks)
  player.play(request())
  const fake = fakes[0]!
  fake.url = 'https://www.youtube.com/watch?v=aaaaaaaaaaa'
  fake.getCurrentTime = () => Number.NaN
  player.play(request({ itemId: 'item-b', attempt: 3, videoId: 'bbbbbbbbbbb', position: 12, resume: true }))
  expect(fake.loadArgs).toEqual(['bbbbbbbbbbb'])
  expect(fake.seekArgs).toEqual([])
  fake.options.events.onStateChange({ target: fake, data: 5 })
  expect(fake.seekArgs).toEqual([[12, true]])
  expect(labels).not.toContain(true)
  expect(events.some(event => event.event === 'failure')).toBe(false)
  fake.getCurrentTime = () => fake.time
  player.play(request({ itemId: 'item-a', attempt: 4, videoId: 'aaaaaaaaaaa', position: 0, resume: true }))
  fake.options.events.onStateChange({ target: fake, data: 5 })
  expect(fake.loadArgs.at(-1)).toBe('aaaaaaaaaaa')
  expect(typeof fake.loadArgs.at(-1)).toBe('string')
  expect(labels).toContain(true)
  expect(events.some(event => event.event === 'position' && event.position === 0)).toBe(true)
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
  expect(fake.loadArgs).toEqual(['aaaaaaaaaaa'])
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
